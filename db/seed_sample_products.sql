-- =====================================================================
-- VR Pumps — Sample catalog seed (Aquaglow series + Flowmaxx)
-- Source data: aquaglow.json + Flowmaxx booster-pump spec (uploads)
-- Run AFTER schema.sql:   psql -d vrpumps -f db/seed_sample_products.sql
-- Idempotent: ON CONFLICT keeps re-runs safe.
-- =====================================================================
\set ON_ERROR_STOP on
BEGIN;

-- now() in epoch-millis, matching the app's BIGINT audit convention
-- (re-evaluated per statement; fine for seed data)

-- ---------------------------------------------------------------------
-- CATEGORY 1: Aquaglow  (decorative / fountain pump series)
-- ---------------------------------------------------------------------
INSERT INTO category
    (name, tag_line, features, description, design_highlights,
     technical_specifications, ideal_for, recommended_applications,
     price, created_time)
VALUES (
    'Aquaglow',
    'VISUAL BRILLIANCE, ELEGANCE IN EVERY DROP',
    ARRAY['Compact','Silent Running','Weather Proof'],
    'Aquaglow is built for one purpose - to create elegant, uninterrupted water displays. Designed for landscape fountains, decorative pools and resort installations, this pump is compact, energy-efficient and extremely quiet. Whether used in villas, parks, hotels or showrooms, it brings life and charm to any water body running simultaneously.',
    ARRAY['LOW MAINTENANCE','RUST PROOF MATERIALS','SILENT OPERATION',
          'ENERGY-EFFICIENT (High flow with minimal power usage)',
          'COMPACT SIZE (Easy to clean and service; fits in confined fountain basins)',
          'Handles constant water exposure'],
    '{"horsepower":"0.3 to 5.0 HP","voltage_range":"200V - 440V","motor_speed":"2900 RPM","maximum_head":"Up to 30 meters","maximum_discharge":"Up to 1000 LPM","motor_rating":"S1 Continuous Duty"}'::jsonb,
    ARRAY['Installers','Architects & Landscape Designers','Hospitality Industry','Dealers in Urban Markets'],
    ARRAY['Villas & High-End Apartments','Landscaped Gardens','Decorative Water Fountains','Hotels & Resorts'],
    '{"currency":"INR","mrp":5366,"selling_price":4293,"discount_percent":20,"you_save":1073}'::jsonb,
    (extract(epoch from now())*1000)::bigint
)
ON CONFLICT (name) DO UPDATE SET
    tag_line = EXCLUDED.tag_line,
    features = EXCLUDED.features,
    description = EXCLUDED.description,
    design_highlights = EXCLUDED.design_highlights,
    technical_specifications = EXCLUDED.technical_specifications,
    ideal_for = EXCLUDED.ideal_for,
    recommended_applications = EXCLUDED.recommended_applications,
    price = EXCLUDED.price,
    modified_time = (extract(epoch from now())*1000)::bigint;

-- Aquaglow products (5 series). applications identical across the series.
INSERT INTO product
    (product_id, name, price, stock_quantity, technical_specifications, applications, created_time)
VALUES
 ('5VAG032508-R3-01','Aquaglow Eco',
  '{"currency":"INR","mrp":5366,"selling_price":4293,"discount_percent":20,"you_save":1073}'::jsonb,
  25,
  '{"horsepower":"0.3 HP","stage":"01","maximum_head":"8 meters","maximum_discharge":"120 LPM","head_range":"0 to 6 meters"}'::jsonb,
  ARRAY['Domestics','Constructions','Gardening','Agriculture','Borewells'],
  (extract(epoch from now())*1000)::bigint),

 ('8VAG205015-K20-01','Aquaglow Boost',
  '{"currency":"INR","mrp":21609,"selling_price":17287,"discount_percent":20,"you_save":4322}'::jsonb,
  15,
  '{"horsepower":"2.0 HP","stage":"01","maximum_head":"15 meters","maximum_discharge":"850 LPM","head_range":"5 to 10 meters"}'::jsonb,
  ARRAY['Domestics','Constructions','Gardening','Agriculture','Borewells'],
  (extract(epoch from now())*1000)::bigint),

 ('8VAG205030-K10-02','Aquaglow Turbo',
  '{"currency":"INR","mrp":23079,"selling_price":18463,"discount_percent":20,"you_save":4616}'::jsonb,
  15,
  '{"horsepower":"2.0 HP","stage":"02","maximum_head":"30 meters","maximum_discharge":"475 LPM","head_range":"10 to 20 meters"}'::jsonb,
  ARRAY['Domestics','Constructions','Gardening','Agriculture','Borewells'],
  (extract(epoch from now())*1000)::bigint),

 ('8VAG305030-K15-02','Aquaglow Force',
  '{"currency":"INR","mrp":23667,"selling_price":18934,"discount_percent":20,"you_save":4733}'::jsonb,
  12,
  '{"horsepower":"3.0 HP","stage":"02","maximum_head":"30 meters","maximum_discharge":"690 LPM","head_range":"10 to 20 meters"}'::jsonb,
  ARRAY['Domestics','Constructions','Gardening','Agriculture','Borewells'],
  (extract(epoch from now())*1000)::bigint),

 ('8VAG506530-K25-02','Aquaglow Ultra',
  '{"currency":"INR","mrp":33810,"selling_price":27048,"discount_percent":20,"you_save":6762}'::jsonb,
  8,
  '{"horsepower":"5.0 HP","power_kw":3.70,"stage":"02","maximum_head":"30 meters","maximum_discharge":"980 LPM","head_range":"10 to 20 meters","pipe_size":"65 mm"}'::jsonb,
  ARRAY['Domestics','Constructions','Gardening','Agriculture','Borewells'],
  (extract(epoch from now())*1000)::bigint)
ON CONFLICT (product_id) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    stock_quantity = EXCLUDED.stock_quantity,
    technical_specifications = EXCLUDED.technical_specifications,
    applications = EXCLUDED.applications,
    modified_time = (extract(epoch from now())*1000)::bigint;

-- Link all Aquaglow products to the Aquaglow category
INSERT INTO product_category (product_id, category_id, created_time)
SELECT p.id, c.id, (extract(epoch from now())*1000)::bigint
FROM product p
JOIN category c ON c.name = 'Aquaglow'
WHERE p.product_id IN ('5VAG032508-R3-01','8VAG205015-K20-01',
                       '8VAG205030-K10-02','8VAG305030-K15-02','8VAG506530-K25-02')
ON CONFLICT (product_id, category_id) DO NOTHING;

-- ---------------------------------------------------------------------
-- CATEGORY 2: Flowmaxx  (high-pressure booster pump)
-- product_id is derived (no SKU in source): FLOWMAXX-0520 (0.5-2.0 HP)
-- ---------------------------------------------------------------------
INSERT INTO category
    (name, tag_line, features, description, design_highlights,
     technical_specifications, ideal_for, recommended_applications,
     price, created_time)
VALUES (
    'Flowmaxx',
    'Pump up your waterflow',
    ARRAY['High Pressure','Compact','Silent Operation','Rust-Free Build'],
    'Flowmaxx is specifically designed to provide consistent high-pressure water flow for domestic, commercial, and industrial applications. With a robust metal body, powerful 2880 RPM motor, and an efficient design, this booster pump ensures optimal performance with minimal maintenance. Suitable for a wide range of applications including residential buildings, hotels, irrigation systems, and water supply management.',
    ARRAY['High Pressure output','Compact Size','Silent Operation','Rust-Free Build','Energy Efficient','Space Saving Design'],
    '{"voltage_range":"180V - 230V","motor_speed":"2880 RPM","maximum_head":"Up to 100 meters","motor_rating":"S1 Continuous Duty","horsepower":"0.5 to 2.0 HP","maximum_discharge":"Up to 60 LPM"}'::jsonb,
    ARRAY['Plumbing Contractors','Villa Owners And Builders','Property Managers','Dealers And Resellers','Facility Engineers','Construction Project Managers'],
    ARRAY['Showers','Pressure Cleaning','Sinks and Faucets','Pressure Floor Cleaning','High Rise Residential Buildings'],
    '{"currency":"INR","mrp":8636,"selling_price":8636,"discount_percent":0,"you_save":0}'::jsonb,
    (extract(epoch from now())*1000)::bigint
)
ON CONFLICT (name) DO UPDATE SET
    tag_line = EXCLUDED.tag_line,
    description = EXCLUDED.description,
    technical_specifications = EXCLUDED.technical_specifications,
    modified_time = (extract(epoch from now())*1000)::bigint;

INSERT INTO product
    (product_id, name, sub_title, description, price, stock_quantity,
     technical_specifications, design_highlights, ideal_for,
     recommended_applications, free_shipping, replacement_available, created_time)
VALUES (
    'FLOWMAXX-0520',
    'Flowmaxx – Booster Pump',
    'Pump up your waterflow',
    'Flowmaxx is specifically designed to provide consistent high-pressure water flow for domestic, commercial, and industrial applications. With a robust metal body, powerful 2880 RPM motor, and an efficient design, this booster pump ensures optimal performance with minimal maintenance.',
    '{"currency":"INR","mrp":8636,"selling_price":8636,"discount_percent":0,"you_save":0}'::jsonb,
    10,
    '{"voltage_range":"180V - 230V","motor_speed":"2880 RPM","maximum_head":"Up to 100 meters","motor_rating":"S1 Continuous Duty","horsepower":"0.5 to 2.0 HP","maximum_discharge":"Up to 60 LPM"}'::jsonb,
    ARRAY['High Pressure output','Compact Size','Silent Operation','Rust-Free Build','Energy Efficient','Space Saving Design'],
    ARRAY['Plumbing Contractors','Villa Owners And Builders','Property Managers','Dealers And Resellers','Facility Engineers','Construction Project Managers'],
    ARRAY['Showers','Pressure Cleaning','Sinks and Faucets','Pressure Floor Cleaning','High Rise Residential Buildings'],
    1, 1,
    (extract(epoch from now())*1000)::bigint
)
ON CONFLICT (product_id) DO UPDATE SET
    name = EXCLUDED.name,
    sub_title = EXCLUDED.sub_title,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    stock_quantity = EXCLUDED.stock_quantity,
    technical_specifications = EXCLUDED.technical_specifications,
    free_shipping = EXCLUDED.free_shipping,
    replacement_available = EXCLUDED.replacement_available,
    modified_time = (extract(epoch from now())*1000)::bigint;

INSERT INTO product_category (product_id, category_id, created_time)
SELECT p.id, c.id, (extract(epoch from now())*1000)::bigint
FROM product p
JOIN category c ON c.name = 'Flowmaxx'
WHERE p.product_id = 'FLOWMAXX-0520'
ON CONFLICT (product_id, category_id) DO NOTHING;

COMMIT;

-- ---------------------------------------------------------------------
-- Verification (run manually):
--   SELECT id,name FROM category ORDER BY id;
--   SELECT product_id,name,price->>'selling_price' AS sp,stock_quantity FROM product ORDER BY id;
--   SELECT c.name AS category, p.name AS product
--     FROM product_category pc
--     JOIN product p  ON p.id = pc.product_id
--     JOIN category c ON c.id = pc.category_id
--    ORDER BY c.name, p.name;
-- ---------------------------------------------------------------------
