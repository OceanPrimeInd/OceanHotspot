-- Page views: columns expected by the app + analytics events (search, checkout funnel)

ALTER TABLE public.page_views
  ADD COLUMN IF NOT EXISTS session_id text,
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS page_views_session_id_idx ON public.page_views (session_id);

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  path text,
  session_id text,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS analytics_events_type_created_idx
  ON public.analytics_events (event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS analytics_events_created_at_idx
  ON public.analytics_events (created_at DESC);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'analytics_events' AND policyname = 'Anyone can insert analytics events'
  ) THEN
    CREATE POLICY "Anyone can insert analytics events" ON public.analytics_events
      FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'analytics_events' AND policyname = 'Admins can read analytics events'
  ) THEN
    CREATE POLICY "Admins can read analytics events" ON public.analytics_events
      FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

COMMENT ON TABLE public.analytics_events IS 'First-party analytics: search terms, checkout funnel, etc.';
