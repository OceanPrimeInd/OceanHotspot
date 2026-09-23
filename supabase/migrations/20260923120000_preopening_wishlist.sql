-- Opening Soon: wish lists and supplier applications (aligned with Website Map v3 SQL tab)

CREATE TABLE IF NOT EXISTS public.wishlist_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid DEFAULT auth.uid() REFERENCES auth.users (id) ON DELETE SET NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  delivery_postcode text,
  boat text,
  harbour text,
  contact_via text NOT NULL DEFAULT 'Email',
  notes text,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  consent_contact boolean NOT NULL DEFAULT false,
  consent_opening boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'new'
);

CREATE INDEX IF NOT EXISTS wishlist_requests_created_at_idx ON public.wishlist_requests (created_at DESC);
CREATE INDEX IF NOT EXISTS wishlist_requests_email_idx ON public.wishlist_requests (lower(email));

ALTER TABLE public.wishlist_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS wishlist_requests_insert ON public.wishlist_requests;
CREATE POLICY wishlist_requests_insert ON public.wishlist_requests
  FOR INSERT TO anon, authenticated
  WITH CHECK (consent_contact = true);

DROP POLICY IF EXISTS wishlist_requests_admin ON public.wishlist_requests;
CREATE POLICY wishlist_requests_admin ON public.wishlist_requests
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.supplier_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid DEFAULT auth.uid() REFERENCES auth.users (id) ON DELETE SET NULL,
  boat_types text[] NOT NULL DEFAULT '{}',
  makes_models text,
  categories text[] NOT NULL DEFAULT '{}',
  brands text,
  product_count text,
  load_route text,
  company_name text NOT NULL,
  showroom_name text,
  company_reg text,
  vat_number text,
  contact_name text NOT NULL,
  role text,
  email text NOT NULL,
  phone text NOT NULL,
  website text,
  postcode text,
  supplier_type text,
  terms_agreed_at timestamptz,
  consent_updates boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'new'
);

ALTER TABLE public.supplier_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS supplier_applications_insert ON public.supplier_applications;
CREATE POLICY supplier_applications_insert ON public.supplier_applications
  FOR INSERT TO anon, authenticated
  WITH CHECK (terms_agreed_at IS NOT NULL);

DROP POLICY IF EXISTS supplier_applications_admin ON public.supplier_applications;
CREATE POLICY supplier_applications_admin ON public.supplier_applications
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS supplier_applications_select_own ON public.supplier_applications;
CREATE POLICY supplier_applications_select_own ON public.supplier_applications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());
