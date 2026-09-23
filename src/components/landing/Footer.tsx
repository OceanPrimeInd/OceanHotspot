"use client";

import Link from "next/link";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { COMPANY_LEGAL_LINE } from "@/config/contact";
import { isShopOpen } from "@/config/shop";

const trustBadges = [{ icon: Lock, label: "SSL Secured" }];

function footerSections() {
  const shopOpen = isShopOpen();
  const customerLinks = [
    { label: "Browse", path: "/browse" },
    { label: "Wish list", path: "/wishlist" },
    ...(shopOpen ? [{ label: "Checkout", path: "/cart" }] : []),
  ];

  return [
    {
      title: "Ocean Hotspot",
      links: [
        ...(shopOpen ? [] : [{ label: "Opening soon", path: "/" }]),
        { label: "Contact us", path: "/contact" },
      ],
    },
    {
      title: "Customers",
      links: customerLinks,
    },
    {
      title: "Suppliers",
      links: [{ label: "Sell with Ocean Hotspot", path: "/sell" }],
    },
    {
      title: "Legal",
      links: [
        { label: "Terms and conditions", path: "/terms" },
        { label: "Privacy policy", path: "/privacy" },
        { label: "Cookie policy", path: "/cookies" },
      ],
    },
  ];
}

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const sections = footerSections();

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

      const normalized = email.toLowerCase().trim();
      const { data: mailData, error: mailError } = await supabase.functions.invoke(
        "send-welcome-email",
        { body: { email: normalized } },
      );

      if (mailError || mailData?.error) {
        console.warn("Welcome email failed:", mailError || mailData?.error);
        setError(
          "You're on the list, but we couldn't send the confirmation email yet. Check spam or contact support.",
        );
      }

      setSubscribed(true);
      setEmail("");
    } catch (err: unknown) {
      console.error("Newsletter subscription error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-[#07172f] py-12 text-white">
      <div className="section-shell">
        <div className="mb-10 rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-[0_25px_60px_-30px_rgba(6,17,38,0.8)] md:p-7">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ffab7e]">Stay connected</p>
              <h3 className="mt-2 text-2xl font-black tracking-[-0.05em] text-white">Get fresh marine deals & sourcing news</h3>
            </div>
            {subscribed ? (
              <p className="text-sm text-emerald-300">Thank you for subscribing! We’ll keep you updated.</p>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex w-full max-w-xl flex-col gap-2 sm:flex-row">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 flex-1 rounded-full border-white/10 bg-white/5 text-white placeholder:text-slate-300"
                  required
                  disabled={loading}
                />
                <Button type="submit" variant="secondary" size="default" disabled={loading} className="h-12 rounded-full bg-[#ff7a35] px-6 text-white hover:bg-[#ff8b4d]">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Subscribe"}
                </Button>
              </form>
            )}
          </div>
          {error && <p className="mt-2 text-xs text-red-300">{error}</p>}
        </div>

        <div className="mb-10 grid grid-cols-2 gap-8 sm:grid-cols-4">
          {sections.map((section) => (
            <div key={section.title}>
              <h4 className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-slate-300">{section.title}</h4>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.path} className="text-[0.9375rem] text-slate-200 transition-colors hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-6 border-t border-white/10 py-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-6">
            {trustBadges.map((badge) => (
              <div key={badge.label} className="flex items-center gap-2 text-sm text-slate-300">
                <badge.icon className="h-4 w-4 text-[#ffab7e]" />
                <span>{badge.label}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 text-slate-300">
            <span className="text-sm">Follow us:</span>
            <a href="https://www.linkedin.com/company/oceanprime-industries/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="transition-colors hover:text-white">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
            <a href="https://x.com/Oceanprime_Dave" target="_blank" rel="noopener noreferrer" aria-label="X" className="transition-colors hover:text-white">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
          </div>
        </div>

        <div className="pt-6 text-center text-sm text-slate-400">
          <p>{COMPANY_LEGAL_LINE}</p>
        </div>
      </div>
    </footer>
  );
}
