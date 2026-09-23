-- Website map V1 (18 Sep scope): product fields, store interest, search

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS part_number text,
  ADD COLUMN IF NOT EXISTS technical_detail text,
  ADD COLUMN IF NOT EXISTS fits text,
  ADD COLUMN IF NOT EXISTS replaces text,
  ADD COLUMN IF NOT EXISTS supplier_note text;

CREATE INDEX IF NOT EXISTS products_part_number_idx ON public.products (part_number)
  WHERE part_number IS NOT NULL AND part_number <> '';

-- Refresh search vector when part_number is present (if search_vector column exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'search_vector'
  ) THEN
    UPDATE public.products SET search_vector =
      setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
      setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
      setweight(to_tsvector('english', coalesce(part_number, '')), 'A') ||
      setweight(to_tsvector('english', coalesce(technical_detail, '')), 'C') ||
      setweight(to_tsvector('english', coalesce(fits, '')), 'C') ||
      setweight(to_tsvector('english', coalesce(replaces, '')), 'C');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.store_interest (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  business text NOT NULL,
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.store_interest ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS store_interest_insert_anon ON public.store_interest;
CREATE POLICY store_interest_insert_anon ON public.store_interest
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS store_interest_select_admin ON public.store_interest;
CREATE POLICY store_interest_select_admin ON public.store_interest
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Extend search_products to match part_number (replace function if it exists)
CREATE OR REPLACE FUNCTION public.search_products(search_query text, result_limit int DEFAULT 20)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  price numeric,
  currency text,
  image_url text,
  entity_type text,
  domain_category text,
  rank real
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  q tsquery;
BEGIN
  q := plainto_tsquery('english', search_query);
  RETURN QUERY
  SELECT
    p.id,
    p.title,
    p.description,
    p.price,
    p.currency,
    p.image_url,
    p.entity_type,
    p.domain_category,
    ts_rank(p.search_vector, q) AS rank
  FROM public.products p
  WHERE p.is_published = true
    AND (
      p.search_vector @@ q
      OR p.title ILIKE '%' || search_query || '%'
      OR coalesce(p.part_number, '') ILIKE '%' || search_query || '%'
      OR coalesce(p.description, '') ILIKE '%' || search_query || '%'
      OR coalesce(p.fits, '') ILIKE '%' || search_query || '%'
    )
  ORDER BY rank DESC NULLS LAST, p.created_at DESC
  LIMIT result_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION public.search_products(text, int) TO anon, authenticated;
