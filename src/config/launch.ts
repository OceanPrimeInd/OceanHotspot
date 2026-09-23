/**
 * Customer storefront launch mode (Sep 2026 standup).
 * Suppliers can register; customers browse and contact us — no live card checkout until enabled.
 */
export const CUSTOMER_CHECKOUT_ENABLED =
  process.env.NEXT_PUBLIC_CUSTOMER_CHECKOUT_ENABLED === "true";

export function isCustomerCheckoutEnabled(): boolean {
  return CUSTOMER_CHECKOUT_ENABLED;
}

export const OPENING_SOON_LABEL = "Opening soon";
