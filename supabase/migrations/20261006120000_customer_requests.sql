-- Customer Buy now, More information, and basket requests.
-- Paste this whole file into the Supabase SQL editor and run it once.

CREATE TABLE IF NOT EXISTS public.customer_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid DEFAULT auth.uid() REFERENCES auth.users (id) ON DELETE SET NULL,
  kind text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  customer_name text NOT NULL,
  email text NOT NULL,
  phone text,
  delivery_address text,
  whatsapp_message text,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes text,
  CONSTRAINT customer_requests_kind_check
    CHECK (kind IN ('purchase', 'question', 'basket')),
  CONSTRAINT customer_requests_status_check
    CHECK (status IN (
      'new',
      'confirming_with_supplier',
      'invoice_sent',
      'awaiting_payment',
      'paid',
      'receipt_sent',
      'delivered',
      'supplier_paid',
      'closed'
    ))
);

COMMENT ON TABLE public.customer_requests IS
  'Buy now, basket Buy now, and More information submissions. status follows the team follow-up: new, confirming_with_supplier, invoice_sent, awaiting_payment, paid, receipt_sent, delivered, supplier_paid, closed.';

COMMENT ON COLUMN public.customer_requests.kind IS
  'purchase = one product Buy now, basket = basket Buy now, question = More information.';

CREATE INDEX IF NOT EXISTS customer_requests_created_at_idx
  ON public.customer_requests (created_at DESC);
CREATE INDEX IF NOT EXISTS customer_requests_email_idx
  ON public.customer_requests (lower(email));
CREATE INDEX IF NOT EXISTS customer_requests_status_idx
  ON public.customer_requests (status);

CREATE TABLE IF NOT EXISTS public.customer_request_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.customer_requests (id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products (id) ON DELETE SET NULL,
  title text NOT NULL,
  part_number text,
  supplier_name text,
  currency text,
  unit_price numeric,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  total_price numeric,
  product_url text
);

CREATE INDEX IF NOT EXISTS customer_request_items_request_id_idx
  ON public.customer_request_items (request_id);
CREATE INDEX IF NOT EXISTS customer_request_items_part_number_idx
  ON public.customer_request_items (part_number);

CREATE OR REPLACE FUNCTION public.set_customer_request_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS customer_requests_set_updated_at ON public.customer_requests;
CREATE TRIGGER customer_requests_set_updated_at
  BEFORE UPDATE ON public.customer_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.set_customer_request_updated_at();

ALTER TABLE public.customer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_request_items ENABLE ROW LEVEL SECURITY;

GRANT INSERT ON public.customer_requests TO anon, authenticated;
GRANT SELECT, UPDATE ON public.customer_requests TO authenticated;
GRANT ALL ON public.customer_requests TO service_role;

GRANT INSERT ON public.customer_request_items TO anon, authenticated;
GRANT SELECT ON public.customer_request_items TO authenticated;
GRANT ALL ON public.customer_request_items TO service_role;

DROP POLICY IF EXISTS customer_requests_insert ON public.customer_requests;
CREATE POLICY customer_requests_insert ON public.customer_requests
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    kind IN ('purchase', 'question', 'basket')
    AND length(trim(customer_name)) > 0
    AND length(trim(email)) > 0
    AND (user_id IS NULL OR user_id = auth.uid())
  );

DROP POLICY IF EXISTS customer_requests_select ON public.customer_requests;
CREATE POLICY customer_requests_select ON public.customer_requests
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS customer_requests_admin_update ON public.customer_requests;
CREATE POLICY customer_requests_admin_update ON public.customer_requests
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.customer_request_is_recent(target uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.customer_requests
    WHERE id = target
      AND created_at > now() - interval '15 minutes'
  );
$$;

REVOKE ALL ON FUNCTION public.customer_request_is_recent(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.customer_request_is_recent(uuid) TO anon, authenticated, service_role;

DROP POLICY IF EXISTS customer_request_items_insert ON public.customer_request_items;
CREATE POLICY customer_request_items_insert ON public.customer_request_items
  FOR INSERT TO anon, authenticated
  WITH CHECK (public.customer_request_is_recent(request_id));

DROP POLICY IF EXISTS customer_request_items_select ON public.customer_request_items;
CREATE POLICY customer_request_items_select ON public.customer_request_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.customer_requests AS request
      WHERE request.id = request_id
        AND (request.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  );
