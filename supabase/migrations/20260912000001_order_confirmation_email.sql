ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS buyer_confirmation_email_sent_at timestamptz;

COMMENT ON COLUMN public.orders.buyer_confirmation_email_sent_at IS 'When buyer order confirmation email was sent (idempotent)';
