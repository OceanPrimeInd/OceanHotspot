// @ts-nocheck
"use client";

import { Layout } from "@/components/layout/Layout";
import Link from "next/link";

const BuyerProtection = () => {
  return (
    <Layout>
      <div className="container max-w-3xl py-12">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
          <h1 className="text-3xl font-bold text-headline mb-1">Buyer Protection</h1>
          <p className="text-sm text-muted-foreground mb-8">
            Last updated: February 2026
          </p>

          <div className="space-y-8 text-sm text-foreground leading-relaxed">
            <p className="text-base font-medium text-headline">
              Every purchase on Ocean Hotspot is protected. Here is how.
            </p>

            <section>
              <h2 className="text-lg font-semibold text-headline mb-3">Your Money Is Protected</h2>
              <p>
                Payments are processed securely via Stripe. We are building an enhanced buyer protection system with payment holding and verified delivery confirmation, launching soon.
              </p>
              <p className="mt-3">
                Our goal is to ensure that if something goes wrong with your order, your money is protected.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-headline mb-3">Every Vendor Is Verified</h2>
              <p>
                Before a vendor can list a single product on Ocean Hotspot, they must complete identity verification, including a real payment method linked to a named individual or business, email and phone verification, and acceptance of our marketplace terms and buyer protection commitments.
              </p>
              <p className="mt-3">
                For vendors listing higher-value products, we require additional checks including business registration validation, government ID verification, and for the highest-value listings, trade references and financial health checks.
              </p>
              <p className="mt-3">
                You can see a vendor's verification level on their showroom and on every listing. A single tick means verified identity and payment. A double tick means enhanced business verification. A star means full due diligence, including trade references and financial checks.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-headline mb-3">What Happens If Something Goes Wrong</h2>
              <div className="space-y-4 mt-3">
                <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
                  <p className="font-semibold text-headline mb-1">Product did not arrive</p>
                  <p className="text-muted-foreground">Contact the vendor through the Platform. If the vendor cannot resolve it, raise a dispute. If the product cannot be located or redelivered, you receive a full refund.</p>
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
                  <p className="font-semibold text-headline mb-1">Product is not as described</p>
                  <p className="text-muted-foreground">If the product is materially different from the listing, you can return it at the vendor's expense for a full refund. If the vendor disagrees, raise a dispute and we will review the evidence.</p>
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
                  <p className="font-semibold text-headline mb-1">Product arrived damaged</p>
                  <p className="text-muted-foreground">Photograph the damage and packaging, contact the vendor, and arrange a return. If you cannot agree, raise a dispute.</p>
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
                  <p className="font-semibold text-headline mb-1">You changed your mind</p>
                  <p className="text-muted-foreground">You have 14 days from delivery to return the product for any reason, provided it is unused and in original condition. You pay return shipping.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-headline mb-3">Disputes</h2>
              <p>
                If you and the vendor cannot agree, we step in. You raise a dispute through the Platform, we review the evidence from both sides, and we make a decision. We aim to resolve disputes within 5 working days.
              </p>
              <p className="mt-3">
                Our decision is made in good faith based on the evidence available. This does not affect your legal rights under UK consumer protection law.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-headline mb-3">Payment Security</h2>
              <p>
                All payments are processed by Stripe, which handles your card details to the same security standards used by banks (PCI DSS Level 1). We never see or store your full card number. The Platform is protected by SSL encryption, secure infrastructure, and ongoing security monitoring.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-headline mb-3">Orders Over £100</h2>
              <p>
                For orders above £100, we may contact you briefly to verify the order before it is processed. This is a fraud prevention measure that protects you and the vendor. If we cannot verify the order, it is cancelled and you receive a full refund.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-headline mb-3">What Buyer Protection Does Not Cover</h2>
              <p>
                Buyer protection applies to purchases made through the Ocean Hotspot checkout. It does not cover transactions completed outside the Platform, products where you have confirmed acceptance and the 14-day period has passed without a dispute, or normal wear and use after acceptance.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-headline mb-3">Contact</h2>
              <p>
                If you need help:{" "}
                <a href="mailto:oceanhotspotservices@gmail.com" className="text-primary hover:underline">oceanhotspotservices@gmail.com</a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BuyerProtection;
