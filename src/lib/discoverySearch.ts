/**
 * Client-side mirror of edge discovery search helpers (for tests / future reuse).
 * Product results must always come from Supabase — never invent IDs here.
 */

export type DiscoveryProduct = {
  id: string;
  title: string;
  price: number;
  currency: string;
  image_url: string | null;
  description: string | null;
  domain_category: string | null;
};

const STOP_WORDS = new Set([
  "about", "also", "any", "are", "can", "could", "for", "from", "have", "help", "how",
  "into", "just", "like", "looking", "need", "please", "recommend", "show", "some",
  "that", "the", "this", "want", "what", "when", "where", "which", "with", "would",
  "you", "your", "and", "but", "not", "all", "buy", "get", "find", "boat", "vessel",
  "yacht", "ship", "marine", "sea",
]);

const PHRASE_EXPANSIONS: Record<string, string[]> = {
  chartplotter: ["gps", "plotter", "navigation"],
  vhf: ["radio", "vhf"],
  antifoul: ["antifouling", "paint"],
  lifejacket: ["life", "jacket"],
  "life jacket": ["life", "jacket"],
  windlass: ["anchor", "windlass"],
  bilge: ["bilge", "pump"],
  outboard: ["outboard", "engine"],
  volvo: ["volvo", "engine", "oil"],
};

export function sanitizeLikeToken(raw: string): string {
  return raw.replace(/[^a-z0-9-]/gi, "").slice(0, 40);
}

export function extractSearchKeywords(query: string): string[] {
  const normalized = query.toLowerCase().replace(/[^a-z0-9\s-]/g, " ");
  const phrase = normalized.trim();

  for (const [key, extras] of Object.entries(PHRASE_EXPANSIONS)) {
    if (phrase.includes(key)) {
      return [...new Set([...extras, ...key.split(/\s+/), ...phrase.split(/\s+/).filter(Boolean)])]
        .filter((w) => w.length >= 3 && !STOP_WORDS.has(w))
        .slice(0, 8);
    }
  }

  const tokens = phrase
    .split(/\s+/)
    .map(sanitizeLikeToken)
    .filter((w) => w.length >= 3 && !STOP_WORDS.has(w));

  return [...new Set(tokens)].slice(0, 8);
}

export function scoreProduct(product: DiscoveryProduct, keywords: string[]): number {
  if (keywords.length === 0) return 0;
  const title = (product.title || "").toLowerCase();
  const description = (product.description || "").toLowerCase();
  const category = (product.domain_category || "").toLowerCase();
  const blob = `${title} ${description} ${category}`;
  let score = 0;
  for (const kw of keywords) {
    const k = kw.toLowerCase();
    if (title.includes(k)) score += 4;
    else if (blob.includes(k)) score += 2;
  }
  return score;
}

/** Drop weak matches (e.g. thruster kits when buyer asked for bilge pumps). */
export function isRelevantDiscoveryMatch(
  product: DiscoveryProduct,
  keywords: string[],
): boolean {
  if (keywords.length === 0) return false;

  const title = (product.title || "").toLowerCase();
  const blob = `${title} ${(product.description || "").toLowerCase()} ${(product.domain_category || "").toLowerCase()}`;

  const titleHits = keywords.filter((k) => title.includes(k.toLowerCase())).length;
  if (titleHits > 0) return true;

  const main = keywords[0]?.toLowerCase();
  if (!main || !blob.includes(main)) return false;

  const blobHits = keywords.filter((k) => blob.includes(k.toLowerCase())).length;
  return blobHits >= 2;
}

export function rankProducts(
  products: DiscoveryProduct[],
  keywords: string[],
  limit = 6,
): DiscoveryProduct[] {
  return products
    .map((p) => ({ p, score: scoreProduct(p, keywords) }))
    .filter((row) => row.score > 0 && isRelevantDiscoveryMatch(row.p, keywords))
    .sort((a, b) => b.score - a.score || a.p.title.localeCompare(b.p.title))
    .slice(0, limit)
    .map((row) => row.p);
}

/** Returns true if every product id exists as published in the catalog map */
export function buildDiscoveryReply(
  query: string,
  keywords: string[],
  products: DiscoveryProduct[],
): string {
  if (products.length === 0) {
    return keywords.length > 0
      ? `I couldn't find live listings matching ${keywords.slice(0, 4).map((k) => `"${k}"`).join(", ")} yet. Try a product name or category (e.g. thruster, tablet, GPS).`
      : `Tell me a product name or part type — I'll search our live catalog only.`;
  }

  return `Here ${products.length === 1 ? "is" : "are"} ${products.length} live listing${products.length === 1 ? "" : "s"} from Ocean Hotspot for "${query.trim()}". Each link below is a real product in our catalog — I don't suggest items we don't stock.`;
}

export function verifyProductsLive(
  products: DiscoveryProduct[],
  publishedById: Map<string, { title: string }>,
): { ok: boolean; invalidIds: string[] } {
  const invalidIds = products
    .filter((p) => !publishedById.has(p.id))
    .map((p) => p.id);
  return { ok: invalidIds.length === 0, invalidIds };
}
