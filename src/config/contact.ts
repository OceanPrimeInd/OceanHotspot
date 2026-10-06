/** Single public contact address for Ocean Hotspot */
export const CONTACT_EMAIL = "oceanhotspotservices@gmail.com" as const;

/** WhatsApp Business number, digits only. Taken from the public chat page for the short link. */
export const WHATSAPP_NUMBER =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim()) || "447707821387";

/** Ocean Hotspot WhatsApp Business chat. A phone number overrides this when one is set. */
export const WHATSAPP_CHAT_URL =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_WHATSAPP_URL?.trim()) ||
  "https://wa.me/message/2AJRWZ5G2WYGH1";

export const COMPANY_LEGAL_LINE =
  "© 2026 Ocean Hotspot, a trading name of Ocean Prime Industries Ltd, company number 14306464.";
