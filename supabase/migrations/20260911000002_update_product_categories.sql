-- =============================================================================
-- Ocean Hotspot: migrate products.domain_category to new 9-category system
-- SAFE: keeps all products; backs up old value before changing anything
-- Run in Supabase SQL Editor. Review Step 1 output before running Step 2+
-- =============================================================================

-- ── STEP 1: See what you have now (run this first, read the results) ─────────
SELECT domain_category, COUNT(*) AS product_count
FROM public.products
GROUP BY domain_category
ORDER BY product_count DESC;

-- ── STEP 2: Backup original category (one-time; skip if column already exists) ─
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS domain_category_legacy text;

UPDATE public.products
SET domain_category_legacy = domain_category
WHERE domain_category_legacy IS NULL
  AND domain_category IS NOT NULL;

-- ── STEP 3: Direct map — old seller slugs → new 9 nav slugs ──────────────────
UPDATE public.products SET domain_category = 'vessels'
WHERE domain_category IN ('vessels_floating_assets', 'vessels', 'boats_vessels');

UPDATE public.products SET domain_category = 'engines'
WHERE domain_category IN ('propulsion_power', 'engines', 'engines_propulsion');

UPDATE public.products SET domain_category = 'electronics'
WHERE domain_category IN ('electronics_navigation', 'electronics', 'navigation');

UPDATE public.products SET domain_category = 'electrical'
WHERE domain_category IN ('electrical_power', 'electrical', 'power');

UPDATE public.products SET domain_category = 'deck'
WHERE domain_category IN (
  'deck_hardware', 'anchoring_mooring', 'rigging_sails', 'sailing_rigging', 'deck'
);

UPDATE public.products SET domain_category = 'pumps'
WHERE domain_category IN ('plumbing_pumps', 'plumbing_pumps_ventilation', 'pumps');

UPDATE public.products SET domain_category = 'maintenance'
WHERE domain_category IN ('maintenance_consumables', 'maintenance', 'eco_compliance');

UPDATE public.products SET domain_category = 'safety'
WHERE domain_category IN ('safety_security_response', 'safety');

UPDATE public.products SET domain_category = 'leisure'
WHERE domain_category IN (
  'fishing_aquaculture', 'fishing_harvesting', 'watersports', 'cabin_galley',
  'covers_accessories', 'trailers_towing', 'leisure', 'fishing'
);

-- Finance / legal stays out of browse nav — keep tagged but filterable
UPDATE public.products SET domain_category = 'services'
WHERE domain_category IN ('finance_insurance_legal', 'services');

-- ── STEP 4: Smart keyword match for "other" and NULL (title-based guess) ─────
UPDATE public.products SET domain_category = 'engines'
WHERE (domain_category IS NULL OR domain_category IN ('other', 'Other'))
  AND (
    title ILIKE '%engine%' OR title ILIKE '%outboard%' OR title ILIKE '%propeller%'
    OR title ILIKE '%impeller%' OR title ILIKE '%yanmar%' OR title ILIKE '%mercury%'
    OR description ILIKE '%engine%' OR description ILIKE '%outboard%'
  );

UPDATE public.products SET domain_category = 'electronics'
WHERE (domain_category IS NULL OR domain_category IN ('other', 'Other'))
  AND (
    title ILIKE '%gps%' OR title ILIKE '%chartplotter%' OR title ILIKE '%radar%'
    OR title ILIKE '%vhf%' OR title ILIKE '%ais%' OR title ILIKE '%sonar%'
    OR title ILIKE '%fishfinder%' OR title ILIKE '%garmin%' OR title ILIKE '%raymarine%'
  );

UPDATE public.products SET domain_category = 'electrical'
WHERE (domain_category IS NULL OR domain_category IN ('other', 'Other'))
  AND (
    title ILIKE '%battery%' OR title ILIKE '%charger%' OR title ILIKE '%inverter%'
    OR title ILIKE '%solar%' OR title ILIKE '%light%' OR title ILIKE '%switch panel%'
  );

UPDATE public.products SET domain_category = 'deck'
WHERE (domain_category IS NULL OR domain_category IN ('other', 'Other'))
  AND (
    title ILIKE '%anchor%' OR title ILIKE '%fender%' OR title ILIKE '%winch%'
    OR title ILIKE '%cleat%' OR title ILIKE '%rigging%' OR title ILIKE '%sail%'
    OR title ILIKE '%deck%' OR title ILIKE '%mooring%'
  );

UPDATE public.products SET domain_category = 'pumps'
WHERE (domain_category IS NULL OR domain_category IN ('other', 'Other'))
  AND (
    title ILIKE '%pump%' OR title ILIKE '%bilge%' OR title ILIKE '%toilet%'
    OR title ILIKE '%macerator%' OR title ILIKE '%hose%' OR title ILIKE '%plumbing%'
  );

UPDATE public.products SET domain_category = 'maintenance'
WHERE (domain_category IS NULL OR domain_category IN ('other', 'Other'))
  AND (
    title ILIKE '%paint%' OR title ILIKE '%antifoul%' OR title ILIKE '%clean%'
    OR title ILIKE '%polish%' OR title ILIKE '%lubric%' OR title ILIKE '%oil%'
    OR title ILIKE '%filter%' OR title ILIKE '%anode%'
  );

UPDATE public.products SET domain_category = 'safety'
WHERE (domain_category IS NULL OR domain_category IN ('other', 'Other'))
  AND (
    title ILIKE '%life jacket%' OR title ILIKE '%liferaft%' OR title ILIKE '%epirb%'
    OR title ILIKE '%flare%' OR title ILIKE '%fire extingu%' OR title ILIKE '%lifebuoy%'
  );

UPDATE public.products SET domain_category = 'leisure'
WHERE (domain_category IS NULL OR domain_category IN ('other', 'Other'))
  AND (
    title ILIKE '%fish%' OR title ILIKE '%kayak%' OR title ILIKE '%paddle%'
    OR title ILIKE '%trailer%' OR title ILIKE '%galley%' OR title ILIKE '%bbq%'
    OR title ILIKE '%cover%' OR title ILIKE '%bimini%'
  );

UPDATE public.products SET domain_category = 'vessels'
WHERE (domain_category IS NULL OR domain_category IN ('other', 'Other'))
  AND (
    title ILIKE '%boat%' OR title ILIKE '%vessel%' OR title ILIKE '%yacht%'
    OR title ILIKE '%rib%' OR title ILIKE '%dinghy%' OR title ILIKE '%tender%'
  );

-- Anything still unmatched → default to maintenance (chandlery consumables)
UPDATE public.products SET domain_category = 'maintenance'
WHERE domain_category IS NULL OR domain_category IN ('other', 'Other');

-- ── STEP 5: Refresh domain_labels (browse filter display names) ───────────────
DELETE FROM public.domain_labels;

INSERT INTO public.domain_labels (code, label, description) VALUES
  ('vessels',     'Vessels',     'Boats, tenders, pontoons and floating assets'),
  ('engines',     'Engines',     'Engines, propulsion, steering and parts'),
  ('electronics', 'Electronics', 'Navigation, GPS, radar, VHF and instruments'),
  ('electrical',  'Electrical',  'Batteries, power, solar, wiring and lighting'),
  ('deck',        'Deck',        'Anchoring, mooring, deck hardware and rigging'),
  ('pumps',       'Pumps',       'Plumbing, pumps, sanitation and ventilation'),
  ('maintenance', 'Maintenance', 'Paint, cleaners, lubricants and consumables'),
  ('safety',      'Safety',      'Life jackets, liferafts, fire and security'),
  ('leisure',     'Leisure',     'Fishing, watersports, galley and onboard'),
  ('services',    'Services',    'Finance, insurance and legal services');

-- ── STEP 6: Verify — compare before (legacy) vs after ───────────────────────
SELECT
  domain_category_legacy AS old_category,
  domain_category AS new_category,
  COUNT(*) AS products
FROM public.products
GROUP BY domain_category_legacy, domain_category
ORDER BY products DESC;

SELECT domain_category, COUNT(*) AS total
FROM public.products
GROUP BY domain_category
ORDER BY total DESC;

-- Spot-check: products that changed category
SELECT id, title, domain_category_legacy, domain_category
FROM public.products
WHERE domain_category_legacy IS DISTINCT FROM domain_category
LIMIT 50;
