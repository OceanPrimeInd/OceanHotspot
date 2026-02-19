"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface WishlistItem {
  id: string;
  title: string;
  price: number;
  currency: string;
  image_url: string | null;
  description?: string | null;
  entity_type?: string | null;
  domain_category?: string | null;
  addedAt: number; // timestamp
}

interface WishlistContextType {
  items: WishlistItem[];
  addItem: (item: Omit<WishlistItem, "addedAt">) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  toggleItem: (item: Omit<WishlistItem, "addedAt">) => void;
  clearWishlist: () => void;
  itemCount: number;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

const WISHLIST_STORAGE_KEY = "ocean_hotspot_wishlist";

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persist wishlist to localStorage
  useEffect(() => {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (item: Omit<WishlistItem, "addedAt">) => {
    setItems((current) => {
      // Check if already exists
      if (current.some((i) => i.id === item.id)) {
        return current;
      }
      return [...current, { ...item, addedAt: Date.now() }];
    });
  };

  const removeItem = (productId: string) => {
    setItems((current) => current.filter((item) => item.id !== productId));
  };

  const isInWishlist = (productId: string) => {
    return items.some((item) => item.id === productId);
  };

  const toggleItem = (item: Omit<WishlistItem, "addedAt">) => {
    if (isInWishlist(item.id)) {
      removeItem(item.id);
    } else {
      addItem(item);
    }
  };

  const clearWishlist = () => {
    setItems([]);
  };

  const itemCount = items.length;

  return (
    <WishlistContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        isInWishlist,
        toggleItem,
        clearWishlist,
        itemCount,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
