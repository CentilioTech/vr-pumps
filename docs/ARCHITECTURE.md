# VR Pumps — System Architecture

VR Pumps is a two-tier e-commerce system:

1. **Front-end** — this repo. A Next.js 15 (App Router) storefront exported as
   **static HTML/JS/CSS** and served by nginx at `https://tools1.centilio.com/vrpumps/`.
2. **Backend API** — a **Centilio Struts2 + IAM Java webapp** (separate codebase),
   running on Tomcat with a **PostgreSQL** database, exposed at context `/vrpumps`.
   Authentication is cookie-based via the Centilio IAM (`Centilio_Id`).

```
                          ┌─────────────────────────────────────────┐
   Browser ──HTTPS──▶ nginx (tools1.centilio.com, :443, Let's Encrypt)  │
                          │                                              │
                          │  location /vrpumps/  ── alias ──▶ /var/www/vrpumps/   (THIS REPO: static export)
                          │  location /           ── proxy ─▶ 127.0.0.1:8080  (Tomcat ROOT)
                          │  location /slack/      ── alias/proxy ─▶ /var/www/chat + :8090 (Spring Boot)
                          │  location /whatsapp/   ── proxy ─▶ :8080 (Tomcat webapp)
                          └─────────────────────────────────────────┘
                                                  │
   Backend API (NOT in this repo, deploy target = Tomcat context /vrpumps):
                          ┌──────────────────────────────────────┐
                          │ Tomcat 9 :8080  /vrpumps  (Struts2 + IAM)   │
                          │   signup/signin/init/ustat/logout ...       │
                          │   product, category, cart, wishlist, review │
                          │   contact, address, paymentdetails ...      │
                          └───────────────┬─────────────────────────┘
                                          │ JDBC
                          ┌───────────────▼─────────────────────────┐
                          │ PostgreSQL 16  (localhost:5432)  db=vrpumps │
                          │   category, product, product_category,      │
                          │   cart, wishlist, review, contact, address, │
                          │   payment_method, users/session ...         │
                          └──────────────────────────────────────┘
```

---

## Front-end (this repo)

* **Stack:** Next.js 15.3.3, React 19, Tailwind v4, shadcn, framer-motion.
* **Build:** `output: 'export'` → fully static `out/`. No Node server, no pm2.
* **basePath:** `/vrpumps` — all routes/assets are emitted under `/vrpumps/…`.
* **Routes:** `/`, `/about`, `/cart`, `/contact`, `/order-completed`, `/pumps`,
  `/wishlist`.
* **State:** the current build is a **design shell** — cart/wishlist are
  client-side only and it does **not yet call the backend API**. To make it
  data-driven, add a client API layer (see "Wiring the front-end to the API").

### Wiring the front-end to the API (future)
Because the front-end is statically exported, it talks to the API **client-side**
(`fetch`) at runtime. Recommended:

* Add `NEXT_PUBLIC_API_BASE` (e.g. `https://tools1.centilio.com/vrpumps`) and a
  small `lib/api.ts` wrapper.
* Send credentials with requests (`fetch(url, { credentials: 'include' })`) so the
  `Centilio_Id` session cookie flows.
* Product listing → `GET {API_BASE}/product`; product detail → `GET …/product?product_id=ID`;
  cart/wishlist/review/contact per [`docs/API.md`](./API.md).

---

## Backend API (separate Centilio webapp)

Same family as the StarPromoters CRM. Key conventions:

* **Auth:** Centilio IAM. Session cookie `Centilio_Id`. Endpoints `signup`, `signin`,
  `verifyotp`, `forgotpassword`, `resetpassword`, `changepassword`, `logout`,
  `deleteaccount`, `init`, `ustat`.
* **Packaging:** a Tomcat webapp deployed as context **`/vrpumps`**. `web.xml`
  `ProductName` selects which `security-<product>.json`, `<product>-app.properties`,
  Struts config and mail templates load.
* **DB config:** `system.properties` →
  `database.url=jdbc:postgresql://localhost:5432/`, `database.name=vrpumps`,
  `database.user=postgres`, `is.production=true`,
  `iam.path=https://tools1.centilio.com/vrpumps`.
* **Security filter:** `WebSecurityFilter` sees the **full** request path including
  the context (`/vrpumps/signin`), so `security-vrpumps.json` URL patterns must
  include the context prefix.
* **Field convention:** list/object fields are accepted as **JSON-encoded strings**
  (e.g. `price`, `technical_specifications`, `applications`, `features`) — see the
  Postman examples in [`docs/API.md`](./API.md).

### Current deployment status (2026-06-26)
* The API is **not yet on tools1** (Tomcat webapps: `ROOT`, `trademinds`, `whatsapp`;
  no `vrpumps` context). It currently lives on the dev box **`116.203.207.86`**.
* The **`vrpumps` PostgreSQL database has been created and seeded on tools1**
  (schema + Aquaglow/Flowmaxx sample products) so it is ready the moment the WAR
  is deployed. See [`db/README.md`](../db/README.md).

### To go fully live (backend checklist)
1. Build/obtain the `vrpumps.war` (or copy from `116.203.207.86`).
2. Drop into `/opt/tomcat/latest/webapps/vrpumps.war`.
3. Configure `system.properties` → `database.name=vrpumps`, user `postgres`.
4. Add `security-vrpumps.json` + `vrpumps-app.properties` + setenv encrypt keys.
5. Add nginx routes for the API under `/vrpumps/<endpoint>` (proxy to `:8080`) —
   note this must **not** collide with the static `/vrpumps/` front-end location;
   use explicit API sub-paths or a dedicated `/vrpumps/api/` prefix.
6. Smoke test: `GET /vrpumps/init`, `POST /vrpumps/signin`, `GET /vrpumps/product`.

---

## Hosts & services (tools1)

| Service | Port | Unit | Role |
|---------|------|------|------|
| nginx | 80/443 | `nginx` | TLS + sub-path routing |
| Tomcat 9 | 8080 | `tomcat` | ROOT, trademinds, whatsapp (future: vrpumps) |
| Spring Boot (Chat) | 8090 | `slack-backend` | `/slack` API |
| Metrics API (Python) | 8001 | `centilio-metrics` | internal |
| PostgreSQL 16 | 5432 | `postgresql@16-main` | `vrpumps`, trademinds, … |
| MySQL | 3306 | `mysql` | slack_db, whatsapp |

---

## CDN asset delivery (front-end, current)

The static export is split across two origins, matching Centilio account/drive/sign:

- **HTML + `public/`** → served by nginx on **tools1** at `/vrpumps/` (~0.5 MB).
- **`_next/` (client JS, CSS, fonts, hashed/optimized images)** → **DigitalOcean
  Spaces `us-cdn1`, region sfo3**, served at `https://us-cdn1.centilio.com/vrpumps/<version>/_next/...`
  with `cache-control: immutable`, behind the CDN edge.

`next.config.ts` sets `assetPrefix` from `VRPUMPS_CDN_BASE` at build time, so the
emitted HTML references the versioned CDN path. Versions are immutable folders
(`vrpumps/v1`, `vrpumps/v2`, …) → instant rollback. Cross-origin is covered by the
bucket's existing CORS allow-list (`https://*.centilio.com`).

Performance: product/marketing images are optimized in-repo (128 MB → 19 MB) and
served (hashed) from the CDN. The tools1 box no longer serves any large assets.

See `deploy/deploy-cdn.sh` and `deploy/DEPLOY.md` for the runbook.
