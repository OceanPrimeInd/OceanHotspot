import {
  ActiveFilterChip,
  PRICE_RANGE_MAP,
} from "@/components/browse/vintedFilterConfig";

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
  [
    product.title,
    product.description,
    product.entity_type,
    product.domain_category,
  ]
    .map((value) => normalizeText(value))
    .join(" ");

const matchesCategoryFilter = (product: FilterableProduct, filter: ActiveFilterChip) => {
  const text = productSearchText(product);
  const pathParts = filter.value.split(">").map((part) => part.trim().toLowerCase());

  if (pathParts[0] === "all categories") return true;

  return pathParts.every((part) => {
    if (part === "all") return true;
    return text.includes(part);
  });
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
    return text.includes(part);
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

export function applyVintedFilters<T extends FilterableProduct>(
  products: T[],
  activeFilters: ActiveFilterChip[]
): T[] {
  if (activeFilters.length === 0) return products;

  return products.filter((product) =>
    activeFilters.every((filter) => {
      if (filter.group === "Category") return matchesCategoryFilter(product, filter);
      if (filter.group === "Find Parts") return matchesNestedFilter(product, filter);
      if (filter.group === "Price") return matchesPriceFilter(product, filter);
      return matchesGenericFilter(product, filter);
    })
  );
}
