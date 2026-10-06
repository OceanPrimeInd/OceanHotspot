-- Run this once in the Supabase SQL editor.
-- The first script saved the tables. This lets each product line be stored as well.

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
