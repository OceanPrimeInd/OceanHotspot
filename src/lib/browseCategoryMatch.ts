import { navLabelToCategorySlug } from "@/lib/navBrowse";
import { normalizeDomainCategory } from "@/config/productCategories";

const SLUG_TO_NAV_LABEL: Record<string, string> = {
  vessels: "Vessels",
  engines: "Engines",
  electronics: "Electronics",
  electrical: "Electrical",
  deck: "Deck",
  pumps: "Pumps",
  maintenance: "Maintenance",
  safety: "Safety",
  leisure: "Leisure",
  services: "Finance & insurance",
};

export function categorySlugFromNavLabel(label: string): string | null {
  return navLabelToCategorySlug(label);
}

export function navLabelFromCategorySlug(slug: string): string {
  return SLUG_TO_NAV_LABEL[slug] ?? slug.replace(/_/g, " ");
}

const normalizeText = (value: string | null | undefined) =>
  (value ?? "").toLowerCase().replace(/[_-]/g, " ");

export type CategoryMatchable = {
  title: string;
  description?: string | null;
  entity_type?: string | null;
  domain_category?: string | null;
  brand?: string | null;
  part_number?: string | null;
};

export function productSearchText(product: CategoryMatchable): string {
  return [
    product.title,
    product.description,
    product.entity_type,
    product.domain_category,
    product.brand,
    product.part_number,
  ]
    .map((value) => normalizeText(value))
    .join(" ");
}

/** First segment of filter value → domain_category slug (engines, electrical, …) */
export function domainSlugFromFilterValue(filterValue: string): string | null {
  const parts = filterValue
    .split(">")
    .map((part) => part.trim())
    .filter((part) => part && !/^all(\s+categories)?$/i.test(part));

  if (parts.length === 0) return null;

  const first = parts[0];
  const fromNav = navLabelToCategorySlug(first);
  if (fromNav) return fromNav;

  const lower = first.toLowerCase();
  if (navLabelToCategorySlug(navLabelFromCategorySlug(lower))) return lower;

  return lower.replace(/\s+/g, "_");
}

/** Title/brand keywords when domain_category is missing or coarse (e.g. bulk import). */
const SLUG_KEYWORDS: Record<string, string[]> = {
  vessels: [
    "yacht",
    "motorboat",
    "sailboat",
    "rib",
    "catamaran",
    "tender",
    "dinghy",
    "kayak",
    "canoe",
    "houseboat",
    "barge",
    "workboat",
    "pontoon",
  ],
  engines: [
    "webasto",
    "heater",
    "generator",
    "fischer panda",
    "exhaust",
    "thruster",
    "sleipner",
    "engine",
    "propeller",
    "bow thruster",
    "stern thruster",
    "air conditioning",
    "air con",
    "cool vx",
    "ebersp",
  ],
  electronics: [
    "chartplotter",
    "gps",
    "radar",
    "ais",
    "vhf",
    "simrad",
    "garmin",
    "raymarine",
    "lowrance",
    "fishfinder",
    "transducer",
  ],
  electrical: [
    "solar",
    "battery",
    "charge controller",
    "mppt",
    "inverter",
    "victron",
    "shore power",
    "switch panel",
    "lighting",
    "electrical",
  ],
  deck: ["anchor", "windlass", "fender", "mooring", "cleat", "hatch", "deck", "rigging", "winch"],
  pumps: ["pump", "bilge", "watermaker", "plumbing", "toilet", "macerator", "sanitation"],
  maintenance: ["paint", "antifoul", "cleaner", "anode", "service kit", "filter", "oil", "sealant"],
  safety: ["life jacket", "liferaft", "epirb", "flare", "fire extinguisher", "mob "],
  leisure: ["towable", "kayak", "paddle", "fishing", "rod holder", "watersport"],
  services: ["insurance", "finance", "legal", "survey"],
};

export function inferDomainSlugFromProduct(product: CategoryMatchable): string | null {
  const text = productSearchText(product);
  for (const [slug, keywords] of Object.entries(SLUG_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) return slug;
  }
  return normalizeDomainCategory(product.domain_category || "") || null;
}

const VESSEL_LISTING =
  /\b(yachts?|motorboats?|sailboats?|ribs?|catamarans?|tenders?|dingh(?:y|ies)|kayaks?|canoes?|houseboats?|barges?|workboats?|pontoons?|narrowboats?|canal boats?|fishing boats?|passenger vessels?)\b/i;

/** A listing counts as a vessel only when the title is a boat, not a part for a boat. */
export function isVesselListing(product: CategoryMatchable): boolean {
  return VESSEL_LISTING.test(`${product.title} ${product.entity_type ?? ""}`);
}

export function matchesDomainSlug(product: CategoryMatchable, slug: string): boolean {
  if (!slug) return true;
  if (slug === "vessels") return isVesselListing(product);
  const productCat = normalizeDomainCategory(product.domain_category || "").toLowerCase();
  // A product already filed under another department stays there.
  // This keeps parts and accessories out of Vessels.
  if (productCat && productCat in SLUG_KEYWORDS) return productCat === slug;
  if (productCat === slug) return true;

  const text = productSearchText(product);
  if (text.includes(slug.replace(/_/g, " "))) return true;

  const keywords = SLUG_KEYWORDS[slug];
  if (keywords?.some((kw) => text.includes(kw))) return true;

  return inferDomainSlugFromProduct(product) === slug;
}

/** Mega-menu / filter labels copied into &q= — not a real product search. */
export function isNavigationBreadcrumbQuery(
  q: string | null | undefined,
  label: string | null | undefined,
  cat: string | null | undefined,
): boolean {
  if (!cat || !q?.trim()) return false;
  const qt = q.trim().toLowerCase();
  if (qt.includes(",")) return true;
  if (label) {
    const norm = (s: string) => s.toLowerCase().replace(/[/>&]+/g, " ").replace(/\s+/g, " ").trim();
    if (norm(q) === norm(label) || norm(label).includes(norm(q)) || norm(q).includes(norm(label))) {
      return true;
    }
  }
  // Taxonomy crumbs often repeat the nav slug as words
  if (qt.split(/\s+/).every((t) => t === cat || t === "propulsion" || t === "steering" || t === "&")) {
    return true;
  }
  return false;
}

/** Header / URL ?cat=engines plus optional &q= keywords */
export function matchesCatAndQuery(product: CategoryMatchable, cat: string | null, query: string | null): boolean {
  if (cat && !matchesDomainSlug(product, cat)) return false;

  const q = (query || "").trim().toLowerCase();
  if (!q) return true;

  const tokens = q
    .split(/\s+/)
    .map((t) => t.toLowerCase())
    .filter((t) => t.length > 1 && t !== "&" && t !== "and");
  if (tokens.length === 0) return true;

  const text = productSearchText(product);
  return tokens.every((token) => text.includes(token.replace(/_/g, " ")));
}
