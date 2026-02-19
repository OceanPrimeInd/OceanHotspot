// @ts-nocheck
"use client";

import { Layout } from "@/components/layout/Layout";
import Link from "next/link";

const Returns = () => {
  return (
    <Layout>
      <div className="container max-w-3xl py-12">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
          <h1 className="text-3xl font-bold text-headline mb-1">Returns and Refunds</h1>
          <p className="text-sm text-muted-foreground mb-8">
            Ocean Prime Industries Ltd — Last updated: February 2026
          </p>

          <div className="space-y-8 text-sm text-foreground leading-relaxed">
            <p>
              Ocean Hotspot is a marketplace. Products are sold by independent vendors, not by Ocean Hotspot. However, we provide buyer protection on every transaction and a clear, fair process for returns and refunds.
            </p>

            <section>
              <h2 className="text-lg font-semibold text-headline mb-3">Your Rights</h2>
              <p>
                Under the Consumer Contracts Regulations 2013, you have the right to cancel most online purchases within 14 days of receiving the product, for any reason. This is your statutory cooling-off period and it applies to all purchases from vendors on Ocean Hotspot.
              </p>
              <p className="mt-3">Some products are exempt from the 14-day cancellation right, including:</p>
              <ul className="mt-2 space-y-1 list-disc list-inside text-muted-foreground">
                <li>Items made to your specification or clearly personalised</li>
                <li>Sealed goods that have been opened and cannot be returned for hygiene or safety reasons</li>
                <li>Goods that deteriorate or expire rapidly</li>
              </ul>
              <p className="mt-3">
                If an exemption applies, the vendor must state this clearly on the product listing.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-headline mb-3">How Your Payment Is Protected</h2>
              <p>
                All payments on Ocean Hotspot are processed securely via Stripe. We are building an enhanced buyer protection system with payment holding and verified delivery confirmation, launching soon.
              </p>
              <p className="mt-3">
                If something goes wrong with your order, our dispute resolution process is designed to protect you.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-headline mb-3">Returning a Product</h2>
              <p>
                To return a product, go to your orders page and select the order you want to return. Choose your reason: changed your mind (within 14 days), product not as described, product arrived damaged, or product did not arrive. Follow the instructions.
              </p>
              <p className="mt-3">
                For "changed your mind" returns, you are responsible for return shipping costs. For products that are not as described or arrived damaged, the vendor is responsible for return shipping.
              </p>
              <p className="mt-3">
                Once the vendor confirms receipt of the returned product, or once we have reviewed the evidence for a dispute, we will process your refund.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-headline mb-3">Refund Timescales</h2>
              <p>
                Refunds are processed back to your original payment method. Once a refund is approved, it typically takes 5 to 10 business days to appear in your account, depending on your bank or card provider.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-headline mb-3">Products Not As Described</h2>
              <p>
                If a product is significantly different from the listing, including incorrect specifications, missing components, or materially different condition from what was described, you may return it at the vendor's expense for a full refund. Contact the vendor first through the Platform messaging system. If you cannot resolve it directly, raise a dispute and we will review the evidence from both sides.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-headline mb-3">Products That Did Not Arrive</h2>
              <p>
                If your product does not arrive within the estimated delivery window, contact the vendor through the Platform. If the vendor cannot resolve the issue, raise a dispute. If the product cannot be located or redelivered, you will receive a full refund.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-headline mb-3">Damaged Products</h2>
              <p>
                If a product arrives damaged, photograph the damage and the packaging before contacting the vendor. This evidence is essential if a dispute is raised. Damaged products can be returned at the vendor's expense for a full refund or replacement, subject to vendor stock availability.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-headline mb-3">Disputes</h2>
              <p>
                If you cannot resolve a return or refund directly with the vendor, raise a dispute through the Platform. We will review the evidence from both parties and make a decision. Our dispute resolution aims to be fair and prompt. While our decision on refunds is final within the Platform, this does not affect your statutory rights.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-headline mb-3">For Vendors</h2>
              <p>
                Vendors may set their own returns policies that are more generous than the minimums described here, but never less generous. Any returns policy stated on a vendor's showroom or product listing must comply with UK consumer protection law.
              </p>
              <p className="mt-3">
                Vendors are expected to respond to return requests within 48 hours and to process refunds promptly once a return is received and inspected.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-headline mb-3">Contact</h2>
              <p>
                If you need help with a return or refund:{" "}
                <a href="mailto:oceanhotspotservices@gmail.com" className="text-primary hover:underline">oceanhotspotservices@gmail.com</a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Returns;
