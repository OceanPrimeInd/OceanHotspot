// @ts-nocheck
"use client";

import { Layout } from "@/components/layout/Layout";

const Pricing = () => {
  return (
    <Layout>
      <div className="container max-w-4xl py-12">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
          <h1 className="text-3xl font-bold text-headline mb-1">Pricing</h1>
          <p className="text-sm text-muted-foreground mb-2">
            Last updated: February 2026
          </p>
          <p className="text-base font-medium text-headline mb-8">
            It costs nothing to join. We only make money when you make money.
          </p>

          <div className="space-y-8 text-sm text-foreground leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-headline mb-3">Commission</h2>
              <p>
                Ocean Hotspot charges 10% of completed sales. This is charged on the product price only, not shipping or taxes, and only after the buyer confirms acceptance.
              </p>
              <p className="mt-3">
                The 10% covers AI-powered discovery, payment processing, buyer protection, your branded showroom, and analytics.
              </p>

              <h3 className="font-semibold text-headline mt-4 mb-2">What 10% Replaces</h3>
              <p>
                If you were to replicate what the commission covers independently, you would be paying for some combination of Google Ads and SEO, payment processing and PCI compliance, fraud prevention and dispute resolution, web hosting and product catalogue management, analytics and conversion tracking, and trust and verification infrastructure.
              </p>
              <p className="mt-3">
                For a small brand, that is £10,000 to £25,000 a year. For a mid-sized brand, £50,000 to £150,000. At 10% commission, you would need to sell £100,000 to £250,000 on the platform before you have paid the equivalent, and even then you would still lack the qualified buyer traffic.
              </p>

              <h3 className="font-semibold text-headline mt-4 mb-2">How Commission Works as a Partnership</h3>
              <p>
                Ocean Hotspot uses intelligent pricing. Just as airlines and hotels adjust prices based on demand and seasonality, we may adjust commission rates to maximise the number of sales you make. When the market is quiet, commission may come down to stimulate demand. When the market is strong, commission may increase because conversion rates are higher. Over a year, commission averages out.
              </p>
              <p className="mt-3">
                The rules are simple. Commission starts at 10%, and this baseline will not change without a conversation. We never impose changes; any adjustment is proposed, explained, and agreed with you before it takes effect. Your dashboard shows your current rate and the factors behind it. The buyer comes first; commission is set to maximise sales volume, not our margin. It averages out over the year.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-headline mb-3">Your Plan</h2>
              <p>
                You do not need a subscription to sell on Ocean Hotspot. The Open plan gives you everything you need to start selling.
              </p>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-3 pr-4 font-semibold text-headline"></th>
                      <th className="py-3 px-4 font-semibold text-headline">Open</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b border-border/50">
                      <td className="py-3 pr-4 font-medium text-foreground">Monthly price</td>
                      <td className="py-3 px-4 font-semibold text-headline">Free</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 pr-4 font-medium text-foreground">Commission</td>
                      <td className="py-3 px-4">From 10%</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 pr-4 font-medium text-foreground">Product listings</td>
                      <td className="py-3 px-4">Up to 25</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 pr-4 font-medium text-foreground">Security</td>
                      <td className="py-3 px-4">Standard</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 pr-4 font-medium text-foreground">Analytics</td>
                      <td className="py-3 px-4">Basic</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 font-medium text-foreground">Support</td>
                      <td className="py-3 px-4">Community</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="mt-4 text-muted-foreground">
                Paid tiers with advanced features are in development. For now, everything you need to start selling is included in the Open plan at no cost.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-headline mb-3">What This Pricing Deliberately Avoids</h2>
              <p><strong>No listing fees.</strong> We want you to list everything you sell, not do mental arithmetic about which products are worth the listing cost.</p>
              <p className="mt-3"><strong>No joining fees or setup charges.</strong> The answer to "what does it cost to try?" is "nothing".</p>
              <p className="mt-3"><strong>No paid ranking.</strong> Products are recommended on merit. You cannot buy your way to the top of search results.</p>
              <p className="mt-3"><strong>No commission variation by tier.</strong> The commission stays at 10% regardless of subscription level. The subscription is about better tools, not cheaper transactions.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-headline mb-3">The Maths</h2>
              <p>
                At 10%, a vendor selling a £10,000 piece of marine electronics pays £1,000 in commission, but pays nothing unless we deliver a paying customer.
              </p>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-3 pr-4 font-semibold text-headline">Channel</th>
                      <th className="py-3 px-4 font-semibold text-headline">Typical cost</th>
                      <th className="py-3 px-4 font-semibold text-headline">What you get</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b border-border/50">
                      <td className="py-3 pr-4">Amazon</td>
                      <td className="py-3 px-4">8-45% plus fees</td>
                      <td className="py-3 px-4">Plus storage, advertising</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 pr-4">Etsy</td>
                      <td className="py-3 px-4">~11% effective</td>
                      <td className="py-3 px-4">6.5% plus listing, payment, ad fees</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 pr-4">Faire (B2B)</td>
                      <td className="py-3 px-4">15-25%</td>
                      <td className="py-3 px-4">Plus free returns at vendor cost</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 pr-4">John Lewis concession</td>
                      <td className="py-3 px-4">40-50%</td>
                      <td className="py-3 px-4">Brand provides own staff and fit-out</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 pr-4">Trade show</td>
                      <td className="py-3 px-4">£15,000-50,000 per event</td>
                      <td className="py-3 px-4">3-5 days, no sales infrastructure</td>
                    </tr>
                    <tr className="bg-primary/5">
                      <td className="py-3 pr-4 font-semibold text-headline">Ocean Hotspot</td>
                      <td className="py-3 px-4 font-semibold text-headline">From 10%</td>
                      <td className="py-3 px-4 font-semibold text-headline">AI discovery, payments, buyer protection, showroom, analytics. All included.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-headline mb-3">Contact</h2>
              <p>
                Questions about pricing:{" "}
                <a href="mailto:oceanhotspotservices@gmail.com" className="text-primary hover:underline">oceanhotspotservices@gmail.com</a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Pricing;
