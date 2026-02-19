// @ts-nocheck
"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { TopBar } from "@/components/landing/TopBar";
import { Footer } from "@/components/landing/Footer";
import { MobileNav } from "@/components/landing/MobileNav";
import { FilterSidebar } from "@/components/browse/FilterSidebar";
import { ProductCard } from "@/components/browse/ProductCard";
import { supabase } from "@/lib/supabase/client";
import { Loader2, Package, Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useProductSearch, SearchResult } from "@/hooks/useProductSearch";
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
}

const Browse = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [categoryName, setCategoryName] = useState<string | null>(null);

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
    const q = params.get("q") || "";

    setSelectedDomains(domain ? [domain] : []);
    setSelectedEntities(entity ? [entity] : []);
    setSearchQuery(q);
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
      let query = supabase
        .from("products")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      const { data, error } = await query;

      if (!error && data) {
        setProducts(data);
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
        if (selectedDomains.length > 0 && product.domain_category) {
          if (!selectedDomains.includes(product.domain_category)) return false;
        } else if (selectedDomains.length > 0 && !product.domain_category) {
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

        // Search filter (fallback)
        if (searchQuery.trim() && searchError) {
          const query = searchQuery.toLowerCase();
          return (
            product.title.toLowerCase().includes(query) ||
            product.description?.toLowerCase().includes(query) ||
            product.entity_type?.toLowerCase().includes(query) ||
            product.domain_category?.toLowerCase().includes(query)
          );
        }

        return true;
      });
    },
    [selectedDomains, selectedEntities, priceRange, searchQuery, searchError]
  );

  // Determine which products to display
  const displayProducts = searchQuery.trim() && !searchError
    ? applyFilters(searchResults as unknown as Product[])
    : applyFilters(products);

  const isLoading = loading || searchLoading;

  // Dynamic page title
  const pageTitle = categoryName
    ? categoryName
    : "All Maritime Products & Services";

  const handleClearFilters = () => {
    setSelectedDomains([]);
    setSelectedEntities([]);
    setPriceRange([0, maxPrice]);
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

      <div className="flex flex-1">
        {/* Filter Sidebar - Desktop */}
        <FilterSidebar
          selectedDomains={selectedDomains}
          selectedEntities={selectedEntities}
          priceRange={priceRange}
          maxPrice={maxPrice}
          onDomainChange={setSelectedDomains}
          onEntityChange={setSelectedEntities}
          onPriceChange={setPriceRange}
          onClearFilters={handleClearFilters}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-24 md:pb-0">
          <div className="p-6 md:p-8">
            {/* Header */}
            <div className="mb-8 animate-slide-up">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl md:text-3xl font-bold text-headline">
                  {pageTitle}
                </h1>

                {/* Mobile Filter Button */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden">
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
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

              <p className="text-muted-foreground max-w-2xl mb-6">
                Discover everything maritime. Browse our curated selection of products and services.
              </p>

              {/* Search info */}
              {searchQuery.trim() && !searchError && totalFound > 0 && (
                <p className="text-sm text-muted-foreground mt-3">
                  Found {totalFound} results for &ldquo;{searchQuery}&rdquo;
                </p>
              )}

              {/* Active filters summary */}
              {(selectedDomains.length > 0 || selectedEntities.length > 0) && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {selectedDomains.map((d) => (
                    <span
                      key={d}
                      className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                    >
                      {d}
                    </span>
                  ))}
                  {selectedEntities.map((e) => (
                    <span
                      key={e}
                      className="inline-flex items-center rounded-full bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary"
                    >
                      {e}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : displayProducts.length === 0 ? (
              <div className="text-center py-20">
                <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold text-headline mb-2">
                  No Products Found
                </h2>
                <p className="text-muted-foreground mb-4">
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
                <p className="text-sm text-muted-foreground mb-4">
                  Showing {displayProducts.length} products
                </p>
                <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {displayProducts.map((product, index) => (
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