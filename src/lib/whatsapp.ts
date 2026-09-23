import { WHATSAPP_NUMBER } from "@/config/contact";

/** E.164 digits only, no + */
export function normalizeWhatsAppNumber(raw: string): string {
  return raw.replace(/\D/g, "");
}

export function isWhatsAppConfigured(): boolean {
  return normalizeWhatsAppNumber(WHATSAPP_NUMBER).length >= 10;
}

export function buildWhatsAppUrl(text: string): string | null {
  const num = normalizeWhatsAppNumber(WHATSAPP_NUMBER);
  if (!num) return null;
  return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
}

export function buildProductWhatsAppMessage(opts: {
  title: string;
  partNumber?: string | null;
  supplierName?: string | null;
  productUrl?: string;
}): string {
  const lines = [
    "Hi Ocean Hotspot — I'm interested in:",
    opts.title,
    opts.partNumber ? `Part number: ${opts.partNumber}` : null,
    opts.supplierName ? `Supplier: ${opts.supplierName}` : null,
    opts.productUrl ? opts.productUrl : null,
  ].filter(Boolean);
  return lines.join("\n");
}
