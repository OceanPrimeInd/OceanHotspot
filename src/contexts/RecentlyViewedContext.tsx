"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

export interface RecentlyViewedItem {
  id: string;
  title: string;
  price: number;
  currency: string;
  image_url: string | null;
  entity_type?: string | null;
  domain_category?: string | null;
  viewedAt: number; // timestamp
}

interface RecentlyViewedContextType {
  items: RecentlyViewedItem[];
  addItem: (item: Omit<RecentlyViewedItem, "viewedAt">) => void;
  clearHistory: () => void;
  itemCount: number;
}

const RecentlyViewedContext = createContext<RecentlyViewedContextType | null>(null);

const RECENTLY_VIEWED_STORAGE_KEY = "ocean_hotspot_recently_viewed";
const MAX_ITEMS = 12; // Maximum number of items to store

export function RecentlyViewedProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);
  const [ready, setReady] = useState(false);

  // Each visit starts empty. History lives only for this browser tab.
  useEffect(() => {
    try {
      localStorage.removeItem(RECENTLY_VIEWED_STORAGE_KEY);
      const saved = sessionStorage.getItem(RECENTLY_VIEWED_STORAGE_KEY);
      if (saved) setItems(JSON.parse(saved));
    } catch {
      setItems([]);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      sessionStorage.setItem(RECENTLY_VIEWED_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore private-mode storage failures.
    }
  }, [items, ready]);

  const addItem = useCallback((item: Omit<RecentlyViewedItem, "viewedAt">) => {
    setItems((current) => {
      // Remove if already exists (to move to front)
      const filtered = current.filter((i) => i.id !== item.id);

      // Add to front with timestamp
      const newItems = [{ ...item, viewedAt: Date.now() }, ...filtered];

      // Keep only the most recent items
      return newItems.slice(0, MAX_ITEMS);
    });
  }, []);

  const clearHistory = useCallback(() => {
    setItems([]);
  }, []);

  const itemCount = items.length;

  return (
    <RecentlyViewedContext.Provider
      value={{
        items,
        addItem,
        clearHistory,
        itemCount,
      }}
    >
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewed() {
  const context = useContext(RecentlyViewedContext);
  if (!context) {
    throw new Error("useRecentlyViewed must be used within a RecentlyViewedProvider");
  }
  return context;
}
