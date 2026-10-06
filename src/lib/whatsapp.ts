import { WHATSAPP_CHAT_URL, WHATSAPP_NUMBER } from "@/config/contact";

/** E.164 digits only, no + */
export function normalizeWhatsAppNumber(raw: string): string {
  return raw.replace(/\D/g, "");
}

export function isWhatsAppConfigured(): boolean {
  return normalizeWhatsAppNumber(WHATSAPP_NUMBER).length >= 10 || Boolean(WHATSAPP_CHAT_URL);
}

export function buildWhatsAppUrl(text: string): string | null {
  const num = normalizeWhatsAppNumber(WHATSAPP_NUMBER);
  // A phone link is the only format that writes the message into the box.
  // wa.me/message/… opens the chat and drops ?text=.
  if (num) {
    const url = new URL("https://api.whatsapp.com/send");
    url.searchParams.set("phone", num);
    if (text.trim()) url.searchParams.set("text", text);
    return url.toString();
  }
  if (!WHATSAPP_CHAT_URL) return null;
  return WHATSAPP_CHAT_URL;
}

export function buildProductWhatsAppMessage(opts: {
  title: string;
  partNumber?: string | null;
  priceLabel?: string | null;
  productUrl?: string;
}): string {
  const lines = [
    "Hi Ocean Hotspot — I want this item. Please confirm it for me.",
    "",
    opts.title,
    opts.partNumber ? `Part no. ${opts.partNumber}` : null,
    opts.priceLabel ? `Price: ${opts.priceLabel}` : null,
    opts.productUrl || null,
  ].filter((line) => line !== null);
  return lines.join("\n");
}
