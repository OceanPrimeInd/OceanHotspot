// @ts-nocheck
"use client";

import { Layout } from "@/components/layout/Layout";
import { RecentlyViewed } from "@/components/landing/RecentlyViewed";
import { HomeCategoryCard } from "@/components/landing/HomeCategoryCard";
import { HOME_BOXES } from "@/lib/storefront";

const Index = () => {
  return (
    <Layout>
      <div className="bg-[linear-gradient(180deg,#f8fbff_0%,#f3f7fb_100%)] pb-8">
        <section className="px-4 pt-4 md:px-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {HOME_BOXES.map((card) => (
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
