# VR Pumps — Database (PostgreSQL)

Canonical store for the VR Pumps backend. **PostgreSQL 16**, database **`vrpumps`**,
owner **`postgres`**, on `tools1` (`localhost:5432`).

| File | Purpose |
|------|---------|
| `schema.sql` | Canonical schema (tables, FKs, indexes). Idempotent. |
| `seed_sample_products.sql` | Sample catalog: Aquaglow series (5) + Flowmaxx. Idempotent. |

> The schema was reconciled from three drafts that were floating around:
> `sample table value.txt` (Pradhap, Slack — **authoritative** product/category with
> JSONB price/specs + `TEXT[]` arrays), `schema.sql` (payment_method/address/
> disable_account_reason), and `vr_pumps.sql` (MySQL draft of the IAM user tables,
> translated to Postgres). The Postgres/JSONB version is the source of truth.

---

## Setup (fresh)

```bash
# on tools1, as root
sudo -u postgres createdb vrpumps                 # create the database
sudo -u postgres psql -d vrpumps -f db/schema.sql # tables + indexes
sudo -u postgres psql -d vrpumps -f db/seed_sample_products.sql  # sample data
```

The backend's `system.properties` should then point at it:
`database.name=vrpumps`, `database.user=postgres`, `database.url=jdbc:postgresql://localhost:5432/`.

---

## Data model (catalog)

* **`category`** — the *series parent* (e.g. `Aquaglow`, `Flowmaxx`). Holds marketing
  copy as arrays (`features`, `design_highlights`, `ideal_for`,
  `recommended_applications`), `description`, series-level
  `technical_specifications` (JSONB) and a representative `price` (JSONB).
* **`product`** — the *buyable SKU* (e.g. `Aquaglow Eco`). `product_id` is the SKU
  (unique). `price` and `technical_specifications` are JSONB; `applications` is
  `TEXT[]`. Flags `free_shipping` / `replacement_available` are `SMALLINT 0/1`.
* **`product_category`** — many-to-many link (the API accepts `category_ids[]`).
* **`product_image`** — normalized image URLs (the API also accepts `file_urls` inline).

```
category 1 ──< product_category >── N product ──< product_image
```

JSONB shapes:

```jsonc
// product.price
{ "currency": "INR", "mrp": 33810, "selling_price": 27048, "discount_percent": 20, "you_save": 6762 }
// product.technical_specifications
{ "horsepower": "5.0 HP", "stage": "02", "maximum_head": "30 meters",
  "maximum_discharge": "980 LPM", "head_range": "10 to 20 meters", "pipe_size": "65 mm" }
```

---

## How products & categories are inserted

There are **two supported paths**. Both end up in the same tables.

### A) Via the API (production path)
The backend accepts rich fields as **JSON-encoded strings**. See
[`../docs/API.md`](../docs/API.md). Order: create the `category` first, then create
each `product` with `category_ids: [<id>]`.

```bash
# 1) category
curl -X POST $API/category -b "$COOKIE" -H 'Content-Type: application/json' -d '{
  "name":"Aquaglow","tag_line":"VISUAL BRILLIANCE, ELEGANCE IN EVERY DROP",
  "features":"[\"Compact\",\"Silent Running\",\"Weather Proof\"]",
  "technical_specifications":"{ \"horsepower\": \"0.3 to 5.0 HP\" }" }'

# 2) product (links to category 1)
curl -X POST $API/product -b "$COOKIE" -H 'Content-Type: application/json' -d '{
  "product_id":"5VAG032508-R3-01","name":"Aquaglow Eco",
  "price":"{ \"currency\": \"INR\", \"mrp\": 5366, \"selling_price\": 4293 }",
  "stock_quantity":25,
  "technical_specifications":{ "horsepower":"0.3 HP","stage":"01" },
  "applications":["Domestics","Gardening"], "category_ids":[1] }'
```

### B) Via direct SQL (seeding / migrations)
Use `seed_sample_products.sql` as the template. Native Postgres types — JSONB via
`'…'::jsonb`, arrays via `ARRAY[...]`:

```sql
INSERT INTO category (name, features, technical_specifications, created_time)
VALUES ('Aquaglow',
        ARRAY['Compact','Silent Running','Weather Proof'],
        '{"horsepower":"0.3 to 5.0 HP"}'::jsonb,
        (extract(epoch from now())*1000)::bigint)
ON CONFLICT (name) DO NOTHING;

INSERT INTO product (product_id, name, price, stock_quantity, applications, created_time)
VALUES ('5VAG032508-R3-01','Aquaglow Eco',
        '{"currency":"INR","mrp":5366,"selling_price":4293}'::jsonb, 25,
        ARRAY['Domestics','Gardening'], (extract(epoch from now())*1000)::bigint)
ON CONFLICT (product_id) DO NOTHING;

INSERT INTO product_category (product_id, category_id, created_time)
SELECT p.id, c.id, (extract(epoch from now())*1000)::bigint
FROM product p JOIN category c ON c.name='Aquaglow'
WHERE p.product_id='5VAG032508-R3-01'
ON CONFLICT DO NOTHING;
```

---

## Seeded sample data

**Categories:** `Aquaglow` (decorative/fountain series), `Flowmaxx` (high-pressure booster).

**Products:**

| SKU | Name | Category | HP | Selling (INR) | Stock |
|-----|------|----------|----|---------------|-------|
| 5VAG032508-R3-01 | Aquaglow Eco | Aquaglow | 0.3 | 4,293 | 25 |
| 8VAG205015-K20-01 | Aquaglow Boost | Aquaglow | 2.0 | 17,287 | 15 |
| 8VAG205030-K10-02 | Aquaglow Turbo | Aquaglow | 2.0 | 18,463 | 15 |
| 8VAG305030-K15-02 | Aquaglow Force | Aquaglow | 3.0 | 18,934 | 12 |
| 8VAG506530-K25-02 | Aquaglow Ultra | Aquaglow | 5.0 | 27,048 | 8 |
| FLOWMAXX-0520 | Flowmaxx – Booster Pump | Flowmaxx | 0.5–2.0 | 8,636 | 10 |

> `FLOWMAXX-0520` is a derived SKU (the source Flowmaxx spec had no SKU).
