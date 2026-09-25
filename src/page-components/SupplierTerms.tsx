// @ts-nocheck
"use client";

import Link from "next/link";
import { Layout } from "@/components/layout/Layout";
import { COMPANY_LEGAL_LINE } from "@/config/contact";
import { PLATFORM_COMMISSION_MARKETING_LABEL } from "@/config/platform";

const SupplierTerms = () => {
  return (
    <Layout>
      <div className="container max-w-3xl py-12 prose prose-slate">
        <h1>Supplier terms</h1>
        <p className="text-muted-foreground not-prose">
          These terms apply to suppliers who list products on Ocean Hotspot. Full legal review pending — this summary
          reflects how the platform works today.
        </p>

        <h2>Who you are dealing with</h2>
        <p>{COMPANY_LEGAL_LINE.replace("© ", "")}</p>

        <h2>Listing and fees</h2>
        <ul>
          <li>No listing fee and no joining fee.</li>
          <li>
            Platform commission is {PLATFORM_COMMISSION_MARKETING_LABEL} on the order total when a product sells, as
            recorded at checkout.
          </li>
          <li>You set your own prices on each product.</li>
        </ul>

        <h2>Before the shop opens</h2>
        <p>
          You may register, create a showroom, and load products before customer checkout goes live. Payout and Stripe
          Connect setup happens before your first sale when payments open.
        </p>

        <h2>Your responsibilities</h2>
        <ul>
          <li>Accurate product information, part numbers, and photos that meet our minimum standard.</li>
          <li>Respond to buyer enquiries and fulfil orders you accept.</li>
          <li>Comply with UK law on product safety and consumer rights.</li>
        </ul>

        <h2>Data</h2>
        <p>
          We process supplier application and account data as described in our{" "}
          <Link href="/privacy">Privacy policy</Link>.
        </p>

        <p className="not-prose text-sm text-muted-foreground mt-8">
          Questions? <Link href="/contact">Contact us</Link>.
        </p>
      </div>
    </Layout>
  );
};

export default SupplierTerms;
