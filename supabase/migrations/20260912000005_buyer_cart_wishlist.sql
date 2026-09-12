-- Persist buyer cart & wishlist on profile for cross-device sync (logged-in users)

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS cart_data jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS wishlist_data jsonb NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.profiles.cart_data IS 'Serialized cart line items for signed-in buyers';
COMMENT ON COLUMN public.profiles.wishlist_data IS 'Serialized wishlist items for signed-in buyers';
