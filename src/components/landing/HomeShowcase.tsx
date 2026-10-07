"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Package } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/utils";
import { cleanListingCopy } from "@/lib/listingCopy";
import { getPlaceholderSvg } from "@/lib/productPlaceholders";
import { HOME_BOXES } from "@/lib/storefront";

type HomeProduct = {
  id: string;
  title: string;
  price: number;
  currency: string;
  image_url: string | null;
};

function Rail({ children }: { children: ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const update = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    setAtStart(track.scrollLeft <= 1);
    setAtEnd(track.scrollLeft + track.clientWidth >= track.scrollWidth - 1);
  }, []);

  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update, children]);

  const scrollByPage = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth, behavior: "smooth" });
  };

  return (
    <div className="relative min-h-0 min-w-0">
      <div
        ref={trackRef}
        onScroll={update}
        className="flex h-full gap-3 overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
      <button
        type="button"
        aria-label="Previous"
        hidden={atStart}
        onClick={() => scrollByPage(-1)}
        className="absolute left-1.5 top-1/2 z-10 h-16 w-11 -translate-y-1/2 rounded-lg border-0 bg-white text-3xl text-[#111] shadow-[0_2px_8px_rgba(0,0,0,0.35)] hover:bg-[#f7f7f7] [&[hidden]]:hidden"
      >
        ‹
      </button>
      <button
        type="button"
        aria-label="Next"
        hidden={atEnd}
        onClick={() => scrollByPage(1)}
        className="absolute right-1.5 top-1/2 z-10 h-16 w-11 -translate-y-1/2 rounded-lg border-0 bg-white text-3xl text-[#111] shadow-[0_2px_8px_rgba(0,0,0,0.35)] hover:bg-[#f7f7f7] [&[hidden]]:hidden"
      >
        ›
      </button>
    </div>
  );
}

function ProductFace({ product, large }: { product: HomeProduct; large?: boolean }) {
  const title = cleanListingCopy(product.title);
  const placeholder = getPlaceholderSvg(product.title);

  return (
    <Link
      href={`/product/${product.id}`}
      className={`flex h-full shrink-0 snap-start flex-col justify-between rounded-[10px] bg-white p-4 text-[#0f1111] shadow-sm ${
        large ? "w-[340px]" : "w-[200px]"
      }`}
    >
      <div>
        <h3 className={`font-bold leading-tight ${large ? "text-xl" : "text-base"}`}>{title}</h3>
        {product.price > 0 && (
          <p className="mt-2 text-sm font-semibold text-primary">
            {formatPrice(product.currency, product.price)}{" "}
            <span className="text-xs font-normal text-[#555]">ex VAT</span>
          </p>
        )}
      </div>
      <div className="mt-3 flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-lg bg-[#f3f7fb]">
        {product.image_url ? (
          <img src={product.image_url} alt="" className="h-full max-h-full w-full object-contain" />
        ) : (
          placeholder ?? <Package className="h-10 w-10 text-[#0c2340]" />
        )}
      </div>
    </Link>
  );
}

export function HomeShowcase() {
  const [products, setProducts] = useState<HomeProduct[]>([]);
  const feature = HOME_BOXES[0];

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("products")
      .select("id, title, price, currency, image_url")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(16)
      .then(({ data }) => {
        if (!cancelled && data) setProducts(data as HomeProduct[]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const bigCount = Math.min(6, Math.max(1, products.length - 4));
  const big = products.slice(0, bigCount);
  const small = products.slice(bigCount);

  return (
    <section className="grid grid-cols-1 gap-3 px-3 pt-3 md:px-4 lg:h-[640px] lg:grid-cols-[420px_1fr]">
      <Link
        href={feature.href}
        className="flex min-h-72 flex-col justify-between rounded-[10px] bg-[#d7e6f7] p-5 text-[#0c2340]"
      >
        <div>
          <h2 className="text-3xl font-bold leading-tight">{feature.title}</h2>
          <p className="mt-2 text-lg">{feature.message}</p>
        </div>
        <div className="mt-4 flex flex-1 items-center justify-center rounded-lg bg-white/50">
          <Package className="h-16 w-16" strokeWidth={1.75} />
        </div>
      </Link>

      <div className="grid min-h-0 min-w-0 grid-rows-[320px_220px] gap-3 lg:grid-rows-[2fr_1fr]">
        <Rail>
          {big.map((product) => (
            <ProductFace key={product.id} product={product} large />
          ))}
        </Rail>
        <Rail>
          {small.map((product) => (
            <ProductFace key={product.id} product={product} />
          ))}
        </Rail>
      </div>
    </section>
  );
}
