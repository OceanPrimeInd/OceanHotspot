"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/utils";
import { Package, Loader2 } from "lucide-react";
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
      <section className="mb-12">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-o42-blue" />
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <h2 className="text-xl font-bold text-near-black mb-6">Products</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
              className="bg-card border border-border rounded-md overflow-hidden transition-all cursor-pointer hover:shadow-md hover:-translate-y-0.5 group"
            >
              <div className="aspect-square bg-muted flex items-center justify-center relative overflow-hidden">
                {hasImage ? (
                  <>
                    <img
                      src={allImages[0]}
                      alt={product.title}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                    />
                    {imageCount > 1 && (
                      <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        +{imageCount - 1} more
                      </span>
                    )}
                  </>
                ) : placeholder ? (
                  <div className="w-full h-full group-hover:scale-105 transition-transform duration-200">
                    {placeholder}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Package className="h-8 w-8 mb-1" />
                    <span className="text-xs">Product Image</span>
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="text-sm font-medium text-foreground line-clamp-2 leading-tight mb-1 group-hover:text-primary transition-colors">
                  {product.title}
                </h3>
                {product.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {product.description}
                  </p>
                )}
                <div className="mt-auto">
                  {product.price > 0 ? (
                    <span className="text-sm font-semibold text-foreground">
                      {formatPrice(product.currency, product.price)}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Price on request</span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
