// @ts-nocheck
"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { TopBar } from "@/components/landing/TopBar";
import { Footer } from "@/components/landing/Footer";
import { MobileNav } from "@/components/landing/MobileNav";
import { ProductCard } from "@/components/browse/ProductCard";
import { supabase } from "@/lib/supabase/client";
import { Loader2, Package, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProductSearch } from "@/hooks/useProductSearch";
import { FilterBar } from "@/components/browse/FilterBar";
import { ActiveFilterChip } from "@/components/browse/filterConfig";
import { applyBrowseFilters } from "@/lib/browseFilters";
import { trackSiteSearch } from "@/lib/analytics";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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
  availability_status?: string | null;
  seller_company?: string | null;
}

const DOMAIN_CODE_TO_PRODUCT_VALUES: Record<string, string[]> = {
  garmin: ["garmin"],
  raymarine: ["raymarine"],
  simrad: ["simrad"],
  bg: ["bg", "b_and_g"],
  lowrance: ["lowrance"],
  victron_energy: ["victron_energy", "victron"],
  blue_sea_systems: ["blue_sea_systems", "blue_sea"],
  lewmar: ["lewmar"],
  harken: ["harken"],
  vetus: ["vetus"],
  yanmar: ["yanmar"],
  mercury: ["mercury"],
  yamaha: ["yamaha"],
  volvo_penta: ["volvo_penta", "volvo"],
  other_vendor: ["other_vendor", "vendor"],
  sailboats: ["sailboats", "sailing"],
  motorboats: ["motorboats", "motoryacht"],
  ribs: ["ribs", "rib"],
  fishing_boats: ["fishing_boats", "fishing"],
  catamarans: ["catamarans", "catamaran"],
  yachts: ["yachts", "yacht"],
  canal_boats: ["canal_boats", "canal"],
  commercial_vessels: ["commercial_vessels", "commercial"],
  engine_brand: ["engine_brand", "engine_brand_name"],
  engine_model: ["engine_model", "model"],
  parts_service_kits: ["parts_service_kits", "service_kits", "parts"],
  manufacturer_part_number: ["manufacturer_part_number", "part_number", "mpn"],
  eco_rated: ["eco_rated", "eco", "eco-rated"],
  certified: ["certified", "certification"],
};

const normalizeDomainValues = (value: string | null): string[] => {
  if (!value) return [];

  const raw = value.trim();
  if (!raw) return [];

  const variants = new Set<string>();
  variants.add(raw);
  variants.add(raw.toLowerCase());
  variants.add(raw.replace(/\s+/g, "_"));
  variants.add(raw.replace(/\s+/g, "_").toLowerCase());
  variants.add(raw.replace(/-/g, "_"));
  variants.add(raw.replace(/-/g, "_").toLowerCase());

  return [...variants];
};

const matchesSelectedDomain = (productDomain: string | null, selectedDomains: string[]) => {
  if (selectedDomains.length === 0) return true;
  if (!productDomain) return false;

  const selectedMatches = new Set<string>();
  selectedDomains.forEach((code) => {
    const mappedValues = DOMAIN_CODE_TO_PRODUCT_VALUES[code] ?? [code];
    mappedValues.forEach((value) => {
      normalizeDomainValues(value).forEach((variant) => selectedMatches.add(variant));
    });
  });

  return normalizeDomainValues(productDomain).some((variant) => selectedMatches.has(variant));
};

const Browse = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [categoryName, setCategoryName] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<ActiveFilterChip[]>([]);

  // Filter states
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [selectedEntities, setSelectedEntities] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [maxPrice, setMaxPrice] = useState(100000);

  // Sync filter states with URL params when they change (important for header dropdown navigation)
  useEffect(() => {
    const params = searchParams;
    const domain = params.get("domain");
    const entity = params.get("entity");
    const cat = params.get("cat");
    const q = params.get("q") || "";

    setSelectedDomains(domain ? [domain] : cat ? [cat] : []);
    setSelectedEntities(entity ? [entity] : []);
    setSearchQuery(q);
    if (q.trim().length >= 2) {
      trackSiteSearch(q);
    }
  }, [searchParams.toString()]);

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
      if (selectedDomains.length === 1) {
        const { data } = await supabase
          .from("domain_labels")
          .select("label")
          .eq("code", selectedDomains[0])
          .single();
        if (data) setCategoryName(data.label);
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
  }, [selectedDomains, selectedEntities]);

  // Fetch all products from Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*, profiles(company_name)")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setProducts(
          (data || []).map((row: any) => ({
            ...row,
            seller_company: row.profiles?.company_name ?? null,
          })),
        );
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
        // Domain filter
        if (!matchesSelectedDomain(product.domain_category, selectedDomains)) {
          return false;
        }

        // Entity filter
        if (selectedEntities.length > 0 && product.entity_type) {
          if (!selectedEntities.includes(product.entity_type)) return false;
        } else if (selectedEntities.length > 0 && !product.entity_type) {
          return false;
        }

        // Price filter
        if (product.price < priceRange[0] || product.price > priceRange[1]) {
          return false;
        }

        return true;
      });
    },
    [selectedDomains, selectedEntities, priceRange]
  );

  const matchesSearchQuery = (product: Product, query: string) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      product.title.toLowerCase().includes(q) ||
      product.description?.toLowerCase().includes(q) ||
      product.part_number?.toLowerCase().includes(q) ||
      product.domain_category?.toLowerCase().includes(q) ||
      product.entity_type?.toLowerCase().includes(q)
    );
  };

  const searchFilteredProducts = searchQuery.trim()
    ? products.filter((product) => matchesSearchQuery(product, searchQuery))
    : products;

  const displayProducts = applyFilters(searchFilteredProducts);

  const filteredDisplayProducts = applyBrowseFilters(displayProducts, activeFilters);

  const isLoading = loading || searchLoading;

  const categoryFilter = activeFilters.find((filter) => filter.group === "Category");
  const pageTitle = categoryFilter
    ? categoryFilter.label.split(" / ").pop() ?? categoryFilter.label
    : categoryName
      ? categoryName
      : "All Maritime Products & Services";

  const handleClearFilters = () => {
    setSelectedDomains([]);
    setSelectedEntities([]);
    setPriceRange([0, maxPrice]);
    setActiveFilters([]);
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

              {(selectedDomains.length > 0 || selectedEntities.length > 0) && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {selectedDomains.map((d) => (
                    <span key={d} className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
                      {d}
                    </span>
                  ))}
                  {selectedEntities.map((e) => (
                    <span key={e} className="inline-flex items-center rounded-full bg-[#f4f5f7] px-3 py-1.5 text-xs font-medium text-[#4a5564]">
                      {e}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <FilterBar
              activeFilters={activeFilters}
              onFiltersChange={setActiveFilters}
            />
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
                  Showing {filteredDisplayProducts.length} products
                </p>
                <div className="relative z-0 isolate grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {filteredDisplayProducts.map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} />
                  ))}
                </div>
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