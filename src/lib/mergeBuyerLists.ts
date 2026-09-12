import type { CartItem, WishlistItem } from "@/types/buyerLists";

export function mergeCartItems(local: CartItem[], remote: CartItem[]): CartItem[] {
  const map = new Map<string, CartItem>();
  for (const item of remote) {
    map.set(item.id, { ...item });
  }
  for (const item of local) {
    const existing = map.get(item.id);
    if (existing) {
      map.set(item.id, {
        ...existing,
        quantity: existing.quantity + item.quantity,
        title: item.title || existing.title,
        price: item.price ?? existing.price,
        image_url: item.image_url ?? existing.image_url,
      });
    } else {
      map.set(item.id, { ...item });
    }
  }
  return Array.from(map.values());
}

export function mergeWishlistItems(
  local: WishlistItem[],
  remote: WishlistItem[],
): WishlistItem[] {
  const map = new Map<string, WishlistItem>();
  for (const item of remote) {
    map.set(item.id, { ...item });
  }
  for (const item of local) {
    const existing = map.get(item.id);
    if (!existing) {
      map.set(item.id, { ...item });
      continue;
    }
    map.set(item.id, {
      ...existing,
      ...item,
      addedAt: Math.max(existing.addedAt, item.addedAt),
    });
  }
  return Array.from(map.values()).sort((a, b) => b.addedAt - a.addedAt);
}
