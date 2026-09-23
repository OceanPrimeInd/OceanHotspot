// @ts-nocheck
"use client";

import Link from "next/link";
import { Layout } from "@/components/layout/Layout";
import { ProductGrid } from "@/components/landing/ProductGrid";
import { RecentlyViewed } from "@/components/landing/RecentlyViewed";
import { ArrowRight, Phone, ShieldCheck, Sparkles, Store, MessageCircle } from "lucide-react";
import { HOME_CATEGORY_TILES, browseCategoryUrl } from "@/lib/navBrowse";
import { CONTACT_EMAIL, SUPPORT_PHONE, SUPPORT_PHONE_DISPLAY } from "@/config/contact";

const reasons = [
  {
    icon: MessageCircle,
    title: "Talk before you buy",
    text: "Talk to the maker or the distributor before you buy.",
  },
  {
    icon: ShieldCheck,
    title: "Specs you can check",
    text: "Part numbers, full specs and photos you can check a connector on.",
  },
  {
    icon: Store,
    title: "UK company",
    text: "UK company — contact us by email; phone support when our line is live.",
  },
  {
    icon: Phone,
    title: "People who know boats",
    text: "Questions go to real people who know boats, not a ticket black hole.",
  },
];

const Index = () => {
  return (
    <Layout>
      <div className="pb-14">
        <section className="section-shell pt-6 md:pt-8">
          <div className="relative overflow-hidden rounded-[28px] border border-[#dce4ed] bg-[linear-gradient(135deg,#f0f6fc_0%,#ffffff_45%,#fff8f4_100%)] shadow-[0_20px_50px_-30px_rgba(15,76,129,0.25)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(242,109,42,0.08),_transparent_40%),radial-gradient(circle_at_bottom_left,_rgba(15,76,129,0.06),_transparent_35%)]" />

            <div className="relative z-10 flex min-h-[360px] flex-col items-center px-5 py-10 md:px-10 md:py-12">
              <h1 className="mb-4 max-w-3xl text-center text-[2rem] font-black tracking-[-0.05em] text-primary md:text-[3rem] md:leading-[1.08]">
                The right part for your boat, from people you can talk to.
              </h1>

              <p className="mb-4 max-w-2xl text-center text-base leading-relaxed text-[#53616d] md:text-lg">
                Parts, equipment and spares for boats up to 24m, sold by the people who make and know them.
              </p>
              <p className="mb-8 text-center text-sm font-semibold text-amber-800">
                Store opening soon — browse now and contact us to order.
              </p>

              <div className="mb-6 flex w-full max-w-xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-center">
                <Link
                  href="/browse"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#f26d2a] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(242,109,42,0.3)] transition hover:bg-[#d95a1a] sm:flex-none md:text-base"
                >
                  Browse the catalogue
                </Link>
                <Link
                  href="/discover"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-primary bg-white px-7 py-3.5 text-sm font-semibold text-primary shadow-sm transition hover:bg-primary/10 sm:flex-none md:text-base"
                >
                  <Sparkles className="h-4 w-4 md:h-5 md:w-5" />
                  Find products
                </Link>
                <Link
                  href="/showrooms"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#dfe3e7] bg-white px-7 py-3.5 text-sm font-semibold text-[#32414a] transition hover:border-primary/35 sm:flex-none md:text-base"
                >
                  <Store className="h-4 w-4 md:h-5 md:w-5" />
                  Showrooms
                </Link>
              </div>

              {SUPPORT_PHONE ? (
                <a
                  href={`tel:${SUPPORT_PHONE.replace(/\s/g, "")}`}
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  Call us on {SUPPORT_PHONE_DISPLAY}
                </a>
              ) : (
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-sm text-[#53616d] hover:text-primary">
                  Questions? {CONTACT_EMAIL}
                </a>
              )}
            </div>
          </div>
        </section>

        <section className="section-shell mb-16 mt-12">
          <div className="rounded-[2rem] border border-[#e7e5e3] bg-white/90 p-5 shadow-[0_20px_45px_-30px_rgba(15,34,87,0.18)] md:p-7">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Shop by category</p>
                <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] text-[#1d2a2f]">Explore the catalogue</h2>
              </div>
              <Link href="/browse" className="hidden text-sm font-semibold text-primary hover:text-primary/90 md:inline-flex">
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

        <section className="section-shell mb-16">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Why buy here</p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] text-[#1d2a2f]">
              From people who know your kit
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {reasons.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="rounded-[1.5rem] border border-[#e7e5e3] bg-white p-5 shadow-[0_18px_42px_-32px_rgba(15,34,87,0.35)]"
              >
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
