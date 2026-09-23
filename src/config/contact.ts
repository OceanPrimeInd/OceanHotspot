/** Single public contact address for Ocean Hotspot */
export const CONTACT_EMAIL = "oceanhotspotservices@gmail.com" as const;

/** Set NEXT_PUBLIC_SUPPORT_PHONE when a staffed line is live (e.g. +441234567890). */
export const SUPPORT_PHONE =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_SUPPORT_PHONE?.trim()) || "";

export const SUPPORT_PHONE_DISPLAY =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_SUPPORT_PHONE_DISPLAY?.trim()) ||
  SUPPORT_PHONE;
