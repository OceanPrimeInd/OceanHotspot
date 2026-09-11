"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, Store, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const stats = [
  { label: "Verified sellers", value: "2,400+" },
  { label: "Active brands", value: "130+" },
  { label: "Global reach", value: "40+" },
];

export function Hero() {
  return (
    <section className="section-shell pb-10 pt-10 md:pt-14">
      <div className="brand-gradient relative overflow-hidden rounded-[2rem] border border-blue-200/70 px-5 py-7 shadow-[0_30px_90px_-30px_rgba(12,38,112,0.75)] sm:px-8 md:px-10 md:py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.18),_transparent_38%)]" />
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-orange-400/20 blur-3xl" />
        <div className="absolute -bottom-16 left-10 h-48 w-48 rounded-full bg-sky-400/15 blur-3xl" />

        <div className="relative grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Trusted marine marketplace
            </div>

            <p className="mt-5 max-w-lg text-base text-blue-50/85 md:text-lg">
              Discover premium marine equipment, trusted suppliers, and smarter buying for yachts, fleets, and offshore operations.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Button variant="secondary" size="lg" asChild className="gap-2 rounded-full bg-[#ff7a35] text-white hover:bg-[#ff8e50]">
                <Link href="/discover">
                  <TrendingUp className="h-4 w-4" />
                  AI Discovery Assistant
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="gap-2 rounded-full border-white/30 bg-white/5 text-white hover:bg-white/10">
                <Link href="/showrooms">
                  <Store className="h-4 w-4" />
                  Browse Showrooms
                </Link>
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap gap-4 text-sm text-blue-50/80">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#ffb38a]" />
                Verified suppliers
              </div>
              <div className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-[#ffb38a]" />
                Secure trade support
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="brand-card relative overflow-hidden rounded-[1.75rem] border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
              <div className="rounded-[1.5rem] bg-white p-4 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Featured</p>
                    <h2 className="mt-1 text-xl font-bold text-slate-900">Premium marine gear</h2>
                  </div>
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">New</span>
                </div>

                <div className="rounded-[1.25rem] bg-[linear-gradient(135deg,#eaf3ff,#dbe9ff)] p-4">
                  <div className="mx-auto h-36 max-w-[220px] rounded-[1.1rem] bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.8),_rgba(145,175,255,0.1)_35%,_rgba(17,63,186,0.18)_100%)] p-3 shadow-inner">
                    <div className="flex h-full items-end justify-center rounded-[1rem] border border-[#c8d9ff] bg-[linear-gradient(180deg,#f4f9ff,#dfeeff)] p-3">
                      <div className="relative flex h-16 w-36 items-center justify-center rounded-2xl border border-[#1b3d9a] bg-[#1238a8] shadow-lg">
                        <div className="absolute top-3 h-2 w-2 rounded-full bg-[#ff7a35]" />
                        <div className="absolute bottom-2 left-3 right-3 h-2 rounded-full bg-white/15" />
                        <div className="absolute inset-x-4 bottom-4 h-10 rounded-t-3xl border border-white/30 bg-white/10" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2">
                    <div>
                      <p className="text-xs text-slate-500">Top category</p>
                      <p className="text-sm font-semibold text-slate-900">Navigation & electronics</p>
                    </div>
                    <span className="text-sm font-bold text-primary">24 items</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    {stats.map((item) => (
                      <div key={item.label} className="rounded-2xl bg-slate-50 px-2 py-3">
                        <div className="text-base font-bold text-slate-900">{item.value}</div>
                        <div className="mt-1 text-[10px] uppercase tracking-[0.12em] text-slate-500">{item.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
