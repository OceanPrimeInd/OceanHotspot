import { readJsonStorage, writeJsonStorage } from "@/lib/clientStorage";
import type { CartItem } from "@/types/buyerLists";

export const CART_STORAGE_KEY = "ocean_hotspot_cart";

export function readStoredCart(): CartItem[] {
  return readJsonStorage<CartItem[]>(CART_STORAGE_KEY, []);
}

export function writeStoredCart(items: CartItem[]): void {
  writeJsonStorage(CART_STORAGE_KEY, items);
}

export function clearStoredCart(): void {
  writeStoredCart([]);
}
