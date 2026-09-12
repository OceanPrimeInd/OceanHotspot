-- Allow buyers to read their own orders (fixes order confirmation + my orders for logged-in users)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Buyers can read own orders" ON public.orders;
CREATE POLICY "Buyers can read own orders"
  ON public.orders FOR SELECT
  USING (
    auth.uid() = buyer_id
    OR (
      buyer_id IS NULL
      AND buyer_email IS NOT NULL
      AND lower(buyer_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  );

DROP POLICY IF EXISTS "Sellers can read own orders" ON public.orders;
CREATE POLICY "Sellers can read own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Sellers can update own orders" ON public.orders;
CREATE POLICY "Sellers can update own orders"
  ON public.orders FOR UPDATE
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);
