// @ts-nocheck
"use client";

import { Layout } from "@/components/layout/Layout";
import { ContactEmailLink } from "@/components/ContactEmailLink";

const Cookies = () => {
  return (
    <Layout>
      <div className="container max-w-3xl py-12">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
          <h1 className="text-3xl font-bold text-headline mb-1">Cookie Policy</h1>
          <p className="text-sm text-muted-foreground mb-8">
            Ocean Prime Industries Ltd — Last updated: February 2026
          </p>

          <div className="space-y-8 text-sm text-foreground leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-headline mb-3">What Are Cookies</h2>
              <p>
                Cookies are small text files stored on your device when you visit a website. They help the site work properly, keep it secure, and give us information about how the site is used.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-headline mb-3">Cookies We Use</h2>

              <h3 className="font-semibold text-headline mt-4 mb-2">Essential Cookies</h3>
              <p>
                These are required for the Platform to function. You cannot opt out of essential cookies and continue to use the Platform.
              </p>
              <ul className="mt-3 space-y-2 list-disc list-inside text-muted-foreground">
                <li><strong className="text-foreground">Session cookie.</strong> Keeps you logged in while you browse. Expires when you close your browser or after 30 minutes of inactivity.</li>
                <li><strong className="text-foreground">Authentication cookie.</strong> Remembers that you have logged in. Expires after 7 days or when you log out.</li>
                <li><strong className="text-foreground">CSRF token.</strong> Prevents cross-site request forgery attacks. Expires with your session.</li>
              </ul>

              <h3 className="font-semibold text-headline mt-4 mb-2">Payment Cookies</h3>
              <p>
                <strong>Stripe cookies.</strong> Our payment processor sets cookies to process payments securely, prevent fraud, and comply with PCI requirements. These are governed by Stripe's privacy policy.
              </p>

              <h3 className="font-semibold text-headline mt-4 mb-2">Analytics Cookies</h3>
              <p>
                With your consent, we use first-party analytics on Ocean Hotspot (page views, site search terms, and checkout steps) stored in our own database — not sold to advertisers.
              </p>
              <p className="mt-3">
                We do not use Google Analytics or any analytics service that tracks you across other websites. We do not build advertising profiles from your browsing behaviour.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-headline mb-3">Cookies We Do Not Use</h2>
              <p>
                We do not use advertising or tracking cookies, social media tracking pixels, third-party cookies for personalised advertising, or any cookies that follow you across other websites.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-headline mb-3">Managing Cookies</h2>
              <p>
                You can control cookies through your browser settings. Most browsers allow you to block all cookies, block third-party cookies only, delete cookies when you close the browser, or be notified before a cookie is set.
              </p>
              <p className="mt-3">
                If you block essential cookies, some parts of the Platform may not work correctly, including login, checkout, and account management.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-headline mb-3">Changes</h2>
              <p>
                We may update this policy if we add new cookies or change our analytics approach. The date at the top shows when it was last updated.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-headline mb-3">Contact</h2>
              <p>
                Questions about cookies:{" "}
                <ContactEmailLink />
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Cookies;
