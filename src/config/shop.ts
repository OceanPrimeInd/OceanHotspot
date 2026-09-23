/**
 * Shop switch — one setting for buying on/off (Vercel: NEXT_PUBLIC_SHOP_OPEN).
 * false = opening soon: wish list, WhatsApp, email; no basket/checkout.
 */
export const SHOP_OPEN =
  process.env.NEXT_PUBLIC_SHOP_OPEN === "true" ||
  process.env.NEXT_PUBLIC_CUSTOMER_CHECKOUT_ENABLED === "true";

export function isShopOpen(): boolean {
  return SHOP_OPEN;
}

export const OPENING_SOON_LABEL = "Opening soon";
