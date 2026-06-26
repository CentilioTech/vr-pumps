-- =====================================================================
-- VR Pumps — Canonical PostgreSQL schema
-- Target: PostgreSQL 16 (tools1, localhost:5432, database "vrpumps")
-- =====================================================================
-- This is the authoritative schema, reconciled from three source drafts:
--   * sample table value.txt  (Pradhap, Slack) -> AUTHORITATIVE product/category
--                                                 (JSONB price/specs, TEXT[] arrays)
--   * schema.sql                                -> payment_method, address,
--                                                 disable_account_reason
--   * vr_pumps.sql (MySQL draft)               -> IAM user/session tables
--                                                 (translated to Postgres here)
--
-- Conventions (match the Centilio IAM / Struts backend):
--   * Audit columns: created_by / created_time / modified_by / modified_time
--     are BIGINT epoch-millis (set by the app layer), NOT SQL timestamps.
--   * Money & rich specs are stored as JSONB.
--   * Multi-value descriptive fields are TEXT[] (Postgres arrays).
--   * Boolean-ish flags are SMALLINT 0/1 with CHECK constraints (matches app).
--
-- Idempotent: safe to run repeatedly (CREATE TABLE IF NOT EXISTS + guarded
-- constraints). Run as:  psql -d vrpumps -f db/schema.sql
-- =====================================================================

-- ---------------------------------------------------------------------
-- IAM / User management  (owned by the Centilio IAM webapp at runtime)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id              BIGSERIAL PRIMARY KEY,
    email_id        VARCHAR(255) UNIQUE,
    first_name      VARCHAR(255),
    last_name       VARCHAR(255),
    mobile_number   VARCHAR(255),
    status          INTEGER DEFAULT 0,
    country         INTEGER,
    time_zone       INTEGER,
    mfa_enabled     INTEGER DEFAULT 1,
    profile_picture BIGINT,
    source          INTEGER,
    source_id       VARCHAR(50),
    state           VARCHAR(100),
    city_district   VARCHAR(100),
    created_by      BIGINT,
    created_time    BIGINT,
    modified_by     BIGINT,
    modified_time   BIGINT
);

CREATE TABLE IF NOT EXISTS user_password (
    id            BIGSERIAL PRIMARY KEY,
    password      VARCHAR(255),
    user_id       BIGINT REFERENCES users(id) ON DELETE CASCADE,
    created_by    BIGINT,
    created_time  BIGINT,
    modified_by   BIGINT,
    modified_time BIGINT
);

CREATE TABLE IF NOT EXISTS user_session (
    id            BIGSERIAL PRIMARY KEY,
    user_id       BIGINT REFERENCES users(id) ON DELETE CASCADE,
    browser       INTEGER,
    device_name   INTEGER,
    device_os     INTEGER,
    location      INTEGER,
    machine_ip    VARCHAR(255),
    city          VARCHAR(100),
    cookie        VARCHAR(255),
    status        INTEGER DEFAULT 1,
    expire_time   BIGINT,
    created_by    BIGINT,
    created_time  BIGINT,
    modified_by   BIGINT,
    modified_time BIGINT
);

CREATE TABLE IF NOT EXISTS disable_account_reason (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    reason       VARCHAR(255),
    created_time BIGINT
);

-- ---------------------------------------------------------------------
-- Catalog: category  (the "series parent" — e.g. Aquaglow, Flowmaxx)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS category (
    id                       BIGSERIAL PRIMARY KEY,
    name                     VARCHAR(100) NOT NULL,
    tag_line                 VARCHAR(255),
    features                 TEXT[],
    description              TEXT,
    design_highlights        TEXT[],
    technical_specifications JSONB,
    ideal_for                TEXT[],
    recommended_applications TEXT[],
    price                    JSONB,          -- representative/"from" price for the series
    file_urls                TEXT[],         -- hero / banner images
    created_by               BIGINT,
    created_time             BIGINT,
    modified_by              BIGINT,
    modified_time            BIGINT
);
-- Unique name enables idempotent seeding (ON CONFLICT (name)).
DO $$ BEGIN
    ALTER TABLE category ADD CONSTRAINT uq_category_name UNIQUE (name);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; END $$;

-- ---------------------------------------------------------------------
-- Catalog: product  (the buyable SKU — e.g. Aquaglow Eco)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product (
    id                       BIGSERIAL PRIMARY KEY,
    product_id               VARCHAR(50) NOT NULL UNIQUE,   -- SKU, e.g. 5VAG032508-R3-01
    name                     VARCHAR(150) NOT NULL,
    sub_title                VARCHAR(255),
    description              TEXT,
    price                    JSONB,          -- {currency,mrp,selling_price,discount_percent,you_save}
    stock_quantity           INTEGER DEFAULT 0,
    technical_specifications JSONB,
    applications             TEXT[],
    design_highlights        TEXT[],
    ideal_for                TEXT[],
    recommended_applications TEXT[],
    free_shipping            SMALLINT DEFAULT 0 CHECK (free_shipping = ANY (ARRAY[0,1])),
    replacement_available    SMALLINT DEFAULT 0 CHECK (replacement_available = ANY (ARRAY[0,1])),
    created_by               BIGINT,
    created_time             BIGINT,
    modified_by              BIGINT,
    modified_time            BIGINT
);

-- product <-> category (many-to-many; API accepts category_ids[])
CREATE TABLE IF NOT EXISTS product_category (
    product_id   BIGINT REFERENCES product(id)  ON DELETE CASCADE,
    category_id  BIGINT REFERENCES category(id) ON DELETE CASCADE,
    created_by   BIGINT,
    created_time BIGINT,
    PRIMARY KEY (product_id, category_id)
);

-- product images (file_urls). The API also accepts file_urls inline; this
-- table is the normalized store used by GET /product.
CREATE TABLE IF NOT EXISTS product_image (
    id           BIGSERIAL PRIMARY KEY,
    product_id   BIGINT REFERENCES product(id) ON DELETE CASCADE,
    image_url    TEXT NOT NULL,
    created_by   BIGINT,
    created_time BIGINT
);

-- ---------------------------------------------------------------------
-- Shopping: cart / wishlist / review
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cart (
    id            BIGSERIAL PRIMARY KEY,
    user_id       BIGINT REFERENCES users(id) ON DELETE CASCADE,
    product_id    BIGINT REFERENCES product(id) ON DELETE CASCADE,
    quantity      INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_time  BIGINT,
    modified_time BIGINT,
    UNIQUE (user_id, product_id)
);

CREATE TABLE IF NOT EXISTS wishlist (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT REFERENCES users(id) ON DELETE CASCADE,
    product_id   BIGINT REFERENCES product(id) ON DELETE CASCADE,
    created_time BIGINT,
    UNIQUE (user_id, product_id)
);

CREATE TABLE IF NOT EXISTS review (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT REFERENCES users(id) ON DELETE SET NULL,
    product_id   BIGINT REFERENCES product(id) ON DELETE CASCADE,
    rating       SMALLINT CHECK (rating BETWEEN 1 AND 5),
    comment      TEXT,
    created_time BIGINT,
    modified_time BIGINT
);

-- ---------------------------------------------------------------------
-- Support: contact form submissions
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contact (
    id           BIGSERIAL PRIMARY KEY,
    f_name       VARCHAR(255),
    l_name       VARCHAR(255),
    email        VARCHAR(255),
    phone        VARCHAR(50),
    details      TEXT,
    created_time BIGINT
);

-- ---------------------------------------------------------------------
-- Account: address book + saved payment methods
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS address (
    id            BIGSERIAL PRIMARY KEY,
    address       JSONB NOT NULL,           -- {street,village,postal_code,state,country}
    user_id       BIGINT REFERENCES users(id) ON DELETE CASCADE,
    is_primary    INTEGER DEFAULT 0,
    created_time  BIGINT,
    modified_time BIGINT
);

CREATE TABLE IF NOT EXISTS payment_method (
    id              BIGSERIAL PRIMARY KEY,
    cardholder_name VARCHAR(255) NOT NULL,
    card_number     VARCHAR(255) NOT NULL,   -- store tokenized/masked in production
    card_image      VARCHAR(255),
    card_type       VARCHAR(50),
    expiry_date     VARCHAR(10) NOT NULL,
    cvv             INTEGER,                 -- NOTE: never persist real CVV in production
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_primary      SMALLINT DEFAULT 0,
    created_by      BIGINT,
    created_time    BIGINT,
    modified_by     BIGINT,
    modified_time   BIGINT
);

-- ---------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_product_name        ON product (name);
CREATE INDEX IF NOT EXISTS idx_product_specs_gin   ON product USING GIN (technical_specifications);
CREATE INDEX IF NOT EXISTS idx_product_price_gin   ON product USING GIN (price);
CREATE INDEX IF NOT EXISTS idx_prodcat_category    ON product_category (category_id);
CREATE INDEX IF NOT EXISTS idx_cart_user           ON cart (user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user       ON wishlist (user_id);
CREATE INDEX IF NOT EXISTS idx_review_product      ON review (product_id);

-- =====================================================================
-- End of schema
-- =====================================================================
