# VR Pumps — Deployment Runbook

Live front-end: **https://tools1.centilio.com/vrpumps/**
Server: **tools1** — `167.233.49.154` (Ubuntu 24.04, Vault item `Tools1 Centilio Server`)

This repo is the **Next.js front-end only**. It is deployed as a **static export**
served by nginx, mirroring how the existing `/slack/` front-end on tools1 is served.
The API backend (Java/Tomcat/Postgres IAM webapp) is a separate codebase — see
[`docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md).

---

## 1. How it is served (the "tools1 way")

nginx terminates TLS for `tools1.centilio.com` and routes by sub-path to each app.
VR Pumps adds **one location block** to the existing vhost
(`/etc/nginx/sites-enabled/tools1.centilio.com`):

```nginx
# ---- VR Pumps (static Next.js export, basePath /vrpumps) ----
location = /vrpumps { return 301 /vrpumps/; }
location /vrpumps/ {
    alias /var/www/vrpumps/;
    try_files $uri $uri/ /vrpumps/index.html;
}
```

* `location /` (root) still proxies to Tomcat `:8080` — nginx matches the more
  specific `/vrpumps/` prefix first, so the existing apps are untouched.
* Static files live in `/var/www/vrpumps/`.
* **`basePath: '/vrpumps'`** in `next.config.ts` is what makes every asset resolve
  under `/vrpumps/_next/...` (never bare `/_next/`). Do not remove it — without it,
  deep-route reloads and assets 404 against the Tomcat root app.

---

## 2. Redeploy (after pushing changes to `main`)

```bash
# on tools1, as root
bash deploy/deploy.sh
```

`deploy/deploy.sh` pulls `main`, runs `npm ci && next build` (static export),
and rsyncs `out/` into `/var/www/vrpumps/`. It adds a temporary 2 GB swapfile
during the build (the box has 3.7 GB RAM) and removes it after. nginx is not
touched.

Manual equivalent:

```bash
cd /opt/centilio-build/vrpumps/src
git pull
npx next build
rsync -a --delete out/ /var/www/vrpumps/
```

---

## 3. First-time / nginx block install

```bash
VHOST=/etc/nginx/sites-enabled/tools1.centilio.com
cp "$VHOST" /root/tools1.centilio.com.bak.$(date +%Y%m%d-%H%M%S)   # backup
# insert the location block (see section 1) after the server-level
# `client_max_body_size 50M;` line, then:
nginx -t && systemctl reload nginx
```

Latest known-good backup: `/root/tools1.centilio.com.bak.20260626-081018`.

---

## 4. Rollback

```bash
# revert nginx routing
cp /root/tools1.centilio.com.bak.<timestamp> /etc/nginx/sites-enabled/tools1.centilio.com
nginx -t && systemctl reload nginx
# (optional) remove the static files
rm -rf /var/www/vrpumps
```

To roll back content only, re-run `deploy.sh` against an earlier commit
(`BRANCH=<sha> bash deploy/deploy.sh` after pointing the build dir at that commit).

---

## 5. Smoke test

```bash
B=https://tools1.centilio.com
for p in / /vrpumps/ /vrpumps/pumps/ /vrpumps/cart/ /vrpumps/about/ \
         /vrpumps/contact/ /vrpumps/wishlist/ /vrpumps/order-completed/; do
  echo "$p -> $(curl -s -o /dev/null -w '%{http_code}' $B$p)"
done
# existing apps must stay up:
for p in / /slack/ /whatsapp/; do echo "$p -> $(curl -s -o /dev/null -w '%{http_code}' $B$p)"; done
```

---

## 6. Build facts

| Item | Value |
|------|-------|
| Framework | Next.js 15.3.3 / React 19 (App Router) |
| Build mode | `output: 'export'` (static) |
| Node on box | 18.19.1 |
| Build dir | `/opt/centilio-build/vrpumps/src` |
| Docroot | `/var/www/vrpumps` |
| URL base | `/vrpumps` (basePath) |
| Routes | `/`, about, cart, contact, order-completed, pumps, wishlist (+404) |
