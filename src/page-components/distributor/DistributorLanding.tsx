// @ts-nocheck
"use client";

import Link from "next/link";
import { DistributorLayout } from "@/components/layout/DistributorLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import {
  Truck,
  Globe,
  DollarSign,
  Package,
  MapPin,
  BarChart3,
  Users,
  ArrowRight,
  CheckCircle2,
  LogIn,
  UserPlus,
  Ship,
  ShieldCheck,
  Zap,
} from "lucide-react";

const BENEFITS = [
  {
    icon: DollarSign,
    title: "Earn 5–20% Commission",
    description: "Get paid for every sale you facilitate. Set your own commission rate and negotiate per-vendor agreements.",
  },
  {
    icon: Package,
    title: "No Stock Required",
    description: "Operate as a virtual distributor — no warehousing, no logistics. You sell, the vendor ships.",
  },
  {
    icon: Globe,
    title: "Exclusive Territory Rights",
    description: "Claim coverage areas in your region. Be the go-to distributor for marine brands in your market.",
  },
  {
    icon: BarChart3,
    title: "Distributor Dashboard",
    description: "Track orders, commission earnings, vendor portfolio, and coverage area performance in one place.",
  },
  {
    icon: MapPin,
    title: "Coverage Map",
    description: "Visualise your network coverage. Identify underserved regions and expand your territory strategically.",
  },
  {
    icon: Users,
    title: "500+ Marine Vendors",
    description: "Access our growing catalogue of verified marine brands and choose which products you represent.",
  },
];

const STEPS = [
  {
    step: 1,
    title: "Create Your Distributor Account",
    description: "Sign up with your business email. It only takes a few minutes.",
  },
  {
    step: 2,
    title: "Complete Your Application",
    description: "Tell us about your company, coverage areas, specializations, and set your commission rate.",
  },
  {
    step: 3,
    title: "Get Approved",
    description: "Our team reviews your application within 2–3 business days and unlocks your dashboard.",
  },
  {
    step: 4,
    title: "Build Your Portfolio",
    description: "Browse and select marine vendors to represent. Set up partnerships and start earning.",
  },
];

const SPECIALIZATIONS = [
  "Navigation & Electronics", "Safety Equipment", "Propulsion & Engineering",
  "Deck Hardware", "Anchoring & Mooring", "Marine Clothing & PPE",
  "Commercial Vessels", "Superyachts", "Offshore & Industrial",
];

export default function DistributorLanding() {
  const { user } = useAuth();
  const [distributorStatus, setDistributorStatus] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!user) { setChecking(false); return; }
    supabase
      .from("distributors")
      .select("id, status")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setDistributorStatus(data?.status ?? null);
        setChecking(false);
      });
  }, [user]);

  return (
    <DistributorLayout>
      {/* ── Hero ── */}
      <section className="py-12 md:py-20">
        <div className="container max-w-6xl">
          <div className="grid md:grid-cols-5 gap-8 md:gap-12 items-center">
            {/* Left: content */}
            <div className="md:col-span-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 mb-6">
                <Truck className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Virtual Distributor Network</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-headline mb-4 tracking-tight leading-tight">
                Distribute on{" "}
                <span className="text-primary">Ocean Hotspot</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg mb-6">
                Represent world-class marine brands in your region without holding any stock. Earn commission on every sale you facilitate through your network.
              </p>
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                {[
                  "No stock required",
                  "Earn 5–20% commission",
                  "Exclusive territory rights",
                  "Free to join",
                ].map(item => (
                  <span key={item} className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: auth card */}
            <div className="md:col-span-2">
              <div className="rounded-2xl border border-border bg-white p-6 md:p-8 shadow-xl">
                {!checking && user ? (
                  <div className="text-center space-y-4">
                    <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${
                      distributorStatus === "approved" ? "bg-green-100" :
                      distributorStatus === "pending" ? "bg-amber-100" :
                      "bg-primary/10"
                    }`}>
                      <Truck className={`h-7 w-7 ${
                        distributorStatus === "approved" ? "text-green-600" :
                        distributorStatus === "pending" ? "text-amber-600" :
                        "text-primary"
                      }`} />
                    </div>
                    <h2 className="text-xl font-bold">
                      {distributorStatus === "approved" ? "Welcome Back!" :
                       distributorStatus === "pending" ? "Application Under Review" :
                       "Complete Your Application"}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {distributorStatus === "approved"
                        ? "Head to your dashboard to manage your portfolio and track earnings."
                        : distributorStatus === "pending"
                        ? "Your application is being reviewed. We'll notify you within 2–3 business days."
                        : "Finish your distributor application to get started."}
                    </p>
                    {distributorStatus === "approved" && (
                      <Button variant="o42Primary" className="w-full h-11 gap-2" asChild>
                        <Link href="/distributor/dashboard">
                          Go to Dashboard <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                    {distributorStatus === "pending" && (
                      <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
                        Your application is awaiting admin approval.
                      </div>
                    )}
                    {!distributorStatus && (
                      <Button variant="o42Primary" className="w-full h-11 gap-2" asChild>
                        <Link href="/distributor/register">
                          Complete Application <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="text-center">
                      <h2 className="text-xl font-bold mb-1">Get Started</h2>
                      <p className="text-sm text-muted-foreground">Create your distributor account or sign in</p>
                    </div>

                    <Button variant="o42Primary" className="w-full h-12 gap-2 text-base" asChild>
                      <Link href="/distributor/signup">
                        <UserPlus className="h-5 w-5" />
                        Register as a Distributor
                      </Link>
                    </Button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-3 text-muted-foreground">or</span>
                      </div>
                    </div>

                    <Button variant="outline" className="w-full h-11 gap-2" asChild>
                      <Link href="/distributor/login">
                        <LogIn className="h-4 w-4" />
                        Distributor Login
                      </Link>
                    </Button>

                    <p className="text-center text-xs text-muted-foreground pt-1">
                      By registering, you agree to our{" "}
                      <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Benefits ── */}
      <section className="py-16 bg-white/60">
        <div className="container max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-bold text-headline text-center mb-4">
            Why Become a Distributor?
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            A new way to build a marine distribution business — entirely virtual, zero upfront cost.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENEFITS.map((b) => (
              <div key={b.title} className="rounded-xl border border-border bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                  <b.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{b.title}</h3>
                <p className="text-sm text-muted-foreground">{b.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-16">
        <div className="container max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold text-headline text-center mb-12">
            How It Works
          </h2>
          <div className="space-y-6">
            {STEPS.map((item) => (
              <div key={item.step} className="flex gap-4 items-start rounded-xl border border-border bg-white p-6 shadow-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Specializations ── */}
      <section className="py-16 bg-white/60">
        <div className="container max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold text-headline text-center mb-4">
            What Can You Distribute?
          </h2>
          <p className="text-muted-foreground text-center mb-8">
            Choose from a wide range of maritime product categories.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {SPECIALIZATIONS.map((s) => (
              <div key={s} className="flex items-center gap-2 rounded-lg border border-border bg-white p-4">
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                <span className="text-sm font-medium">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-16">
        <div className="container max-w-3xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-headline mb-4">
            Ready to Build Your Distribution Business?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Free to join. No stock, no warehousing, no logistics. Just your network and our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user && distributorStatus === "approved" ? (
              <Button variant="o42Primary" size="lg" asChild className="gap-2">
                <Link href="/distributor/dashboard">
                  Go to Dashboard <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            ) : user && distributorStatus === "pending" ? (
              <p className="text-amber-600 font-medium">Your application is under review — check back soon.</p>
            ) : (
              <>
                <Button variant="o42Primary" size="lg" asChild className="gap-2">
                  <Link href="/distributor/signup">
                    Start Today <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/distributor/login">Distributor Login</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>
    </DistributorLayout>
  );
}
