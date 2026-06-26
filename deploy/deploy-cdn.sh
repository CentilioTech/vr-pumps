#!/usr/bin/env bash
# =====================================================================
# VR Pumps — versioned CDN deploy (mirrors Centilio account/drive/sign)
# HTML  -> tools1 nginx  (https://tools1.centilio.com/vrpumps/)
# _next -> DO Spaces us-cdn1 (sfo3)  https://us-cdn1.centilio.com/vrpumps/<VER>/
# Each run publishes a NEW immutable version folder => instant rollback.
#
# Run AS ROOT on tools1:
#   export AWS_ACCESS_KEY_ID=...      # vault "DO Space API key - Deploy-All-Full" (username)
#   export AWS_SECRET_ACCESS_KEY=...  # same item (password)
#   VER=v2 bash deploy/deploy-cdn.sh  # BUMP VER on every deploy (v1, v2, ...)
# =====================================================================
set -euo pipefail
VER="${VER:-v1}"
REPO="https://github.com/CentilioTech/vr-pumps"
BRANCH="${BRANCH:-main}"
BUILD_DIR="/opt/centilio-build/vrpumps/src"
DOCROOT="/var/www/vrpumps"
SPACE="us-cdn1"; REGION="sfo3"; EP="https://${REGION}.digitaloceanspaces.com"
CDN_BASE="https://${SPACE}.centilio.com/vrpumps/${VER}"
CC="public,max-age=31536000,immutable"
log(){ printf '\n\033[1;34m==> %s\033[0m\n' "$*"; }

: "${AWS_ACCESS_KEY_ID:?set DO Spaces access key}"
: "${AWS_SECRET_ACCESS_KEY:?set DO Spaces secret}"
command -v aws >/dev/null || pip3 install --break-system-packages -q awscli

# 1. source
if [ -d "$BUILD_DIR/.git" ]; then
  git -C "$BUILD_DIR" fetch --depth 1 origin "$BRANCH"; git -C "$BUILD_DIR" reset --hard FETCH_HEAD
else
  git clone --depth 1 -b "$BRANCH" "$REPO" "$BUILD_DIR"
fi
cd "$BUILD_DIR"

# 2. memory headroom (3.7G box) — temp swap, auto-removed
SWAP=0
if ! swapon --show | grep -q .; then fallocate -l 2G /tmp/vrswap && chmod 600 /tmp/vrswap && mkswap /tmp/vrswap >/dev/null && swapon /tmp/vrswap && SWAP=1; fi
trap '[ "$SWAP" = 1 ] && swapoff /tmp/vrswap 2>/dev/null && rm -f /tmp/vrswap || true' EXIT

# 3. build with CDN assetPrefix
log "build -> assetPrefix $CDN_BASE"
npm ci
VRPUMPS_CDN_BASE="$CDN_BASE" npx next build
[ -f out/index.html ] || { echo "build produced no out/index.html"; exit 1; }
grep -q "$CDN_BASE/_next" out/index.html || { echo "HTML does not reference CDN base $CDN_BASE — aborting"; exit 1; }

# 4. upload _next to the versioned CDN folder (self-contained: js+css+fonts+media)
log "upload out/_next -> s3://$SPACE/vrpumps/$VER/_next"
S3="s3://$SPACE/vrpumps/$VER/_next"; SRC=out/_next
aws s3 cp "$SRC" "$S3" --recursive --exclude "*" --include "*.js"    --content-type application/javascript --cache-control "$CC" --acl public-read --endpoint-url "$EP" --only-show-errors
aws s3 cp "$SRC" "$S3" --recursive --exclude "*" --include "*.css"   --content-type text/css               --cache-control "$CC" --acl public-read --endpoint-url "$EP" --only-show-errors
aws s3 cp "$SRC" "$S3" --recursive --exclude "*" --include "*.woff2" --content-type font/woff2             --cache-control "$CC" --acl public-read --endpoint-url "$EP" --only-show-errors
aws s3 cp "$SRC" "$S3" --recursive --exclude "*.js" --exclude "*.css" --exclude "*.woff2"                  --cache-control "$CC" --acl public-read --endpoint-url "$EP" --only-show-errors

# 5. publish HTML (assets live on the CDN; keep docroot lean)
log "publish HTML -> $DOCROOT"
tar czf "/root/vrpumps-docroot.bak.$(date +%Y%m%dT%H%M%SZ).tgz" -C "$DOCROOT" . 2>/dev/null || true
rsync -a --delete out/ "$DOCROOT"/
rm -rf "$DOCROOT/_next"
chown -R root:root "$DOCROOT"; chmod -R a+rX "$DOCROOT"

# 6. smoke test
log "verify"
curl -s -o /dev/null -w "page  /vrpumps/ -> %{http_code}\n" https://tools1.centilio.com/vrpumps/
JS=$(grep -o "$CDN_BASE/_next/static/chunks/[^\"]*\.js" out/index.html | head -1)
[ -n "$JS" ] && curl -s -o /dev/null -w "cdn   asset    -> %{http_code}\n" "$JS"
echo "Deployed vrpumps $VER (HTML on tools1, _next on $CDN_BASE)."
echo "Rollback: re-run with the PREVIOUS VER (its CDN folder is still there) to regenerate matching HTML, or restore /root/vrpumps-docroot.bak.<ts>.tgz"
