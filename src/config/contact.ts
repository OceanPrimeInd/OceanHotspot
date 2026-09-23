/** Single public contact address for Ocean Hotspot */
export const CONTACT_EMAIL = "oceanhotspotservices@gmail.com" as const;

/** WhatsApp Business number (E.164, e.g. 447700900123). Set NEXT_PUBLIC_WHATSAPP_NUMBER in Vercel. */
export const WHATSAPP_NUMBER =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim()) || "";

export const COMPANY_LEGAL_LINE =
  "© 2026 Ocean Hotspot, a trading name of Ocean Prime Industries Ltd, company number 14306464.";
