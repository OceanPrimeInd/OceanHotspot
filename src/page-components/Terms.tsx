// @ts-nocheck
"use client";

import { Layout } from "@/components/layout/Layout";
import { ContactEmailLink } from "@/components/ContactEmailLink";
import Link from "next/link";

const Terms = () => {
  return (
    <Layout>
      <div className="container max-w-3xl py-12">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
          <h1 className="text-3xl font-bold text-headline mb-1">Terms and Conditions</h1>
          <p className="text-sm text-muted-foreground mb-8">
            Ocean Prime Industries Ltd — Last updated: February 2026
          </p>

          <div className="space-y-8 text-sm text-foreground leading-relaxed">
            <p>
              These terms govern your use of oceanhotspot.com ("the Platform"), operated by Ocean Prime Industries Ltd, registered in England and Wales ("Ocean Hotspot", "we", "us").
            </p>
            <p>
              By using the Platform, you agree to these terms. If you do not agree, do not use the Platform.
            </p>

            <section>
              <h2 className="text-lg font-semibold text-headline mb-3">1. What Ocean Hotspot Is</h2>
              <p>
                Ocean Hotspot is a curated maritime marketplace. We connect vendors who sell maritime products and services with buyers who need them. We are not a party to the transaction between vendor and buyer. We provide the platform, the tools, and the trust infrastructure. The sale is between you and the other party.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-headline mb-3">2. Accounts</h2>
              <p>
                You must be at least 18 years old to create an account. You are responsible for keeping your login details secure. If you suspect unauthorised access to your account, contact us immediately at{" "}
                <ContactEmailLink />.
              </p>
              <p className="mt-3">
                One account per person or business. We reserve the right to close duplicate accounts.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-headline mb-3">3. For Vendors</h2>

              <h3 className="font-semibold text-headline mt-4 mb-2">Registration and Verification</h3>
              <p>
                All vendors must complete our Know Your Customer (KYC) verification before listing products. Identity verification is required during seller onboarding. Verification methods may include payment instrument checks. Additional verification is required for higher-value listings, as described in our verification tiers.
              </p>
              <p className="mt-3">
                You must provide accurate business information. If your details change, you must update them within 14 days. Providing false information is grounds for immediate account suspension.
              </p>

              <h3 className="font-semibold text-headline mt-4 mb-2">Listings</h3>
              <p>
                You are responsible for the accuracy of your product listings, including descriptions, images, specifications, and pricing. Listings must not include products that are illegal to sell in the United Kingdom, counterfeit, stolen, or misrepresented.
              </p>
              <p className="mt-3">
                We reserve the right to remove any listing that breaches these terms, is reported by a buyer, or that we reasonably believe is inaccurate or harmful.
              </p>

              <h3 className="font-semibold text-headline mt-4 mb-2">Commission</h3>
              <p>
                Ocean Hotspot charges a commission on completed sales calculated as a percentage of the product price and excluding shipping, duty and taxes. Commission is charged after the buyer confirms acceptance of the product. Full details of the commission model are set out on our{" "}
                <Link href="/pricing" className="text-primary hover:underline">Pricing page</Link>.
              </p>
              <p className="mt-3">
                Any changes to your commission rate will be proposed, explained, and agreed with you before taking effect. We will never impose a rate change without your agreement.
              </p>

              <h3 className="font-semibold text-headline mt-4 mb-2">Subscriptions</h3>
              <p>
                The Open plan is currently the only plan available and is free. Paid subscription tiers with advanced features are in development and will be offered in the future.
              </p>

              <h3 className="font-semibold text-headline mt-4 mb-2">Payouts</h3>
              <p>
                Vendor payouts are processed through Stripe Connect. Payout timing is governed by Stripe's standard terms.
              </p>

              <h3 className="font-semibold text-headline mt-4 mb-2">Your Obligations</h3>
              <p>
                As a vendor, you agree to fulfil orders promptly and accurately, respond to buyer enquiries within a reasonable time, comply with all applicable laws including consumer protection, product safety, and tax obligations, maintain any insurance required for your products or services, and not use the Platform to harvest buyer data for purposes unrelated to completing transactions.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-headline mb-3">4. For Buyers</h2>

              <h3 className="font-semibold text-headline mt-4 mb-2">Purchasing</h3>
              <p>
                When you place an order, you are entering into a contract with the vendor, not with Ocean Hotspot. We facilitate the transaction and provide buyer protection, but the vendor is responsible for the product, its quality, and its delivery.
              </p>

              <h3 className="font-semibold text-headline mt-4 mb-2">Payment</h3>
              <p>
                Payment is taken at checkout via Stripe (card and other methods Stripe supports). Funds are processed by Stripe; sellers receive payouts through Stripe Connect according to our seller terms. Ocean Hotspot may charge a platform commission as shown at checkout or in our Pricing page.
              </p>

              <h3 className="font-semibold text-headline mt-4 mb-2">Buyer Verification</h3>
              <p>
                For orders above £100, we may contact you to verify the order before it is processed. This is a trust and fraud prevention measure. If we cannot verify the order, it will be cancelled and you will receive a full refund.
              </p>

              <h3 className="font-semibold text-headline mt-4 mb-2">Your Obligations</h3>
              <p>
                As a buyer, you agree to provide accurate delivery and contact information, confirm receipt and acceptance of products within a reasonable time, raise any disputes or returns promptly and honestly, and not use the Platform to gather competitive intelligence on vendors.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-headline mb-3">5. Buyer Protection</h2>
              <p>
                Payments are processed securely via Stripe. We are building an enhanced buyer protection system with payment holding and verified delivery confirmation, launching soon.
              </p>
              <p className="mt-3">
                If a product does not arrive, arrives damaged, or is significantly not as described, you may raise a dispute. We will review the dispute and, where appropriate, arrange a refund. Our decision on disputes is final, though this does not affect your statutory rights.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-headline mb-3">6. Returns and Refunds</h2>
              <p>
                Our{" "}
                <Link href="/returns" className="text-primary hover:underline">Returns and Refunds Policy</Link>{" "}
                is set out on a separate page and forms part of these terms. In summary, buyers may return products within 14 days of delivery for a full refund, provided the product is unused and in its original condition. Vendors may set their own more generous returns policies.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-headline mb-3">7. Prohibited Conduct</h2>
              <p>
                You must not use the Platform to sell or buy illegal products or services, commit fraud or misrepresent yourself or your products, harass, threaten, or abuse other users, attempt to circumvent platform fees by completing transactions outside the Platform, scrape, harvest, or systematically download data from the Platform, upload malicious code or attempt to compromise Platform security, or create fake reviews or artificially manipulate search results.
              </p>
              <p className="mt-3">
                Breach of these terms may result in account suspension or permanent removal from the Platform.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-headline mb-3">8. Intellectual Property</h2>
              <p>
                Vendors retain ownership of their product content, images, and branding. By listing on Ocean Hotspot, you grant us a licence to display your content on the Platform and in marketing materials for the purpose of promoting your products and the Platform. This licence ends when you remove your listing or close your account.
              </p>
              <p className="mt-3">
                Ocean Hotspot's own branding, design, software, and AI systems are our intellectual property and may not be copied, reproduced, or reverse-engineered.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-headline mb-3">9. Data and Privacy</h2>
              <p>
                We collect and process personal data as described in our{" "}
                <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
                By using the Platform, you consent to this processing. We comply with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.
              </p>
              <p className="mt-3">
                For vendors, we are required by law to collect certain information for KYC, anti-money laundering, and tax reporting purposes. This data is retained for the periods required by law (typically 5 years after account closure).
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-headline mb-3">10. Liability</h2>
              <p>
                Ocean Hotspot provides the platform and tools. We do not manufacture, store, or ship products. We are not liable for the quality, safety, legality, or accuracy of products listed by vendors, the performance or conduct of vendors or buyers, any loss arising from transactions between vendors and buyers, or any indirect, consequential, or incidental loss.
              </p>
              <p className="mt-3">
                Our total liability to you for any claim arising from your use of the Platform is limited to the amount of commission or subscription fees you have paid to us in the 12 months preceding the claim.
              </p>
              <p className="mt-3">
                Nothing in these terms excludes or limits liability for death or personal injury caused by negligence, fraud, or any other liability that cannot be excluded by law.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-headline mb-3">11. Disputes Between Users</h2>
              <p>
                If a dispute arises between a vendor and a buyer, we will attempt to help resolve it through our dispute resolution process. Our decision is made in good faith based on the evidence available. While our decision on refunds is final within the Platform, this does not affect either party's legal rights.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-headline mb-3">12. Changes to These Terms</h2>
              <p>
                We may update these terms from time to time. We will notify you of significant changes by email and by posting a notice on the Platform. Continued use of the Platform after changes take effect constitutes acceptance of the updated terms.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-headline mb-3">13. Suspension and Termination</h2>
              <p>
                We may suspend or terminate your account if you breach these terms, if we are required to do so by law, or if we reasonably believe your account poses a risk to other users or the Platform. We will give you reasonable notice where possible.
              </p>
              <p className="mt-3">
                You may close your account at any time. Outstanding orders, payouts, and disputes must be resolved before account closure is complete.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-headline mb-3">14. Governing Law</h2>
              <p>
                These terms are governed by the laws of England and Wales. Any disputes will be subject to the exclusive jurisdiction of the courts of England and Wales.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-headline mb-3">15. Contact</h2>
              <p>
                Ocean Prime Industries Ltd
                <br />
                Email:{" "}
                <ContactEmailLink />
                <br />
                Vendor enquiries:{" "}
                <ContactEmailLink />
              </p>
              <p className="mt-3">Company registered in England and Wales.</p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Terms;
