// @ts-nocheck
"use client";

import { Layout } from "@/components/layout/Layout";
import { ContactEmailLink } from "@/components/ContactEmailLink";
import Link from "next/link";

const HowItWorks = () => {
  return (
    <Layout>
      <div className="container max-w-3xl py-12">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
          <h1 className="text-3xl font-bold text-headline mb-2">How It Works</h1>
          <p className="text-muted-foreground mb-8">
            Ocean Hotspot is a curated maritime marketplace. We connect vendors who sell maritime products with buyers who need them, using AI-powered discovery and verified transactions that both sides can trust.
          </p>

          <div className="space-y-8 text-sm text-foreground leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-headline mb-4">For Buyers</h2>

              <h3 className="font-semibold text-headline mt-4 mb-2">Find what you need</h3>
              <p>
                Tell us what you are looking for. Our AI discovery assistant asks about your vessel, your requirements, and your budget, then matches you to products that fit. No trawling through thousands of listings. No paid rankings. Products are recommended because they are right for you, not because the vendor has the biggest advertising budget.
              </p>

              <h3 className="font-semibold text-headline mt-4 mb-2">Buy with confidence</h3>
              <p>
                Every vendor on Ocean Hotspot is verified. You can see their verification level on their showroom and on every listing. Secure payment processing via Stripe with buyer protection measures being enhanced throughout 2026.
              </p>

              <h3 className="font-semibold text-headline mt-4 mb-2">Get help when you need it</h3>
              <p>
                For simple purchases, the AI handles everything. For complex, high-value, or important purchases, a real person is available to help. We scale expertise to the value of the conversation.
              </p>

              <h3 className="font-semibold text-headline mt-4 mb-2">The steps</h3>
              <ol className="mt-2 space-y-2 list-decimal list-inside text-muted-foreground">
                <li>Register for free at oceanhotspot.com</li>
                <li>Browse showrooms or use AI discovery to find what you need</li>
                <li>Place your order and pay securely through the Platform</li>
                <li>Receive your product and confirm you are happy</li>
                <li>If anything is wrong, raise a return or dispute and we will help resolve it</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-headline mb-4">For Vendors</h2>

              <h3 className="font-semibold text-headline mt-4 mb-2">List your products</h3>
              <p>
                Set up your branded showroom in less than an hour. Upload your products with images, descriptions, specifications, and pricing. Your showroom is your space, with your branding and your story.
              </p>

              <h3 className="font-semibold text-headline mt-4 mb-2">Get found by the right buyers</h3>
              <p>
                Our AI matches your products to buyers based on what they actually need. Buyers come to Ocean Hotspot because they can find the right product faster than searching Google, browsing multiple websites, or walking around a boat show. Your products are presented on merit, not by who spends the most on advertising.
              </p>

              <h3 className="font-semibold text-headline mt-4 mb-2">Get paid securely</h3>
              <p>
                Secure payment processing via Stripe with buyer protection measures being enhanced throughout 2026. Payments are processed promptly and securely.
              </p>

              <h3 className="font-semibold text-headline mt-4 mb-2">The steps</h3>
              <ol className="mt-2 space-y-2 list-decimal list-inside text-muted-foreground">
                <li>Register at oceanhotspot.com and complete KYC verification</li>
                <li>Set up your showroom with your branding</li>
                <li>Upload your products</li>
                <li>Receive orders and fulfil them</li>
                <li>Get paid after buyer acceptance</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-headline mb-4">What Makes Ocean Hotspot Different</h2>

              <div className="space-y-4">
                <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
                  <p className="font-semibold text-headline mb-1">We do not sell. We match.</p>
                  <p className="text-muted-foreground">Our AI discovery engine recommends products because they are right for the buyer, not because the vendor paid for placement. There is no paid ranking on Ocean Hotspot.</p>
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
                  <p className="font-semibold text-headline mb-1">Trust is built in.</p>
                  <p className="text-muted-foreground">Every vendor is verified. Payments are processed securely via Stripe. Buyer protection covers every transaction.</p>
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
                  <p className="font-semibold text-headline mb-1">People when you need them.</p>
                  <p className="text-muted-foreground">AI handles routine transactions. Human expertise is available for complex, high-value, or important purchases.</p>
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
                  <p className="font-semibold text-headline mb-1">Your brand, your way.</p>
                  <p className="text-muted-foreground">Vendors control their own showroom, branding, and customer relationship style. We provide the trust and security underneath.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-headline mb-3">Questions</h2>
              <p>
                Buyers:{" "}
                <ContactEmailLink />
                <br />
                Vendors:{" "}
                <ContactEmailLink />
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HowItWorks;
