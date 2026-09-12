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
  clearStoredWishlist,
  readStoredWishlist,
  writeStoredWishlist,
} from "@/lib/wishlistStorage";
import { mergeWishlistItems } from "@/lib/mergeBuyerLists";
import { saveProfileList } from "@/lib/profileBuyerLists";
import { useProfileListSync } from "@/hooks/useProfileListSync";
import type { WishlistItem } from "@/types/buyerLists";

export type { WishlistItem } from "@/types/buyerLists";

interface WishlistContextType {
  items: WishlistItem[];
  addItem: (item: Omit<WishlistItem, "addedAt">) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  toggleItem: (item: Omit<WishlistItem, "addedAt">) => void;
  clearWishlist: () => void;
  itemCount: number;
  hydrated: boolean;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(readStoredWishlist());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeStoredWishlist(items);
  }, [items, hydrated]);

  const merge = useCallback(mergeWishlistItems, []);

  useProfileListSync({
    userId: user?.id,
    column: "wishlist_data",
    items,
    setItems,
    storageReady: hydrated,
    merge,
  });

  const addItem = (item: Omit<WishlistItem, "addedAt">) => {
    setItems((current) => {
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
    setItems((current) => {
      if (current.some((i) => i.id === item.id)) {
        return current.filter((i) => i.id !== item.id);
      }
      return [...current, { ...item, addedAt: Date.now() }];
    });
  };

  const clearWishlist = () => {
    setItems([]);
    clearStoredWishlist();
    if (user?.id) {
      void saveProfileList(user.id, "wishlist_data", []);
    }
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
        hydrated,
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
