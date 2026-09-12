import { readJsonStorage, writeJsonStorage } from "@/lib/clientStorage";
import type { WishlistItem } from "@/types/buyerLists";

export const WISHLIST_STORAGE_KEY = "ocean_hotspot_wishlist";

export function readStoredWishlist(): WishlistItem[] {
  return readJsonStorage<WishlistItem[]>(WISHLIST_STORAGE_KEY, []);
}

export function writeStoredWishlist(items: WishlistItem[]): void {
  writeJsonStorage(WISHLIST_STORAGE_KEY, items);
}

export function clearStoredWishlist(): void {
  writeStoredWishlist([]);
}
