"use client";

import Link from "next/link";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Shield, Lock, CreditCard, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";


const footerSections = [
  {
    title: "Customer Service",
    links: [
      { label: "Help Centre", path: "/help" },
      { label: "Contact Us", path: "/contact" },
      { label: "Returns & Refunds", path: "/returns" },
      { label: "Buyer Protection", path: "/buyer-protection" },
    ],
  },
  {
    title: "Sellers",
    links: [
      { label: "Sell on Ocean Hotspot", path: "/sell" },
      { label: "Pricing", path: "/pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Our Story", path: "/about" },
      { label: "How It Works", path: "/how-it-works" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms & Conditions", path: "/terms" },
      { label: "Privacy Policy", path: "/privacy" },
      { label: "Cookie Policy", path: "/cookies" },
    ],
  },
];

const trustBadges = [
  { icon: Lock, label: "SSL Secured" },
  { icon: Shield, label: "Buyer Protection" },
  { icon: CreditCard, label: "Secure Payments via Stripe" },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError("");

    try {
      const { error: dbError } = await supabase.rpc("subscribe_newsletter", {
        subscriber_email: email.toLowerCase().trim(),
      });

      if (dbError) throw dbError;

      // Send welcome email (fire-and-forget — don't block on failure)
      supabase.functions.invoke("send-welcome-email", {
        body: { email: email.toLowerCase().trim() },
      }).catch((err) => console.warn("Welcome email failed:", err));

      setSubscribed(true);
      setEmail("");
    } catch (err: any) {
      console.error("Newsletter subscription error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-near-black text-primary-foreground py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Newsletter Signup */}
        <div className="mb-10 pb-8 border-b border-primary-foreground/10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-1">Stay in the loop</h3>
              <p className="text-sm text-primary-foreground/70">
                Subscribe for exclusive deals, new arrivals, and industry insights.
              </p>
            </div>
            {subscribed ? (
              <p className="text-sm text-green-400">
                Thank you for subscribing! We'll keep you updated with the latest from Ocean Hotspot.
              </p>
            ) : (
              <div>
                <form onSubmit={handleNewsletterSubmit} className="flex gap-2 w-full md:w-auto">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 w-full md:w-64"
                    required
                    disabled={loading}
                  />
                  <Button type="submit" variant="o42OutlineSecondary" size="default" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Subscribe"}
                  </Button>
                </form>
                {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
              </div>
            )}
          </div>
        </div>

        {/* Footer Links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-sm font-bold uppercase tracking-wide text-mid-grey mb-4">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.path}
                      className="text-[0.9375rem] text-primary-foreground/80 hover:text-primary-foreground transition-opacity"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Trust Badges & Social Media */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 py-6 border-t border-b border-primary-foreground/10">
          {/* Trust Badges */}
          <div className="flex flex-wrap items-center gap-6">
            {trustBadges.map((badge) => (
              <div key={badge.label} className="flex items-center gap-2 text-sm text-primary-foreground/70">
                <badge.icon className="h-5 w-5" />
                <span>{badge.label}</span>
              </div>
            ))}
          </div>

          {/* Social Media Links */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-mid-grey">Follow us:</span>
            <a
              href="https://www.linkedin.com/company/oceanprime-industries/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
              aria-label="LinkedIn"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            <a
              href="https://x.com/Oceanprime_Dave"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
              aria-label="Twitter"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
          </div>
        </div>

        <div className="pt-6 text-center text-sm text-mid-grey">
          <p>
            © 2026 Ocean Hotspot. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
