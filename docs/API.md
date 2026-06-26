# VR Pumps — API Reference

Derived from the team Postman collection (`vrpumps`). The base URL is the Tomcat
context: `{{vrpumps}}` = `https://<host>/vrpumps/` (dev: `116.203.207.86/`,
local: `http://localhost:8080/vrpumps/`).

**Auth:** Centilio IAM session cookie `Centilio_Id`. After `signin`, the cookie is
set and must be sent on subsequent authenticated calls
(`fetch(url, { credentials: 'include' })`).

**Field convention:** rich fields (`price`, `technical_specifications`,
`applications`, `features`, `design_highlights`, `file_urls`, `address`) are
sent as **JSON-encoded strings** in request bodies, e.g.
`"price": "{ \"currency\": \"INR\", \"mrp\": 33810 }"`.

---

## Auth / account

| Method | Path | Body (key fields) |
|--------|------|-------------------|
| POST | `signup` | `emailId`, `password`, `timezone` |
| POST | `signin` | `email_id`, `password`, `timezone` |
| DELETE | `logout` | — |
| GET | `init` | — (bootstrap/session info) |
| GET | `ustat` | — (user status) |
| POST | `forgotpassword` | `email_id` |
| POST | `verifyotp` | `contact`, `otp`, `timezone` |
| PUT | `resetpassword` | `password`, `timezone` |
| PUT | `changepassword` | `current_password`, `new_password` |
| DELETE | `deleteaccount` | `reason`, `password` |
| POST | `profile` | multipart `file` (avatar) |
| DELETE | `profile` | `file_id` |

## Catalog — category

| Method | Path | Notes |
|--------|------|-------|
| POST | `category` | create. Body: `name`, `tag_line`, `features`(JSON str), `description`, `design_highlights`(JSON str), `technical_specifications`(JSON str), `ideal_for`(JSON str), `recommended_applications`(JSON str), `price`(JSON str), `file_urls` |
| GET | `category?category_id=1` | fetch one / list |
| DELETE | `category` | Body: `ids: [1]` |

## Catalog — product

| Method | Path | Notes |
|--------|------|-------|
| POST | `product` | create. Body: `product_id`(SKU), `name`, `price`(JSON str), `stock_quantity`, `technical_specifications`(obj/JSON str), `applications`(array/JSON str), `category_ids`:[..], `file_urls` |
| PUT | `product` | update. Same fields + `id`, single `category_id` |
| GET | `product?product_id=13` | fetch one |
| GET | `product` | list — query params: `category_id`, `cursor`, `limit`, `search`, `min_price`, `max_price`, `specifications` (URL-encoded JSON) |
| DELETE | `product` | Body: `ids: 1` |

## Shopping — cart / wishlist / review

| Method | Path | Body |
|--------|------|------|
| POST | `cart` | `product_id`, `quantity` |
| GET | `cart` | — |
| PUT | `cart` | `product_id`, `quantity` |
| DELETE | `cart` | `product_id` **or** `action:"clear"` |
| POST | `wishlist` | `product_id` |
| GET | `wishlist` | — |
| DELETE | `wishlist` | `product_id` |
| POST | `review` | `product_id`, `rating` (1-5), `comment` |
| GET | `review?product_id=9` | list for a product |
| DELETE | `review` | `id` |
| GET | `trending` | trending products |

## Account — address / payment

| Method | Path | Body |
|--------|------|------|
| POST | `address` | `address` (JSON str: street, village, postal_code, state, country) |
| GET | `address` | — (optional `id`) |
| PUT | `address` | `address`(JSON str), `id` |
| DELETE | `address` | `id` |
| POST | `paymentdetails` | `cardholder_name`, `card_number`, `expiry_date`, `cvv`, `is_primary` |
| GET | `paymentdetails` | — |
| PUT | `paymentdetails` | `id`, `cardholder_name`, `card_number`, `expiry_date`, `cvv` |
| DELETE | `paymentdetails` | `ids: [1]` |

## Misc

| Method | Path | Body |
|--------|------|------|
| POST | `contact` | `f_name`, `l_name`, `email`, `phone`, `details` |
| GET | `contact` | list submissions |
| POST | `attachments` | multipart `file` |
| GET | `attachments?file_id=1` | fetch file metadata/url |

---

### Example — create a product (curl)

```bash
curl -X POST https://tools1.centilio.com/vrpumps/product \
  -H 'Content-Type: application/json' \
  -b 'Centilio_Id="<session>"' \
  -d '{
    "product_id": "8VAG506530-K25-02",
    "name": "Aquaglow Ultra",
    "price": "{ \"currency\": \"INR\", \"mrp\": 33810, \"selling_price\": 27048, \"discount_percent\": 20, \"you_save\": 6762 }",
    "stock_quantity": 8,
    "technical_specifications": { "horsepower": "5.0 HP", "stage": "02", "maximum_head": "30 meters", "maximum_discharge": "980 LPM", "head_range": "10 to 20 meters", "pipe_size": "65 mm" },
    "applications": ["Domestics","Constructions","Gardening","Agriculture","Borewells"],
    "category_ids": [1],
    "file_urls": "https://in-cdn1.blr1.digitaloceanspaces.com/.../Aquaglow boost.png"
  }'
```
