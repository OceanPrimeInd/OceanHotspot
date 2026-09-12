import type { SupabaseClient } from "@supabase/supabase-js";
import {
  buildDiscoveryReply,
  extractSearchKeywords,
  rankProducts,
  sanitizeLikeToken,
  type DiscoveryProduct,
} from "@/lib/discoverySearch";

export async function runDiscoverySearch(
  supabase: SupabaseClient,
  query: string,
): Promise<{ reply: string; products: DiscoveryProduct[]; keywords: string[] }> {
  const trimmed = query.trim();
  if (!trimmed) {
    return {
      reply:
        "Tell me what marine product or part you need — engine, navigation, safety, or deck equipment.",
      products: [],
      keywords: [],
    };
  }

  const keywords = extractSearchKeywords(trimmed);
  let candidates: DiscoveryProduct[] = [];

  if (keywords.length > 0) {
    const orParts = keywords.flatMap((k) => {
      const safe = sanitizeLikeToken(k);
      if (!safe) return [];
      return [
        `title.ilike.%${safe}%`,
        `description.ilike.%${safe}%`,
        `domain_category.ilike.%${safe}%`,
      ];
    });

    if (orParts.length > 0) {
      const { data, error } = await supabase
        .from("products")
        .select("id, title, price, currency, image_url, description, domain_category")
        .eq("is_published", true)
        .or(orParts.join(","))
        .limit(40);

      if (error) throw new Error(error.message);
      candidates = (data || []) as DiscoveryProduct[];
    }
  }

  const products = rankProducts(candidates, keywords, 6);
  const reply = buildDiscoveryReply(trimmed, keywords, products);

  return { reply, products, keywords };
}
