// @ts-nocheck
"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { TopBar } from "@/components/landing/TopBar";
import { Footer } from "@/components/landing/Footer";
import { MobileNav } from "@/components/landing/MobileNav";
import { ProductCard } from "@/components/browse/ProductCard";
import { supabase } from "@/lib/supabase/client";
import { Loader2, Package, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProductSearch } from "@/hooks/useProductSearch";
import { FilterBar } from "@/components/browse/FilterBar";
import { ActiveFilterChip, buildFilterId } from "@/components/browse/filterConfig";
import { applyBrowseFilters } from "@/lib/browseFilters";
import {
  domainSlugFromFilterValue,
  isNavigationBreadcrumbQuery,
  matchesCatAndQuery,
  navLabelFromCategorySlug,
} from "@/lib/browseCategoryMatch";
import { matchesBrowseRefine } from "@/lib/navTaxonomyMatch";
import { trackSiteSearch } from "@/lib/analytics";
import { attachSellerCompanies } from "@/lib/attachSellerCompanies";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const PAGE_SIZE = 20;

interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  entity_type: string | null;
  domain_category: string | null;
  image_url: string | null;
  created_at: string;
  part_number?: string | null;
  brand?: string | null;
  availability_status?: string | null;
  seller_company?: string | null;
}

function buildPageHref(pathname: string, searchParams: URLSearchParams, page: number) {
  const params = new URLSearchParams(searchParams.toString());
  if (page <= 1) params.delete("page");
  else params.set("page", String(page));
  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

/** Compact page list with ellipsis for large catalogues */
function visiblePages(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "ellipsis")[] = [1];
  if (current > 3) pages.push("ellipsis");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let p = start; p <= end; p++) pages.push(p);
  if (current < total - 2) pages.push("ellipsis");
  pages.push(total);
  return pages;
}

const Browse = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [categoryName, setCategoryName] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<ActiveFilterChip[]>([]);

  const [selectedEntities, setSelectedEntities] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [maxPrice, setMaxPrice] = useState(100000);

  // Sync filter states with URL params when they change (important for header dropdown navigation)
  useEffect(() => {
    const params = searchParams;
    const entity = params.get("entity");
    const cat = params.get("cat");
    const domain = params.get("domain");
    const q = params.get("q") || "";

    setSelectedEntities(entity ? [entity] : []);
    const breadcrumbQ = isNavigationBreadcrumbQuery(q, params.get("label"), cat || domain);
    const effectiveSearch = breadcrumbQ ? "" : q;
    setSearchQuery(effectiveSearch);
    if (effectiveSearch.trim().length >= 2) {
      trackSiteSearch(effectiveSearch);
    }

    // Strip legacy breadcrumb &q= from URLs (breaks category browse)
    if ((cat || domain) && breadcrumbQ && q) {
      const clean = new URLSearchParams(params.toString());
      clean.delete("q");
      const qs = clean.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }

    // Sync category chip with URL (?cat=engines&label=…) — do not bake &q= into chip (too strict)
    setActiveFilters((prev) => {
      const rest = prev.filter((f) => f.group !== "Category");
      if (!cat && !domain) return rest;

      const slug = (cat || domain).toLowerCase();
      const label = params.get("label") || navLabelFromCategorySlug(slug);
      const value = `${slug}>all`;
      const chip: ActiveFilterChip = {
        id: buildFilterId("Category", value),
        group: "Category",
        label,
        value,
      };
      return [...rest, chip];
    });
  }, [searchParams.toString()]);

  const handleFiltersChange = (filters: ActiveFilterChip[]) => {
    setActiveFilters(filters);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    const category = filters.find((f) => f.group === "Category");
    if (category) {
      const slug = domainSlugFromFilterValue(category.value);
      if (slug) params.set("cat", slug);
      params.set("label", category.label);
      params.delete("q");
      const pathParts = category.value
        .split(">")
        .map((part) => part.trim())
        .filter((part) => part && !/^all(\s+categories)?$/i.test(part));
      const tail = pathParts[pathParts.length - 1];
      if (pathParts.length > 1 && tail && tail !== slug) {
        const labelParts = category.label.split(" / ").map((part) => part.trim());
        params.set("refine", labelParts[labelParts.length - 1] ?? tail);
      } else {
        params.delete("refine");
      }
    } else {
      params.delete("cat");
      params.delete("label");
      params.delete("refine");
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const filterFingerprint = [
    searchQuery,
    searchParams.get("cat") || "",
    selectedEntities.join(","),
    priceRange[0],
    priceRange[1],
    activeFilters.map((f) => f.id).join(","),
  ].join("|");
  const prevFilterFingerprint = useRef<string | null>(null);

  // Reset to page 1 when filters or search change (not on first paint)
  useEffect(() => {
    if (prevFilterFingerprint.current === null) {
      prevFilterFingerprint.current = filterFingerprint;
      return;
    }
    if (prevFilterFingerprint.current === filterFingerprint) return;
    prevFilterFingerprint.current = filterFingerprint;
    if (!searchParams.get("page")) return;
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [filterFingerprint, pathname, router, searchParams]);

  const {
    results: searchResults,
    loading: searchLoading,
    error: searchError,
    totalFound,
    search,
  } = useProductSearch();

  // Fetch category name for display
  useEffect(() => {
    const fetchCategoryName = async () => {
      const cat = searchParams.get("cat");
      if (cat) {
        const requestedLabel = searchParams.get("label");
        if (requestedLabel) {
          setCategoryName(requestedLabel);
          return;
        }
        const { data } = await supabase
          .from("domain_labels")
          .select("label")
          .eq("code", cat)
          .single();
        if (data) setCategoryName(data.label);
        else setCategoryName(navLabelFromCategorySlug(cat));
      } else if (selectedEntities.length === 1) {
        const { data } = await supabase
          .from("entity_labels")
          .select("label")
          .eq("code", selectedEntities[0])
          .single();
        if (data) setCategoryName(data.label);
      } else {
        setCategoryName(null);
      }
    };

    fetchCategoryName();
  }, [searchParams.get("cat"), searchParams.get("label"), selectedEntities]);

  // Fetch all products from Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setProducts(await attachSellerCompanies(supabase, data || []));
        // Calculate max price from data
        if (data.length > 0) {
          const max = Math.max(...data.map((p) => p.price));
          setMaxPrice(max > 0 ? max : 100000);
          setPriceRange([0, max > 0 ? max : 100000]);
        }
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  // Debounced PostgreSQL full-text search
  useEffect(() => {
    if (!searchQuery.trim()) return;

    const debounce = setTimeout(() => {
      search(searchQuery);
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery, search]);

  // Apply all filters
  const applyFilters = useCallback(
    (productList: Product[]) => {
      return productList.filter((product) => {
        if (selectedEntities.length > 0 && product.entity_type) {
          if (!selectedEntities.includes(product.entity_type)) return false;
        } else if (selectedEntities.length > 0 && !product.entity_type) {
          return false;
        }

        if (product.price < priceRange[0] || product.price > priceRange[1]) {
          return false;
        }

        return true;
      });
    },
    [selectedEntities, priceRange]
  );

  const matchesSearchQuery = (product: Product, query: string) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      product.title.toLowerCase().includes(q) ||
      product.description?.toLowerCase().includes(q) ||
      product.part_number?.toLowerCase().includes(q) ||
      product.brand?.toLowerCase().includes(q) ||
      product.domain_category?.toLowerCase().includes(q) ||
      product.entity_type?.toLowerCase().includes(q)
    );
  };

  const catParam = searchParams.get("cat") || searchParams.get("domain");

  let displayProducts = applyFilters(products);
  displayProducts = applyBrowseFilters(displayProducts, activeFilters);

  const refineParam = searchParams.get("refine")?.trim() || "";
  const searchTerm = searchQuery.trim();
  const categoryPathDepth = (value: string | undefined) => {
    if (!value) return 0;
    return value
      .split(">")
      .map((part) => part.trim())
      .filter((part) => part && !/^all(\s+categories)?$/i.test(part)).length;
  };
  const chipDepth = categoryPathDepth(
    activeFilters.find((filter) => filter.group === "Category")?.value,
  );

  if (refineParam && catParam && chipDepth <= 1) {
    displayProducts = displayProducts.filter((product) =>
      matchesBrowseRefine(product, catParam, refineParam),
    );
  } else if (searchTerm) {
    displayProducts = displayProducts.filter((product) =>
      catParam
        ? matchesCatAndQuery(product, catParam, searchTerm)
        : matchesSearchQuery(product, searchTerm),
    );
  }

  const filteredDisplayProducts = displayProducts;

  const totalProducts = filteredDisplayProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalProducts / PAGE_SIZE));
  const rawPage = parseInt(searchParams.get("page") || "1", 10);
  const currentPage = Math.min(
    Math.max(1, Number.isFinite(rawPage) ? rawPage : 1),
    totalPages,
  );
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageEnd = Math.min(pageStart + PAGE_SIZE, totalProducts);
  const paginatedProducts = useMemo(
    () => filteredDisplayProducts.slice(pageStart, pageStart + PAGE_SIZE),
    [filteredDisplayProducts, pageStart],
  );
  const pageItems = visiblePages(currentPage, totalPages);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const isLoading = loading || searchLoading;

  const categoryFilter = activeFilters.find((filter) => filter.group === "Category");
  const pageTitle = categoryFilter
    ? categoryFilter.label.split(" / ").pop() ?? categoryFilter.label
    : categoryName
      ? categoryName
      : "All Maritime Products & Services";

  const handleClearFilters = () => {
    setSelectedEntities([]);
    setPriceRange([0, maxPrice]);
    setActiveFilters([]);
    setSearchQuery("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("cat");
    params.delete("label");
    params.delete("q");
    params.delete("refine");
    params.delete("page");
    params.delete("domain");
    params.delete("entity");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  // Mobile filter sheet content
  const FilterContent = (
    <div className="space-y-6">
      {/* Price Range */}
      <div>
        <h3 className="text-sm font-semibold text-headline mb-4">Price Range</h3>
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
          <span>£{priceRange[0].toLocaleString()}</span>
          <span>£{priceRange[1].toLocaleString()}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar />

      <div className="flex flex-1 flex-col min-h-0">
        <div className="relative z-30 shrink-0 bg-background">
          <div className="page-container pt-6 md:pt-8">
            <div className="mb-6 animate-slide-up">
              <div className="mb-4 flex items-center justify-between gap-4">
                <h1 className="text-[2.2rem] font-bold tracking-[-0.04em] text-headline">
                  {pageTitle}
                </h1>

                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden">
                      <SlidersHorizontal className="mr-2 h-4 w-4" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    {FilterContent}
                  </SheetContent>
                </Sheet>
              </div>

              {categoryFilter ? (
                <p className="mb-5 text-sm text-muted-foreground">
                  {categoryFilter.label.split(" / ").map((part, index, parts) => (
                    <span key={`${part}-${index}`}>
                      {index > 0 && <span className="mx-1.5 text-[#b8c4cc]">/</span>}
                      <span className={index === parts.length - 1 ? "font-medium text-[#1d2a2f]" : ""}>
                        {part}
                      </span>
                    </span>
                  ))}
                </p>
              ) : (
                <p className="mb-5 max-w-2xl text-[1.05rem] text-muted-foreground">
                  Discover everything maritime. Browse our curated selection of products and services.
                </p>
              )}

              {selectedEntities.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {selectedEntities.map((e) => (
                    <span key={e} className="inline-flex items-center rounded-full bg-[#f4f5f7] px-3 py-1.5 text-xs font-medium text-[#4a5564]">
                      {e}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <FilterBar activeFilters={activeFilters} onFiltersChange={handleFiltersChange} />
          </div>
        </div>

        <main className="flex-1 overflow-y-auto pb-24 md:pb-0">
          <div className="page-container pb-8 pt-2">
            {searchQuery.trim() && !searchError && totalFound > 0 && (
              <p className="mb-4 text-sm text-muted-foreground">
                Found {totalFound} results for &ldquo;{searchQuery}&rdquo;
              </p>
            )}

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredDisplayProducts.length === 0 ? (
              <div className="py-20 text-center">
                <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h2 className="mb-2 text-xl font-semibold text-headline">No Products Found</h2>
                <p className="mb-4 text-muted-foreground">
                  {searchQuery
                    ? "Try adjusting your search or filters."
                    : "Be the first to list a product on Ocean Hotspot!"}
                </p>
                <Button variant="outline" onClick={handleClearFilters}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <>
                <p className="mb-4 text-sm text-muted-foreground">
                  Showing {pageStart + 1}–{pageEnd} of {totalProducts} products
                  {totalPages > 1 && (
                    <span className="text-muted-foreground/80">
                      {" "}
                      · Page {currentPage} of {totalPages}
                    </span>
                  )}
                </p>
                <div className="relative z-0 isolate grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {paginatedProducts.map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <Pagination className="mt-10">
                    <PaginationContent>
                      <PaginationItem>
                        {currentPage > 1 ? (
                          <PaginationPrevious href={buildPageHref(pathname, searchParams, currentPage - 1)} />
                        ) : (
                          <span className="pointer-events-none opacity-40">
                            <PaginationPrevious href="#" aria-disabled />
                          </span>
                        )}
                      </PaginationItem>
                      {pageItems.map((item, idx) =>
                        item === "ellipsis" ? (
                          <PaginationItem key={`e-${idx}`}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        ) : (
                          <PaginationItem key={item}>
                            <PaginationLink
                              href={buildPageHref(pathname, searchParams, item)}
                              isActive={item === currentPage}
                            >
                              {item}
                            </PaginationLink>
                          </PaginationItem>
                        ),
                      )}
                      <PaginationItem>
                        {currentPage < totalPages ? (
                          <PaginationNext href={buildPageHref(pathname, searchParams, currentPage + 1)} />
                        ) : (
                          <span className="pointer-events-none opacity-40">
                            <PaginationNext href="#" aria-disabled />
                          </span>
                        )}
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      <Footer />
      <MobileNav />
    </div>
  );
};

export default Browse;