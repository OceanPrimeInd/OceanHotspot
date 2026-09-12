/** Product domain_category slugs — must match Supabase domain_labels + products.domain_category */

export const PRODUCT_DOMAIN_CATEGORIES = [
  { value: "vessels", label: "Vessels" },
  { value: "engines", label: "Engines" },
  { value: "electronics", label: "Electronics" },
  { value: "electrical", label: "Electrical" },
  { value: "deck", label: "Deck" },
  { value: "pumps", label: "Pumps" },
  { value: "maintenance", label: "Maintenance" },
  { value: "safety", label: "Safety" },
  { value: "leisure", label: "Leisure" },
  { value: "services", label: "Services (Finance / Legal)" },
] as const;

export type ProductDomainCategory = (typeof PRODUCT_DOMAIN_CATEGORIES)[number]["value"];

export const VALID_DOMAIN_CATEGORY_SLUGS: ProductDomainCategory[] =
  PRODUCT_DOMAIN_CATEGORIES.map((category) => category.value);

/** Display labels including legacy slugs still in domain_category_legacy */
export const PRODUCT_CATEGORY_LABELS: Record<string, string> = {
  vessels: "Vessels",
  engines: "Engines",
  electronics: "Electronics",
  electrical: "Electrical",
  deck: "Deck",
  pumps: "Pumps",
  maintenance: "Maintenance",
  safety: "Safety",
  leisure: "Leisure",
  services: "Services",
  // Legacy slugs (read-only display)
  vessels_floating_assets: "Vessels",
  propulsion_power: "Engines",
  safety_security_response: "Safety",
  maintenance_consumables: "Maintenance",
  finance_insurance_legal: "Services",
  fishing_aquaculture: "Leisure",
  eco_compliance: "Maintenance",
  other: "Other",
};

export function getProductCategoryLabel(slug: string | null | undefined): string {
  if (!slug) return "";
  return PRODUCT_CATEGORY_LABELS[slug] ?? slug.replace(/_/g, " ");
}

export function isValidDomainCategory(slug: string): slug is ProductDomainCategory {
  return VALID_DOMAIN_CATEGORY_SLUGS.includes(slug as ProductDomainCategory);
}

/** Map pre-migration slugs to current values (edit form + CSV import) */
export const LEGACY_DOMAIN_CATEGORY_MAP: Record<string, ProductDomainCategory> = {
  vessels_floating_assets: "vessels",
  propulsion_power: "engines",
  safety_security_response: "safety",
  maintenance_consumables: "maintenance",
  finance_insurance_legal: "services",
  fishing_aquaculture: "leisure",
  eco_compliance: "maintenance",
  electronics_navigation: "electronics",
  electrical_power: "electrical",
  other: "maintenance",
};

export function normalizeDomainCategory(slug: string | null | undefined): string {
  if (!slug) return "";
  if (isValidDomainCategory(slug)) return slug;
  return LEGACY_DOMAIN_CATEGORY_MAP[slug] ?? slug;
}
