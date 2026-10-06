import { formatPrice } from "@/lib/utils";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export const REQUEST_STORAGE_KEY = "ocean_hotspot_request";

export type RequestKind = "purchase" | "question" | "basket";

export type RequestLine = {
  productId?: string;
  title: string;
  partNumber?: string | null;
  supplierName?: string | null;
  currency: string;
  unitPrice: number;
  quantity: number;
  productUrl: string;
};

export type RequestDraft = {
  kind: RequestKind;
  customerName: string;
  lines: RequestLine[];
};

function money(currency: string, amount: number): string {
  if (!(amount > 0)) return "Price on request";
  return `${formatPrice(currency, amount)} ex VAT`;
}

function formatLine(line: RequestLine, index?: number): string {
  const title = index != null ? `${index}. ${line.title}` : line.title;
  return [
    title,
    `Our product code: ${line.partNumber?.trim() || "—"}`,
    `Supplier: ${line.supplierName?.trim() || "—"}`,
    `Price: ${money(line.currency, line.unitPrice)}`,
    `Quantity: ${line.quantity}`,
    `Total price: ${money(line.currency, line.unitPrice * line.quantity)}`,
    line.productUrl,
  ].join("\n");
}

export function buildRequestWhatsAppMessage(draft: RequestDraft): string {
  const name = draft.customerName.trim() || "A customer";
  const intro =
    draft.kind === "question"
      ? `${name} has asked a question about the following product.`
      : draft.kind === "basket"
        ? `${name} has requested to purchase these products.`
        : `${name} has requested to purchase this product.`;
  const body = draft.lines
    .map((line, index) => formatLine(line, draft.lines.length > 1 ? index + 1 : undefined))
    .join("\n\n");
  return `${intro}\n\n${body}`;
}

export function requestThankYou(draft: RequestDraft): string {
  if (draft.kind === "question") {
    return "Thank you for your question, one of our team will reply shortly. Please fill in your contact details. Once we have all the information we will contact you by email, messaging or by calling you.";
  }
  const bought = draft.lines.map((line) => `${line.title} (${line.quantity})`).join(", ");
  const place = draft.kind === "basket" ? "products" : "product";
  return `Thank you for buying ${bought}. We are now confirming availability. Please fill in your contact details and where you would like the ${place} to be sent. Once we have all the information we will confirm the price, delivery details and expected delivery date to you via email, messaging or by calling you.`;
}

export function needsDeliveryAddress(kind: RequestKind): boolean {
  return kind === "purchase" || kind === "basket";
}

export function saveRequestDraft(draft: RequestDraft): void {
  sessionStorage.setItem(REQUEST_STORAGE_KEY, JSON.stringify(draft));
}

export function readRequestDraft(): RequestDraft | null {
  try {
    const raw = sessionStorage.getItem(REQUEST_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as RequestDraft;
    if (!parsed?.kind || !Array.isArray(parsed.lines) || parsed.lines.length === 0) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Writes the product into WhatsApp and keeps a copy for the follow-up page. */
export function openProductRequest(draft: RequestDraft): void {
  saveRequestDraft(draft);
  const href = buildWhatsAppUrl(buildRequestWhatsAppMessage(draft));
  if (href) window.open(href, "_blank", "noopener,noreferrer");
}
