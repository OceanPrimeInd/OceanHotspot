-- Internal sync key for supplier catalogue imports (not shown on storefront)
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS source_url text;

CREATE UNIQUE INDEX IF NOT EXISTS products_seller_source_url_uidx
  ON public.products (seller_id, source_url)
  WHERE source_url IS NOT NULL AND source_url <> '';
