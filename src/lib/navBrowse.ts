import { NAV_CATEGORIES } from "@/components/browse/filterConfig";

const NAV_LABEL_TO_CAT: Record<string, string> = {
  Vessels: "vessels",
  Engines: "engines",
  Electronics: "electronics",
  Electrical: "electrical",
  Deck: "deck",
  Pumps: "pumps",
  Maintenance: "maintenance",
  Safety: "safety",
  Leisure: "leisure",
  Insurance: "services",
};

export function navLabelToCategorySlug(label: string): string | null {
  return NAV_LABEL_TO_CAT[label] ?? null;
}

/** Category listing from header / home tiles (domain_category slug). */
export function browseCategoryUrl(slug: string): string {
  return `/browse?cat=${encodeURIComponent(slug)}`;
}

export function browseUrlForNavLabel(label: string): string {
  const slug = navLabelToCategorySlug(label);
  if (!slug) return `/browse?q=${encodeURIComponent(label)}`;
  return `${browseCategoryUrl(slug)}&label=${encodeURIComponent(label)}`;
}

export const HOME_CATEGORY_TILES = NAV_CATEGORIES.map((c) => ({
  label: c.label,
  slug: navLabelToCategorySlug(c.label) ?? "maintenance",
}));
