-- Ocean Hotspot MVP schema additions (run in Supabase SQL Editor)
-- Safe to re-run: uses IF NOT EXISTS / conditional checks

-- Page analytics (admin dashboard)
CREATE TABLE IF NOT EXISTS public.page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text NOT NULL,
  referrer text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS page_views_created_at_idx ON public.page_views (created_at DESC);
CREATE INDEX IF NOT EXISTS page_views_path_idx ON public.page_views (path);

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'page_views' AND policyname = 'Anyone can insert page views'
  ) THEN
    CREATE POLICY "Anyone can insert page views" ON public.page_views FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'page_views' AND policyname = 'Admins can read page views'
  ) THEN
    CREATE POLICY "Admins can read page views" ON public.page_views FOR SELECT
      USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- Distributors (if not already created)
CREATE TABLE IF NOT EXISTS public.distributors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  commission_rate numeric DEFAULT 10,
  coverage_area text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.distributor_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id uuid REFERENCES public.distributors(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  commission_rate numeric,
  created_at timestamptz DEFAULT now(),
  UNIQUE (distributor_id, product_id)
);

-- Ensure Stripe columns on profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS stripe_account_id text,
  ADD COLUMN IF NOT EXISTS stripe_charges_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS stripe_payouts_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS stripe_onboarding_complete boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS stripe_ready boolean DEFAULT false;

-- Order tracking
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS tracking_number text,
  ADD COLUMN IF NOT EXISTS distributor_id uuid,
  ADD COLUMN IF NOT EXISTS distributor_commission numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS platform_fee numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS seller_payout numeric DEFAULT 0;

-- Showroom location (retailer trust)
ALTER TABLE public.showrooms
  ADD COLUMN IF NOT EXISTS location text;

COMMENT ON TABLE public.page_views IS 'Anonymous page view analytics for MVP dashboard';
