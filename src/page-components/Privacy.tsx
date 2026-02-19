// @ts-nocheck
"use client";

import { Layout } from "@/components/layout/Layout";
import Link from "next/link";

const Privacy = () => {
  return (
    <Layout>
      <div className="container max-w-3xl py-12">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
          <h1 className="text-3xl font-bold text-headline mb-1">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mb-8">
            Ocean Prime Industries Ltd — Last updated: February 2026
          </p>

          <div className="space-y-8 text-sm text-foreground leading-relaxed">
            <p>
              This policy explains what personal data we collect, why we collect it, how we use it, and your rights. We comply with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.
            </p>

            <section>
              <h2 className="text-lg font-semibold text-headline mb-3">Who We Are</h2>
              <p>
                Ocean Hotspot is operated by Ocean Prime Industries Ltd, registered in England and Wales. We are the data controller for the personal data described in this policy.
              </p>
              <p className="mt-3">
                Contact:{" "}
                <a href="mailto:oceanhotspotservices@gmail.com" className="text-primary hover:underline">oceanhotspotservices@gmail.com</a>
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-headline mb-3">What We Collect and Why</h2>

              <h3 className="font-semibold text-headline mt-4 mb-2">All Users (Buyers and Vendors)</h3>
              <p>
                We collect your name, email address, phone number, and account password when you register. We use this to create and manage your account, communicate with you about orders and the Platform, and verify your identity.
              </p>
              <p className="mt-3">
                We collect your IP address, browser type, device information, and usage data when you use the Platform. We use this to keep the Platform secure, prevent fraud, improve the Platform, and comply with our legal obligations.
              </p>

              <h3 className="font-semibold text-headline mt-4 mb-2">Buyers</h3>
              <p>
                We collect your delivery address when you place an order. We share this with the vendor to fulfil your order. We collect your payment details, which are processed by Stripe. We never see or store your full card number.
              </p>
              <p className="mt-3">
                For orders above £100, we may contact you by phone to verify the order. We collect the outcome of this verification call.
              </p>

              <h3 className="font-semibold text-headline mt-4 mb-2">Vendors</h3>
              <p>
                We collect business information including your business name, trading name, business type, company registration number, registered address, and tax identification number. We collect this to verify your identity and business (KYC/KYB), comply with anti-money laundering regulations, report seller income to HMRC as required by the UK Digital Platform Reporting Rules, and display your verified status to buyers.
              </p>
              <p className="mt-3">
                We process your payout information through Stripe Connect. Stripe collects and holds your banking details directly. We do not store your bank account details.
              </p>
              <p className="mt-3">
                For enhanced verification tiers, we may collect government-issued identification (processed by our verification partner, not stored on our systems), proof of business address, insurance documentation, and trade references.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-headline mb-3">Legal Bases for Processing</h2>
              <p>We process your data on the following legal bases:</p>
              <p className="mt-3">
                <strong>Contract.</strong> Processing necessary to provide the Platform and fulfil our obligations to you (account management, order processing, payouts).
              </p>
              <p className="mt-3">
                <strong>Legal obligation.</strong> Processing required by law, including KYC/AML verification, sanctions screening, tax reporting to HMRC under the UK Digital Platform Reporting Rules, and fraud prevention.
              </p>
              <p className="mt-3">
                <strong>Legitimate interests.</strong> Processing necessary for our legitimate business interests, including Platform security, fraud detection, analytics to improve the Platform, and marketing communications about Ocean Hotspot (you can opt out at any time).
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-headline mb-3">Who We Share Data With</h2>
              <p>
                We share data with other users as necessary for transactions: buyers see vendor business names and showroom information; vendors see buyer names and delivery addresses for orders.
              </p>
              <p className="mt-3">We share data with the following service providers, who process data on our behalf:</p>
              <p className="mt-3">
                <strong>Stripe</strong> processes payments and vendor payouts. Stripe's privacy policy applies to payment data they collect directly.
              </p>
              <p className="mt-3">
                <strong>Our identity verification provider</strong> processes government ID checks for enhanced vendor verification. We do not store identity documents on our systems. We receive only a pass/fail result and a reference number.
              </p>
              <p className="mt-3">
                <strong>Twilio</strong> provides phone verification services.
              </p>
              <p className="mt-3">
                We may also share data with HMRC and other tax authorities as required by the UK Digital Platform Reporting Rules, law enforcement or regulatory bodies if required by law or to prevent fraud, and professional advisors (legal, accounting) under confidentiality obligations.
              </p>
              <p className="mt-3">
                We do not sell your personal data to third parties. We do not share your data with advertisers.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-headline mb-3">International Transfers</h2>
              <p>
                Your data is primarily stored and processed in the United Kingdom. Where data is transferred outside the UK (for example, to service providers based in the United States), we ensure appropriate safeguards are in place, including the UK International Data Transfer Agreement or equivalent mechanisms.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-headline mb-3">How Long We Keep Data</h2>
              <p>
                We keep your account data for as long as your account is active, plus 12 months after closure to resolve any outstanding matters.
              </p>
              <p className="mt-3">
                We keep transaction records for 7 years after the transaction, as required for tax and accounting purposes.
              </p>
              <p className="mt-3">
                We keep KYC and AML verification records for 5 years after your account is closed, as required by the Money Laundering, Terrorist Financing and Transfer of Funds Regulations 2017.
              </p>
              <p className="mt-3">We keep security logs for 12 months.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-headline mb-3">Your Rights</h2>
              <p>
                Under UK GDPR, you have the right to access the personal data we hold about you, rectify inaccurate data, erase your data (subject to legal retention requirements), restrict processing in certain circumstances, data portability (receive your data in a structured format), object to processing based on legitimate interests, and withdraw consent where processing is based on consent.
              </p>
              <p className="mt-3">
                To exercise any of these rights, contact{" "}
                <a href="mailto:oceanhotspotservices@gmail.com" className="text-primary hover:underline">oceanhotspotservices@gmail.com</a>.
                We will respond within one month.
              </p>
              <p className="mt-3">
                Some data cannot be erased while your account is active or while legal retention periods apply (particularly KYC/AML data and tax reporting data). We will explain any restrictions when you make a request.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-headline mb-3">Cookies</h2>
              <p>
                We use cookies as described in our{" "}
                <Link href="/cookies" className="text-primary hover:underline">Cookie Policy</Link>.
                Essential cookies are required for the Platform to function. We do not use advertising cookies.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-headline mb-3">Security</h2>
              <p>
                We protect your data with encryption in transit (TLS 1.3) and at rest (AES-256), multi-factor authentication for admin access, role-based access controls, regular security reviews, and automated monitoring for suspicious activity.
              </p>
              <p className="mt-3">
                No system is perfectly secure. If we become aware of a data breach that affects your rights, we will notify you and the Information Commissioner's Office as required by law.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-headline mb-3">Children</h2>
              <p>
                The Platform is not intended for anyone under 18. We do not knowingly collect data from children. If we discover we have collected data from someone under 18, we will delete it.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-headline mb-3">Changes to This Policy</h2>
              <p>
                We may update this policy from time to time. We will notify you of significant changes by email. The date at the top of this policy shows when it was last updated.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-headline mb-3">Contact and Complaints</h2>
              <p>
                For any questions about this policy or your data:{" "}
                <a href="mailto:oceanhotspotservices@gmail.com" className="text-primary hover:underline">oceanhotspotservices@gmail.com</a>
              </p>
              <p className="mt-3">
                If you are not satisfied with our response, you have the right to complain to the Information Commissioner's Office (ICO): ico.org.uk
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Privacy;
