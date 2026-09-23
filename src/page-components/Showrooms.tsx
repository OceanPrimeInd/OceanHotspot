// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/lib/supabase/client";
import { Loader2, Store, MapPin, Package, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Showroom {
  slug: string;
  brand_name: string;
  tagline: string | null;
  logo_url: string | null;
  banner_url: string | null;
  location: string | null;
  years_in_business: number | null;
  seller_id: string;
}

const Showrooms = () => {
  const [showrooms, setShowrooms] = useState<Showroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchShowrooms = async () => {
      const { data } = await supabase
        .from("showrooms")
        .select("slug, brand_name, tagline, logo_url, banner_url, location, years_in_business, seller_id")
        .eq("is_published", true)
        .order("brand_name", { ascending: true });

      if (data && data.length > 0) {
        setShowrooms(data);

        // Fetch product counts per seller
        const sellerIds = data.map((s) => s.seller_id);
        const { data: products } = await supabase
          .from("products")
          .select("seller_id")
          .in("seller_id", sellerIds)
          .eq("is_published", true);

        if (products) {
          const counts: Record<string, number> = {};
          products.forEach((p) => {
            counts[p.seller_id] = (counts[p.seller_id] || 0) + 1;
          });
          setProductCounts(counts);
        }
      }
      setLoading(false);
    };

    fetchShowrooms();
  }, []);

  const filtered = showrooms.filter(
    (s) =>
      s.brand_name.toLowerCase().includes(search.toLowerCase()) ||
      (s.tagline && s.tagline.toLowerCase().includes(search.toLowerCase())) ||
      (s.location && s.location.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Layout>
      {/* Hero banner */}
      <div className="bg-headline text-white py-14 px-4 text-center">
        <div className="mx-auto max-w-2xl">
          <Store className="h-10 w-10 mx-auto mb-4 opacity-80" />
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Vendor Showrooms</h1>
          <p className="text-white/70 text-base mb-4">
            Browse supplier showrooms on Ocean Hotspot — all on this site, no external shop links.
          </p>
          <p className="text-white/90 text-sm mb-8">
            To buy, contact Ocean Hotspot and we will arrange payment and dispatch with the supplier.
          </p>
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by name, category or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-12 bg-white text-foreground"
            />
          </div>
        </div>
      </div>

      <div className="container py-12">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Store className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-headline mb-2">
              {search ? "No showrooms match your search" : "No showrooms yet"}
            </h2>
            <p className="text-muted-foreground">
              {search ? "Try a different search term." : "Vendor showrooms will appear here once published."}
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-6">
              {filtered.length} {filtered.length === 1 ? "showroom" : "showrooms"} found
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((showroom) => {
                const productCount = productCounts[showroom.seller_id] || 0;
                return (
                  <Link
                    key={showroom.slug}
                    href={`/showroom/${showroom.slug}`}
                    className="group rounded-xl border border-border bg-card overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
                  >
                    {/* Banner / fallback */}
                    <div className="relative h-28 overflow-hidden bg-headline">
                      {showroom.banner_url ? (
                        <img
                          src={showroom.banner_url}
                          alt=""
                          className="w-full h-full object-cover opacity-70 group-hover:opacity-80 transition-opacity"
                        />
                      ) : (
                        <div className="w-full h-full bg-linear-to-r from-headline to-primary/80" />
                      )}
                    </div>

                    {/* Logo + info */}
                    <div className="px-5 pb-5">
                      {/* Logo overlapping banner */}
                      <div className="-mt-8 mb-3">
                        {showroom.logo_url ? (
                          <img
                            src={showroom.logo_url}
                            alt={showroom.brand_name}
                            className="h-16 w-16 rounded-xl object-contain border-2 border-background bg-white p-1 shadow-md"
                          />
                        ) : (
                          <div className="h-16 w-16 rounded-xl bg-primary/10 border-2 border-background flex items-center justify-center shadow-md">
                            <Store className="h-8 w-8 text-primary" />
                          </div>
                        )}
                      </div>

                      <h3 className="font-bold text-lg text-headline group-hover:text-primary transition-colors line-clamp-1">
                        {showroom.brand_name}
                      </h3>

                      {showroom.tagline && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {showroom.tagline}
                        </p>
                      )}

                      {/* Meta row */}
                      <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
                        {showroom.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {showroom.location}
                          </span>
                        )}
                        {productCount > 0 && (
                          <span className="flex items-center gap-1">
                            <Package className="h-3.5 w-3.5" />
                            {productCount} {productCount === 1 ? "product" : "products"}
                          </span>
                        )}
                      </div>

                      <div className="mt-4 text-xs font-semibold text-primary group-hover:underline">
                        Visit Showroom →
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Showrooms;
