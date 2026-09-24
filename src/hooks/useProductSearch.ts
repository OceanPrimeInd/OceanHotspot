"use client";

import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";

export interface SearchResult {
  id: string;
  title: string;
  description: string | null;
  price: number;
  currency: string | null;
  image_url: string | null;
  entity_type: string | null;
  domain_category: string | null;
}

export function useProductSearch() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalFound, setTotalFound] = useState(0);

  const search = useCallback(async (query: string, limit = 20) => {
    if (!query.trim()) {
      setResults([]);
      setTotalFound(0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const escapedQuery = query.trim().replace(/[%_,]/g, " ");
      const { data, error: searchError } = await supabase
        .from("products")
        .select("id, title, description, price, currency, image_url, entity_type, domain_category")
        .eq("is_published", true)
        .or(`title.ilike.%${escapedQuery}%,description.ilike.%${escapedQuery}%`)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (searchError) throw searchError;

      const products: SearchResult[] = (data || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        price: item.price,
        currency: item.currency,
        image_url: item.image_url,
        entity_type: item.entity_type,
        domain_category: item.domain_category,
      }));

      setResults(products);
      setTotalFound(products.length);
    } catch (err) {
      console.error('Search error:', err);
      setError('Search failed. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    results,
    loading,
    error,
    totalFound,
    search,
  };
}
