-- Public read for published vendor showrooms
ALTER TABLE public.showrooms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published showrooms" ON public.showrooms;
CREATE POLICY "Public can view published showrooms"
  ON public.showrooms FOR SELECT
  USING (is_published = true);

DROP POLICY IF EXISTS "Sellers manage own showroom" ON public.showrooms;
CREATE POLICY "Sellers manage own showroom"
  ON public.showrooms FOR ALL
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

-- GDPR / data subject requests
CREATE TABLE IF NOT EXISTS public.gdpr_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_type text NOT NULL CHECK (request_type IN ('erasure', 'access', 'portability')),
  email text NOT NULL,
  full_name text,
  message text,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.gdpr_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit GDPR request" ON public.gdpr_requests;
CREATE POLICY "Anyone can submit GDPR request"
  ON public.gdpr_requests FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own GDPR requests" ON public.gdpr_requests;
CREATE POLICY "Users can view own GDPR requests"
  ON public.gdpr_requests FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

COMMENT ON TABLE public.gdpr_requests IS 'Data subject access and erasure requests (UK GDPR)';
