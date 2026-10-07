// @ts-nocheck
"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { RecentlyViewed } from "@/components/landing/RecentlyViewed";
import { HomeBoxes } from "@/components/landing/HomeBoxes";
import { ProductGrid } from "@/components/landing/ProductGrid";
import { HOME_CATEGORY_TILES, browseCategoryUrl } from "@/lib/navBrowse";

const Index = () => {
  return (
    <Layout>
      <div className="bg-[linear-gradient(180deg,#f8fbff_0%,#f3f7fb_100%)] pb-8">
        <HomeBoxes />
        <section className="mx-auto mt-3 w-full max-w-[1500px] px-3 md:px-4">
          <div className="rounded-[2rem] border border-[#e7e5e3] bg-white/90 p-5 shadow-[0_20px_45px_-30px_rgba(15,34,87,0.18)] md:p-7">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Shop by category</p>
                <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] text-[#1d2a2f]">Explore the catalogue</h2>
              </div>
              <Link href="/browse" className="hidden items-center text-sm font-semibold text-primary hover:text-primary/90 md:inline-flex">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <div className="flex flex-wrap gap-3">
              {HOME_CATEGORY_TILES.map(({ label, slug }) => (
                <Link
                  key={label}
                  href={browseCategoryUrl(slug)}
                  className="rounded-full border border-[#dfe3e7] bg-[#f6f8fa] px-4 py-2 text-sm font-medium text-[#32414a] transition-colors hover:border-primary/35 hover:bg-primary/10 hover:text-primary"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </section>
        <ProductGrid />
        <RecentlyViewed />
      </div>
    </Layout>
  );
};

export default Index;
