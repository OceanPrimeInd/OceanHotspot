// @ts-nocheck
"use client";

import { Layout } from "@/components/layout/Layout";
import { ContactEmailLink } from "@/components/ContactEmailLink";

const About = () => {
  return (
    <Layout>
      <div className="container max-w-3xl py-12">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
          <h1 className="text-3xl font-bold text-headline mb-1">About Ocean Hotspot</h1>
          <p className="text-base italic text-muted-foreground mb-8">
            A curated maritime marketplace. Not everything. The right thing.
          </p>

          <div className="space-y-8 text-sm text-foreground leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-headline mb-3">What We Are</h2>
              <p>
                Ocean Hotspot is an online marketplace for maritime products. We connect vendors who sell marine equipment, electronics, safety gear, and services with buyers who need them.
              </p>
              <p className="mt-3">
                Each vendor has their own branded showroom. Buyers get AI-powered discovery that matches products to their actual needs. Every transaction is backed by secure payment processing via Stripe and verified vendor status.
              </p>
              <p className="mt-3">
                We are not another Amazon for boats. We do not commoditise brands into identical listings. We do not sell search rankings. Products are matched to buyers on merit, not advertising budgets.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-headline mb-3">Why We Built This</h2>
              <p>
                The maritime retail market is fragmented. Vendors scatter their products across their own website, some eBay listings, a Boat Trader page, and a PDF catalogue. Buyers trawl Google, get sore feet at boat shows, and are never quite sure who they can trust.
              </p>
              <p className="mt-3">
                Trade shows cost £15,000 to £50,000 for a few days of exposure with no guarantees. Google Ads attract tyre-kickers. And now AI agents are doing the shopping for buyers, but they cannot read a PDF catalogue or a website not structured in the right way.
              </p>
              <p className="mt-3">
                Ocean Hotspot solves this. Vendors get a verified, AI-discoverable showroom. Buyers get matched to the right products in minutes instead of days. Trust is built into every transaction.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-headline mb-3">How We Are Different</h2>
              <div className="space-y-4">
                <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
                  <p className="font-semibold text-headline mb-1">No paid ranking.</p>
                  <p className="text-muted-foreground">Products are recommended because they fit what the buyer needs. This is a fundamental principle, not a feature we might change later.</p>
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
                  <p className="font-semibold text-headline mb-1">Secure payments on every transaction.</p>
                  <p className="text-muted-foreground">Payments processed securely via Stripe with buyer protection measures being enhanced throughout 2026.</p>
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
                  <p className="font-semibold text-headline mb-1">AI-first discovery.</p>
                  <p className="text-muted-foreground">As AI agents increasingly do the shopping for buyers, products need to be in a structured, verified, machine-readable format. Ocean Hotspot is that format.</p>
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
                  <p className="font-semibold text-headline mb-1">People when it matters.</p>
                  <p className="text-muted-foreground">AI handles the routine. Human expertise is available when the transaction is complex, high-value, or simply important to the buyer.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-headline mb-3">Who We Are</h2>
              <p>
                Ocean Hotspot is built by Ocean Prime Industries Ltd, a frontier AI and maritime technology company. We are building the infrastructure for the future of maritime commerce, starting with the marketplace and extending to autonomous vessels, renewable marine transport, and port technology.
              </p>
              <p className="mt-3">
                We are not venture-funded. We build what works, test it, learn, and iterate. We would rather get it right than get it fast.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-headline mb-3">Contact</h2>
              <p>
                General enquiries:{" "}
                <ContactEmailLink />
                <br />
                Vendor enquiries:{" "}
                <ContactEmailLink />
              </p>
              <p className="mt-3">oceanhotspot.com</p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About;
