/**
 * Ocean Hotspot platform commission (seller side) — 5% of order total incl. VAT where applicable.
 * Matches supabase/functions/_shared/platformCommission.ts and create-checkout.
 * Distributor partner rates (often 5–20%) are separate from this platform fee.
 */
export const PLATFORM_COMMISSION_RATE = 0.05;

export const PLATFORM_COMMISSION_PERCENT_LABEL = "5%";

export function formatPlatformCommission(amount: number): string {
  return (Math.round(amount * PLATFORM_COMMISSION_RATE * 100) / 100).toFixed(2);
}
