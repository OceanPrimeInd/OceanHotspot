import {
  ActiveFilterChip,
  PRICE_RANGE_MAP,
} from "@/components/browse/filterConfig";
import { normalizeDomainCategory } from "@/config/productCategories";

interface FilterableProduct {
  id: string;
  title: string;
  description: string | null;
  price: number;
  entity_type: string | null;
  domain_category: string | null;
  created_at: string;
}

const normalizeText = (value: string | null | undefined) =>
  (value ?? "").toLowerCase().replace(/[_-]/g, " ");

const productSearchText = (product: FilterableProduct) =>
  [product.title, product.description, product.entity_type, product.domain_category]
    .map((value) => normalizeText(value))
    .join(" ");

/** First segment of filter path = nav slug (deck, engines, …) */
function getCategorySlugFromFilter(filter: ActiveFilterChip): string | null {
  const parts = filter.value
    .split(">")
    .map((part) => part.trim().toLowerCase())
    .filter((part) => part && part !== "all" && part !== "all categories");

  if (parts.length === 0) return null;
  return parts[0];
}

const matchesCategoryFilter = (product: FilterableProduct, filter: ActiveFilterChip) => {
  const slug = getCategorySlugFromFilter(filter);
  if (!slug) return true;

  const productCat = normalizeDomainCategory(product.domain_category || "").toLowerCase();
  if (productCat === slug) return true;

  // Fallback: match nav slug as word in product text (legacy rows)
  return productSearchText(product).includes(slug);
};

const matchesPriceFilter = (product: FilterableProduct, filter: ActiveFilterChip) => {
  const range = PRICE_RANGE_MAP[filter.value];
  if (!range) return true;
  return product.price >= range[0] && product.price <= range[1];
};

const matchesNestedFilter = (product: FilterableProduct, filter: ActiveFilterChip) => {
  const text = productSearchText(product);
  const pathParts = filter.value.split(">").map((part) => part.trim().toLowerCase());

  return pathParts.every((part) => {
    if (part === "all" || part === "all categories") return true;
    return text.includes(part.replace(/_/g, " "));
  });
};

const matchesGenericFilter = (product: FilterableProduct, filter: ActiveFilterChip) => {
  const text = productSearchText(product);
  const value = normalizeText(filter.value.replace(/_/g, " "));
  const label = normalizeText(filter.label);

  if (filter.group === "Boat Type") {
    return (
      text.includes(value) ||
      text.includes(label) ||
      normalizeText(product.domain_category).includes(value)
    );
  }

  if (filter.group === "Eco & Compliance") {
    return (
      text.includes(value) ||
      text.includes(label) ||
      text.includes("eco") ||
      text.includes("certified")
    );
  }

  return text.includes(value) || text.includes(label);
};

const matchesFilter = (product: FilterableProduct, filter: ActiveFilterChip) => {
  if (filter.group === "Category") return matchesCategoryFilter(product, filter);
  if (filter.group === "Find Parts") return matchesNestedFilter(product, filter);
  if (filter.group === "Price") return matchesPriceFilter(product, filter);
  return matchesGenericFilter(product, filter);
};

export function applyBrowseFilters<T extends FilterableProduct>(
  products: T[],
  activeFilters: ActiveFilterChip[]
): T[] {
  if (activeFilters.length === 0) return products;

  const categoryFilters = activeFilters.filter((filter) => filter.group === "Category");
  const otherFilters = activeFilters.filter((filter) => filter.group !== "Category");

  return products.filter((product) => {
    const categoryMatch =
      categoryFilters.length === 0 ||
      categoryFilters.some((filter) => matchesCategoryFilter(product, filter));

    const otherMatch = otherFilters.every((filter) => matchesFilter(product, filter));

    return categoryMatch && otherMatch;
  });
}
