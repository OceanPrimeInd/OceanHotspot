"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/utils";
import { Package, Loader2, Star } from "lucide-react";
import { getPlaceholderSvg } from "@/lib/productPlaceholders";

interface Product {
  id: string;
  title: string;
  price: number;
  currency: string;
  image_url: string | null;
  images: string[] | null;
  description: string | null;
}

export function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, title, price, currency, image_url, images, description")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(8);

      if (!error && data) {
        setProducts(data);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <section className="section-shell mb-16">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="section-shell mb-16">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Featured products</p>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] text-slate-900">Built for serious marine buyers</h2>
        </div>
        <Link href="/browse" className="hidden text-sm font-semibold text-primary hover:text-primary/90 md:inline-flex">
          Explore all products →
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => {
          const allImages = [
            ...(product.image_url ? [product.image_url] : []),
            ...(product.images || []),
          ].filter((img, idx, arr) => arr.indexOf(img) === idx);
          const hasImage = allImages.length > 0;
          const imageCount = allImages.length;
          const placeholder = getPlaceholderSvg(product.title);

          return (
            <Link
              href={`/product/${product.id}`}
              key={product.id}
              className="group overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_18px_40px_-30px_rgba(15,34,87,0.35)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_-20px_rgba(15,34,87,0.55)]"
            >
              <div className="relative aspect-square overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(17,63,186,0.08),_rgba(255,255,255,0.5)_60%)]">
                {hasImage ? (
                  <>
                    <img
                      src={allImages[0]}
                      alt={product.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {imageCount > 1 && (
                      <span className="absolute bottom-3 right-3 rounded-full bg-slate-900/75 px-2.5 py-1 text-[10px] font-medium text-white">
                        +{imageCount - 1} more
                      </span>
                    )}
                  </>
                ) : placeholder ? (
                  <div className="h-full w-full transition-transform duration-300 group-hover:scale-105">
                    {placeholder}
                  </div>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-slate-500">
                    <Package className="mb-2 h-8 w-8" />
                    <span className="text-xs uppercase tracking-[0.15em]">Product</span>
                  </div>
                )}
              </div>

              <div className="space-y-3 p-4">
                <div className="flex items-center justify-between gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  <span>Marine essentials</span>
                  <span className="flex items-center gap-1 text-[#ff7a35]">
                    <Star className="h-3 w-3 fill-current" />
                    4.9
                  </span>
                </div>

                <h3 className="line-clamp-2 text-base font-semibold leading-snug text-slate-900 group-hover:text-primary">
                  {product.title}
                </h3>

                {product.description && (
                  <p className="line-clamp-2 text-sm text-slate-600">{product.description}</p>
                )}

                <div className="flex items-center justify-between pt-1">
                  {product.price > 0 ? (
                    <span className="text-lg font-black text-slate-900">{formatPrice(product.currency, product.price)}</span>
                  ) : (
                    <span className="text-sm text-slate-500">Price on request</span>
                  )}
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-primary">
                    In stock
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
