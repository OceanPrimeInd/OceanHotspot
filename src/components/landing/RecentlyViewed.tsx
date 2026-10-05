"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRecentlyViewed } from "@/contexts/RecentlyViewedContext";
import { Package, Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

export function RecentlyViewed() {
  const { items, clearHistory } = useRecentlyViewed();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Don't render until mounted (avoids hydration mismatch with localStorage)
  if (!mounted || items.length === 0) {
    return null;
  }

  return (
    <section className="w-full px-3 pt-4 md:px-4">
      <div className="bg-white p-4 shadow-sm md:p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold text-headline">Recently Viewed</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearHistory}
            className="text-muted-foreground hover:text-foreground"
          >
            Clear History
          </Button>
        </div>

        {/* Horizontal Scrolling List */}
        <div className="relative">
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
            {items.map((item, index) => (
              <Link
                key={item.id}
                href={`/product/${item.id}`}
                className="flex-shrink-0 w-48 group animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="rounded-lg border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                  {/* Image */}
                  <div className="aspect-square bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center relative overflow-hidden">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <Package className="h-10 w-10 text-primary/50" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-3">
                    <h3 className="text-sm font-medium text-headline line-clamp-2 group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm font-semibold text-primary mt-1">
                      {formatPrice(item.currency, item.price)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}

            {/* View All Link */}
            {items.length > 4 && (
              <Link
                href="/browse"
                className="flex-shrink-0 w-48 rounded-lg border border-dashed border-border bg-card/50 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary hover:border-primary transition-colors"
              >
                <ChevronRight className="h-8 w-8" />
                <span className="text-sm font-medium">Browse More</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
