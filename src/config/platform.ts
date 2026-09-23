/** Platform commission — matches create-checkout / stripe order creation (5% of order total incl. VAT). */
export const PLATFORM_COMMISSION_RATE = 0.05;

export const PLATFORM_COMMISSION_PERCENT_LABEL = "5%";

export function formatPlatformCommission(amount: number): string {
  return (Math.round(amount * PLATFORM_COMMISSION_RATE * 100) / 100).toFixed(2);
}
