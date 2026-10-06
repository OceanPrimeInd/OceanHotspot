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

  return [
    {
      title: "Ocean Hotspot",
      links: [
        { label: "Contact us", path: "/contact" },
        { label: "Wish list", path: "/wishlist" },
        ...(shopOpen ? [{ label: "Checkout", path: "/cart" }] : []),
      ],
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

        <div className="mb-10 grid grid-cols-2 gap-8 sm:grid-cols-3">
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

        </div>

        <div className="pt-6 text-center text-sm text-slate-400">
          <p>{COMPANY_LEGAL_LINE}</p>
        </div>
      </div>
    </footer>
  );
}
