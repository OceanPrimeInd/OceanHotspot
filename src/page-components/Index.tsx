// @ts-nocheck
"use client";

import Link from "next/link";
import { Layout } from "@/components/layout/Layout";
import { ProductGrid } from "@/components/landing/ProductGrid";
import { RecentlyViewed } from "@/components/landing/RecentlyViewed";
import { ArrowRight, ShieldCheck, Sparkles, Store, MessageCircle, Heart } from "lucide-react";
import { HOME_CATEGORY_TILES, browseCategoryUrl } from "@/lib/navBrowse";
import { CONTACT_EMAIL } from "@/config/contact";
import { isShopOpen } from "@/config/shop";
import { WhatsAppLink } from "@/components/shop/WhatsAppButton";
import { isWhatsAppConfigured } from "@/lib/whatsapp";
import { OpeningSoonHeroStamp } from "@/components/shop/OpeningSoonHeroStamp";

function HeroQuestionsLine({ className = "" }: { className?: string }) {
  return (
    <p className={className}>
      Questions now?{" "}
      {isWhatsAppConfigured() ? (
        <WhatsAppLink className="font-bold text-[#128C7E] hover:underline">WhatsApp us</WhatsAppLink>
      ) : (
        <Link href="/contact" className="font-bold text-[#128C7E] hover:underline">
          WhatsApp us
        </Link>
      )}{" "}
      or{" "}
      <a href={`mailto:${CONTACT_EMAIL}`} className="font-bold text-primary hover:underline">
        email us
      </a>
      .
    </p>
  );
}

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
    text: "Ocean Prime Industries Ltd, a UK registered company.",
  },
  {
    icon: MessageCircle,
    title: "People who know boats",
    text: "Questions go to real people who know boats, not a ticket black hole.",
  },
];

const UNTIL_WE_OPEN_STEPS = [
  { title: "Browse and save", text: "Add anything you want to your wish list." },
  { title: "Send us your list", text: "By form or WhatsApp, with the details of your boat." },
  {
    title: "We come back to you",
    text: "We confirm price, availability and delivery, and tell you the day we open.",
  },
];

const Index = () => {
  const shopOpen = isShopOpen();

  return (
    <Layout>
      <div className="pb-14">
        <section className="section-shell pt-6 md:pt-8">
          <div className="relative overflow-hidden rounded-[28px] border border-[#dce4ed] bg-[linear-gradient(135deg,#eaf2fa_0%,#ffffff_48%,#fff4ee_100%)] shadow-[0_22px_50px_-30px_rgba(15,76,129,0.35)]">
            {!shopOpen && <OpeningSoonHeroStamp />}

            <div
              className={`relative z-[1] grid min-h-[360px] gap-8 px-5 py-8 md:items-center md:gap-[34px] md:px-10 md:py-12 lg:px-12 lg:py-14 ${
                !shopOpen ? "md:grid-cols-[1.25fr_0.9fr]" : "md:grid-cols-1"
              }`}
            >
              <div className="relative flex flex-col items-center text-center md:items-start md:text-left">
                <p className="mb-2 text-base font-extrabold uppercase tracking-[0.14em] text-primary">
                  Marine parts, equipment and spares
                </p>

                <h1 className="mb-[18px] max-w-[640px] text-[1.9375rem] font-black leading-[1.15] tracking-[-0.025em] text-primary sm:text-[2.375rem] md:text-[3.125rem]">
                  The right part for your boat, from people you can talk to.
                </h1>

                <p className="mb-[26px] max-w-[600px] text-lg leading-relaxed text-[#46545f] md:text-[19px]">
                  Parts, equipment and spares for boats up to 24m, sold by the people who make and know them.
                </p>

                <div className="flex w-full max-w-xl flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Link
                    href="/browse"
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-transparent bg-[#f26d2a] px-[22px] py-3.5 text-base font-extrabold text-white shadow-[0_10px_24px_-10px_rgba(242,109,42,0.7)] transition hover:bg-[#c9521a] sm:flex-none"
                  >
                    Browse the catalogue
                  </Link>
                  {!shopOpen ? (
                    <Link
                      href="/wishlist"
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-primary bg-white px-[22px] py-3.5 text-base font-extrabold text-primary transition hover:bg-[#f2f6fa] sm:flex-none"
                    >
                      <Heart className="h-4 w-4" strokeWidth={2.5} />
                      Start your wish list
                    </Link>
                  ) : (
                    <Link
                      href="/discover"
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-primary bg-white px-[22px] py-3.5 text-base font-extrabold text-primary transition hover:bg-[#f2f6fa] sm:flex-none"
                    >
                      <Sparkles className="h-4 w-4" />
                      Find products
                    </Link>
                  )}
                </div>
              </div>

              {!shopOpen && (
                <div className="rounded-[20px] border border-[#dce4ed] bg-white p-6 shadow-[0_18px_40px_-28px_rgba(15,34,87,0.45)] md:p-6">
                  <h2 className="mb-3.5 text-xl font-bold text-primary">Until we open</h2>
                  <ol className="m-0 list-none space-y-3.5 p-0">
                    {UNTIL_WE_OPEN_STEPS.map((step, i) => (
                      <li key={step.title} className="grid grid-cols-[40px_1fr] items-start gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-sm font-black text-primary-foreground">
                          {i + 1}
                        </span>
                        <div className="text-left">
                          <p className="font-bold text-headline">{step.title}</p>
                          <p className="mt-0.5 text-base leading-snug text-[#46545f]">{step.text}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                  <HeroQuestionsLine className="mt-[18px] text-base text-[#46545f]" />
                </div>
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

        {!shopOpen && (
          <section className="section-shell mb-16">
            <div className="rounded-[2rem] border border-[#dce4ed] bg-[linear-gradient(135deg,#07172f_0%,#0f2847_100%)] p-8 text-white md:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ffab7e]">For suppliers</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight md:text-3xl">
                Your showroom. Your brand. Your customers.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-200 md:text-base">
                Suppliers can join now and load their products ahead of opening day. You pay nothing until something
                sells.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/sell"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-xl bg-[#f26d2a] px-6 py-3 text-sm font-semibold text-white hover:bg-[#d95a1a]"
                >
                  Start selling
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center rounded-xl border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
                >
                  Contact us first
                </Link>
              </div>
            </div>
          </section>
        )}
      </div>

      <RecentlyViewed />
    </Layout>
  );
};

export default Index;
