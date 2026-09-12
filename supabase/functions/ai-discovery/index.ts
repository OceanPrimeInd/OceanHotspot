import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";
import {
  buildDiscoveryReply,
  extractSearchKeywords,
  rankProducts,
  sanitizeLikeToken,
  type DiscoveryProduct,
} from "../_shared/discoverySearch.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  try {
    const { messages } = await req.json();
    const lastUser = [...(messages || [])].reverse().find((m: { role: string }) => m.role === "user");
    const query = lastUser?.content?.trim() || "";

    if (!query) {
      return new Response(JSON.stringify({
        reply: "Tell me what marine product or part you need — engine, navigation, safety, or deck equipment.",
        products: [],
        keywords: [],
      }), {
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const keywords = extractSearchKeywords(query);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

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
    const reply = buildDiscoveryReply(query, keywords, products);

    return new Response(JSON.stringify({ reply, products, keywords }), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({
      error: message,
      reply: "Something went wrong. Please try again.",
      products: [],
      keywords: [],
    }), {
      status: 500,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});
