// @ts-nocheck
"use client";

import { Layout } from "@/components/layout/Layout";
import { Hero } from "@/components/landing/Hero";
import { VideoSection } from "@/components/landing/VideoSection";
import { ProductGrid } from "@/components/landing/ProductGrid";
import { RecentlyViewed } from "@/components/landing/RecentlyViewed";

const Index = () => {
  return (
    <Layout>
      <div className="p-6 md:p-8 lg:p-12">
        <Hero />
        <VideoSection />
        <ProductGrid />
      </div>
      <RecentlyViewed />
    </Layout>
  );
};

export default Index;
