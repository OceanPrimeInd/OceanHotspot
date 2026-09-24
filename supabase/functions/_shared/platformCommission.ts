/** Ocean Hotspot platform commission — must match src/config/platform.ts */
export const PLATFORM_COMMISSION_RATE = 0.05;

export function platformFeeFromOrderTotal(orderTotal: number): number {
  return Math.round(orderTotal * PLATFORM_COMMISSION_RATE * 100) / 100;
}
