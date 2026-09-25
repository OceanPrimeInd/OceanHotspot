/**
 * Platform fee rate used at checkout and in seller reporting (order total incl. VAT where applicable).
 * Matches supabase/functions/_shared/platformCommission.ts and create-checkout.
 * Distributor partner rates (often 5–20%) are separate from this platform fee.
 */
export const PLATFORM_COMMISSION_RATE = 0.05;

/** Public website / supplier marketing copy (no fixed % on customer-facing pages). */
export const PLATFORM_COMMISSION_MARKETING_LABEL = "low commission";

/** Shown only where a numeric rate is required (e.g. order breakdown in seller tools). */
export const PLATFORM_COMMISSION_PERCENT_LABEL = "5%";

export function formatPlatformCommission(amount: number): string {
  return (Math.round(amount * PLATFORM_COMMISSION_RATE * 100) / 100).toFixed(2);
}
