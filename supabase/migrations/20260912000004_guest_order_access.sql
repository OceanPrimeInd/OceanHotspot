ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS guest_access_token text;

CREATE UNIQUE INDEX IF NOT EXISTS orders_guest_access_token_idx
  ON public.orders (guest_access_token)
  WHERE guest_access_token IS NOT NULL;

COMMENT ON COLUMN public.orders.guest_access_token IS 'Secret token for guest order status links (no account required)';
