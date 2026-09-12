"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  clearStoredCart,
  readStoredCart,
  writeStoredCart,
} from "@/lib/cartStorage";
import { mergeCartItems } from "@/lib/mergeBuyerLists";
import { saveProfileList } from "@/lib/profileBuyerLists";
import { useProfileListSync } from "@/hooks/useProfileListSync";
import type { CartItem } from "@/types/buyerLists";

export type { CartItem } from "@/types/buyerLists";

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  total: number;
  hydrated: boolean;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(readStoredCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeStoredCart(items);
  }, [items, hydrated]);

  const merge = useCallback(mergeCartItems, []);

  useProfileListSync({
    userId: user?.id,
    column: "cart_data",
    items,
    setItems,
    storageReady: hydrated,
    merge,
  });

  const addItem = (item: Omit<CartItem, "quantity">) => {
    setItems((current) => {
      const existingIndex = current.findIndex((i) => i.id === item.id);
      if (existingIndex > -1) {
        const updated = [...current];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
        };
        return updated;
      }
      return [...current, { ...item, quantity: 1 }];
    });
  };

  const removeItem = (productId: string) => {
    setItems((current) => current.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((current) =>
      current.map((item) =>
        item.id === productId ? { ...item, quantity } : item,
      ),
    );
  };

  const clearCart = () => {
    setItems([]);
    clearStoredCart();
    if (user?.id) {
      void saveProfileList(user.id, "cart_data", []);
    }
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const total = items.reduce((sum, item) => {
    const rate = (item.vat_rate ?? 20) / 100;
    if (item.vat_treatment === "plus_vat") {
      return sum + item.price * (1 + rate) * item.quantity;
    }
    return sum + item.price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        total,
        hydrated,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
