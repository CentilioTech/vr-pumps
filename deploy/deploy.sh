#!/usr/bin/env bash
# =====================================================================
# VR Pumps — front-end deploy script (static export -> nginx)
# Target: tools1.centilio.com (167.233.49.154), served at /vrpumps/
# Run AS ROOT ON tools1:   bash deploy/deploy.sh
# =====================================================================
# What it does:
#   1. (optional) adds a temporary swapfile (RAM is tight: 3.7G box)
#   2. pulls/clones the repo into the build dir
#   3. npm ci + next build  (output:'export' -> ./out)
#   4. rsync ./out -> /var/www/vrpumps/   (atomic-ish, --delete)
#   5. removes the temporary swap
# nginx is NOT touched here — the location block is permanent
# (see deploy/DEPLOY.md). This script only refreshes the static files.
# =====================================================================
set -euo pipefail

REPO="https://github.com/CentilioTech/vr-pumps"
BRANCH="${BRANCH:-main}"
BUILD_DIR="/opt/centilio-build/vrpumps/src"
DOCROOT="/var/www/vrpumps"
SWAPFILE="/tmp/vrpumps-build.swap"
ADD_SWAP="${ADD_SWAP:-1}"          # set ADD_SWAP=0 to skip swap

log(){ printf '\n\033[1;34m==> %s\033[0m\n' "$*"; }

# ---- 0. preconditions -------------------------------------------------
command -v node >/dev/null || { echo "node not found"; exit 1; }
command -v rsync >/dev/null || { echo "rsync not found"; exit 1; }
log "node $(node -v) / npm $(npm -v)"

# ---- 1. temporary swap (build memory headroom) -----------------------
SWAP_ADDED=0
if [ "$ADD_SWAP" = "1" ] && ! swapon --show | grep -q .; then
    log "adding temporary 2G swap ($SWAPFILE)"
    fallocate -l 2G "$SWAPFILE"
    chmod 600 "$SWAPFILE"; mkswap "$SWAPFILE" >/dev/null; swapon "$SWAPFILE"
    SWAP_ADDED=1
fi
cleanup(){ if [ "$SWAP_ADDED" = "1" ]; then swapoff "$SWAPFILE" 2>/dev/null || true; rm -f "$SWAPFILE"; log "removed temp swap"; fi; }
trap cleanup EXIT

# ---- 2. fetch source --------------------------------------------------
if [ -d "$BUILD_DIR/.git" ]; then
    log "updating repo in $BUILD_DIR"
    git -C "$BUILD_DIR" fetch --depth 1 origin "$BRANCH"
    git -C "$BUILD_DIR" reset --hard "origin/$BRANCH"
else
    log "cloning $REPO -> $BUILD_DIR"
    rm -rf "$BUILD_DIR"; mkdir -p "$(dirname "$BUILD_DIR")"
    git clone --depth 1 -b "$BRANCH" "$REPO" "$BUILD_DIR"
fi

# ---- 2b. ensure static-export config ---------------------------------
# The repo's next.config.ts already sets output:'export' + basePath:'/vrpumps'.
# If a contributor reverts it, re-assert here so the deploy never breaks:
cd "$BUILD_DIR"
if ! grep -q 'output: "export"' next.config.ts 2>/dev/null && ! grep -q "output: 'export'" next.config.ts 2>/dev/null; then
    log "next.config.ts missing static-export config — writing canonical version"
    cat > next.config.ts <<'EOF'
import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  output: "export",
  basePath: "/vrpumps",
  trailingSlash: true,
  images: { unoptimized: true },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};
export default nextConfig;
EOF
fi

# ---- 3. build ---------------------------------------------------------
log "npm ci"
nice -n 15 npm ci
log "next build (static export)"
nice -n 15 npx next build
[ -f out/index.html ] || { echo "build did not produce out/index.html"; exit 1; }

# ---- 4. publish -------------------------------------------------------
log "publishing -> $DOCROOT"
mkdir -p "$DOCROOT"
rsync -a --delete out/ "$DOCROOT"/
chown -R root:root "$DOCROOT"
chmod -R a+rX "$DOCROOT"

# ---- 5. verify --------------------------------------------------------
log "verify"
curl -s -o /dev/null -w "https://tools1.centilio.com/vrpumps/ -> %{http_code}\n" https://tools1.centilio.com/vrpumps/ || true
echo "Done. Pages: $(find "$DOCROOT" -name index.html | wc -l)"
