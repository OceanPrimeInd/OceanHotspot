// @ts-nocheck
"use client";

import Link from "next/link";
import { Layout } from "@/components/layout/Layout";
import { ProductGrid } from "@/components/landing/ProductGrid";
import { RecentlyViewed } from "@/components/landing/RecentlyViewed";
import { ArrowRight, BarChart3, Play, ShieldCheck, Sparkles, Store, Truck, Waves } from "lucide-react";

const reasons = [
  {
    icon: ShieldCheck,
    title: "Verified quality",
    text: "Every seller is reviewed for reputation, compliance, and service reliability.",
  },
  {
    icon: Truck,
    title: "Fast global sourcing",
    text: "Connect with distributors and suppliers that move quickly across ports and regions.",
  },
  {
    icon: BarChart3,
    title: "Smart discovery",
    text: "Use AI-assisted discovery to match the right equipment with your exact marine needs.",
  },
  {
    icon: Waves,
    title: "Built for marine operations",
    text: "From yachts to professional vessels, source equipment designed for real-world use.",
  },
];

const Index = () => {
  return (
    <Layout>
      <div className="pb-14">
        <section className="section-shell pt-6 md:pt-8">
          <div className="relative overflow-hidden rounded-[28px] border border-[#dce4ed] bg-[linear-gradient(135deg,#f0f6fc_0%,#ffffff_45%,#fff8f4_100%)] shadow-[0_20px_50px_-30px_rgba(15,76,129,0.25)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(242,109,42,0.08),_transparent_40%),radial-gradient(circle_at_bottom_left,_rgba(15,76,129,0.06),_transparent_35%)]" />

            <div className="relative z-10 flex min-h-[420px] flex-col items-center px-5 py-8 md:px-10 md:py-10">
              <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                The marine marketplace
              </p>

              <h1 className="mb-4 max-w-3xl text-center text-[2rem] font-black tracking-[-0.05em] text-primary md:text-[3rem] md:leading-[1.08]">
                Buy, sell &amp; source everything for your vessel
              </h1>

              <p className="mb-8 max-w-2xl text-center text-base leading-relaxed text-[#53616d] md:text-lg">
                From navigation and propulsion to safety gear and maintenance — discover trusted sellers,
                compare products, and find exactly what your boat needs.
              </p>

              <div className="mb-10 flex w-full max-w-xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-center">
                <Link
                  href="/discover"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#f26d2a] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(242,109,42,0.3)] transition hover:bg-[#d95a1a] sm:flex-none md:text-base"
                >
                  <Sparkles className="h-4 w-4 md:h-5 md:w-5" />
                  AI Discovery Assistant
                </Link>
                <Link
                  href="/showrooms"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-primary bg-white px-7 py-3.5 text-sm font-semibold text-primary shadow-sm transition hover:bg-primary/10 sm:flex-none md:text-base"
                >
                  <Store className="h-4 w-4 md:h-5 md:w-5" />
                  Browse Showrooms
                </Link>
              </div>

              <div className="w-full max-w-[1120px] overflow-hidden rounded-[22px] border border-[#1a3a5c] bg-[linear-gradient(135deg,#0f2236_0%,#1a2d43_50%,#132b3d_100%)] p-4 shadow-[0_20px_45px_-28px_rgba(15,34,87,0.55)] md:p-5">
                <div className="flex min-h-[220px] items-center justify-center md:min-h-[260px]">
                  <div className="flex flex-col items-center justify-center gap-4 md:gap-5">
                    <button
                      type="button"
                      className="flex h-20 w-20 items-center justify-center rounded-full bg-[#f26d2a] shadow-[0_10px_24px_rgba(242,109,42,0.35)] transition hover:scale-[1.02] md:h-24 md:w-24"
                      aria-label="Play introduction video"
                    >
                      <Play className="ml-2 h-8 w-8 fill-white text-white md:h-10 md:w-10" />
                    </button>
                    <p className="text-base font-medium text-white/90 md:text-lg">
                      See how Ocean Hotspot works — 60 seconds
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-shell mb-16 mt-12">
          <div className="rounded-[2rem] border border-[#e7e5e3] bg-white/90 p-5 shadow-[0_20px_45px_-30px_rgba(15,34,87,0.18)] md:p-7">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Popular categories</p>
                <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] text-[#1d2a2f]">Explore marine essentials</h2>
              </div>
              <Link href="/browse" className="hidden text-sm font-semibold text-primary hover:text-primary/90 md:inline-flex">
                View catalog <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            <div className="flex flex-wrap gap-3">
              {[
                "Navigation",
                "Deck gear",
                "Pumps & plumbing",
                "Electrical",
                "Safety",
                "Propulsion",
                "Yacht outfitting",
                "Maintenance",
              ].map((category) => (
                <Link
                  key={category}
                  href="/browse"
                  className="rounded-full border border-[#dfe3e7] bg-[#f6f8fa] px-4 py-2 text-sm font-medium text-[#32414a] transition-colors hover:border-primary/35 hover:bg-primary/10 hover:text-primary"
                >
                  {category}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <ProductGrid />

        <section className="section-shell mb-16">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Why Ocean Hotspot</p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] text-[#1d2a2f]">A stronger way to source marine products</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {reasons.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-[1.5rem] border border-[#e7e5e3] bg-white p-5 shadow-[0_18px_42px_-32px_rgba(15,34,87,0.35)]">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-[#1d2a2f]">{title}</h3>
                <p className="text-sm leading-6 text-[#53616d]">{text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <RecentlyViewed />
    </Layout>
  );
};

export default Index;
