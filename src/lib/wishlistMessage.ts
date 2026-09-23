import type { WishlistItem } from "@/types/buyerLists";
import { formatPrice } from "@/lib/utils";

export function buildWishlistWhatsAppMessage(
  items: WishlistItem[],
  customer: {
    name: string;
    boat?: string;
    postcode?: string;
  },
): string {
  const lines = [
    "Hi Ocean Hotspot — here is my wish list:",
    "",
    ...items.flatMap((item, idx) => {
      const qty = item.quantity && item.quantity > 1 ? ` (qty ${item.quantity})` : "";
      const note = item.note?.trim() ? `\n   Note: ${item.note.trim()}` : "";
      return [
        `${idx + 1}. ${item.title}${qty}`,
        item.part_number ? `   Part: ${item.part_number}` : null,
        item.supplier_name ? `   Supplier: ${item.supplier_name}` : null,
        item.price > 0 ? `   ${formatPrice(item.currency, item.price)} ex VAT` : null,
        note || null,
      ].filter(Boolean) as string[];
    }),
    "",
    `Name: ${customer.name}`,
    customer.boat ? `Boat: ${customer.boat}` : null,
    customer.postcode ? `Delivery postcode: ${customer.postcode}` : null,
  ].filter(Boolean);

  return lines.join("\n");
}
