// @ts-nocheck
"use client";

import Link from "next/link";
import { Layout } from "@/components/layout/Layout";
import { RecentlyViewed } from "@/components/landing/RecentlyViewed";
import { HomeCategoryCard } from "@/components/landing/HomeCategoryCard";
import { HOME_CARDS } from "@/lib/storefront";
import { isShopOpen } from "@/config/shop";

const Index = () => {
  const shopOpen = isShopOpen();

  return (
    <Layout>
      <div className="bg-[linear-gradient(180deg,#f8fbff_0%,#f3f7fb_100%)] pb-8">
        <section className="px-5 pt-6 md:px-6 md:pt-8">
          <div className="mb-5 flex flex-col items-center rounded-2xl border border-[#d5e4f2] bg-[linear-gradient(135deg,#b7d0ec_0%,#dce8f6_52%,#f6d7c4_100%)] px-6 py-8 text-center md:px-10 md:py-10">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-primary">
              Ocean Hotspot
            </p>
            <h1 className="mt-2 max-w-3xl text-3xl font-bold leading-tight text-primary md:text-5xl">
              Parts, services and records for your boat.
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#46545f] md:text-lg">
              {shopOpen
                ? "Shop products, book services, and keep fuel and training records in one place."
                : "Opening soon. Browse the catalogue, save a wish list, and we will tell you the day we open."}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link
                href="/browse"
                className="inline-flex bg-[#f26d2a] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#c9521a]"
              >
                Shop products
              </Link>
              {!shopOpen && (
                <Link
                  href="/wishlist"
                  className="inline-flex border-2 border-primary bg-white px-5 py-2.5 text-sm font-bold text-primary hover:bg-[#f2f6fa]"
                >
                  Start a wish list
                </Link>
              )}
            </div>
          </div>

          <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {HOME_CARDS.map((card) => (
              <HomeCategoryCard key={card.title} card={card} />
            ))}
          </div>
        </section>

        <RecentlyViewed />
      </div>
    </Layout>
  );
};

export default Index;
