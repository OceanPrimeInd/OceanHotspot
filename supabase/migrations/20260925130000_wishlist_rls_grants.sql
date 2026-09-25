-- Fix wish list + supplier form inserts for anon/authenticated (opening soon)

GRANT INSERT ON public.wishlist_requests TO anon, authenticated;
GRANT INSERT ON public.supplier_applications TO anon, authenticated;

ALTER TABLE public.wishlist_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS wishlist_requests_insert ON public.wishlist_requests;
CREATE POLICY wishlist_requests_insert ON public.wishlist_requests
  FOR INSERT TO anon, authenticated
  WITH CHECK (consent_contact IS TRUE);

DROP POLICY IF EXISTS wishlist_requests_select_own ON public.wishlist_requests;
CREATE POLICY wishlist_requests_select_own ON public.wishlist_requests
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

ALTER TABLE public.supplier_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS supplier_applications_insert ON public.supplier_applications;
CREATE POLICY supplier_applications_insert ON public.supplier_applications
  FOR INSERT TO anon, authenticated
  WITH CHECK (terms_agreed_at IS NOT NULL);
