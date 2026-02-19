// @ts-nocheck
"use client";

import Link from "next/link";
import { SellerLayout } from "@/components/layout/SellerLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  Ship,
  Globe,
  ShieldCheck,
  CreditCard,
  BarChart3,
  Store,
  Users,
  ArrowRight,
  CheckCircle2,
  LogIn,
  UserPlus,
} from "lucide-react";

const BENEFITS = [
  {
    icon: Globe,
    title: "Global Reach",
    description:
      "Access buyers across the maritime industry worldwide. From commercial operators to recreational vessel owners.",
  },
  {
    icon: CreditCard,
    title: "No Listing Fees",
    description:
      "List your products for free. We only charge a small commission when you make a sale.",
  },
  {
    icon: ShieldCheck,
    title: "Buyer Protection",
    description:
      "Payments are processed securely via Stripe. We are building enhanced buyer protection with payment holding and verified delivery confirmation, launching soon.",
  },
  {
    icon: BarChart3,
    title: "Seller Dashboard",
    description:
      "Track orders, revenue, enquiries, and performance from a dedicated seller dashboard.",
  },
  {
    icon: Store,
    title: "Your Own Showroom",
    description:
      "Create a branded showroom page to showcase your products and build trust with buyers.",
  },
  {
    icon: Users,
    title: "Direct Enquiries",
    description:
      "Receive product enquiries and messages directly from interested buyers.",
  },
];

const STEPS = [
  {
    step: 1,
    title: "Create Your Seller Account",
    description:
      "Sign up with your email and password. It's separate from buyer accounts.",
  },
  {
    step: 2,
    title: "Complete Onboarding",
    description:
      "Add your business details, KYC verification, and set up your shop.",
  },
  {
    step: 3,
    title: "List Your Products",
    description:
      "Add products with images, pricing, VAT treatment, and shipping details.",
  },
  {
    step: 4,
    title: "Start Selling",
    description:
      "Buyers discover your products, place orders, and you get paid securely via Stripe.",
  },
];

const CATEGORIES = [
  "Vessels & Floating Assets",
  "Propulsion & Power",
  "Safety & Response",
  "Maintenance & Consumables",
  "Fishing & Aquaculture",
  "Eco & Compliance",
  "Other",
];

const SellOnOceanHotspot = () => {
  const { user, profile } = useAuth();
  const isSeller = profile?.is_seller && profile?.company_name;

  return (
    <SellerLayout>
      {/* Hero Section with Auth Panel */}
      <section className="py-12 md:py-20">
        <div className="container max-w-6xl">
          <div className="grid md:grid-cols-5 gap-8 md:gap-12 items-center">
            {/* Left: Hero Content */}
            <div className="md:col-span-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 mb-6">
                <Ship className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  Maritime Marketplace
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-headline mb-4 tracking-tight leading-tight">
                Sell on{" "}
                <span className="text-primary">Ocean Hotspot</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg mb-6">
                Join the maritime marketplace trusted by professionals. List your
                products to a global audience of vessel owners, operators, and
                maritime businesses.
              </p>
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  No listing fees
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Secure payments
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Global reach
                </span>
              </div>
            </div>

            {/* Right: Auth Card */}
            <div className="md:col-span-2">
              <div className="rounded-2xl border border-border bg-white p-6 md:p-8 shadow-xl">
                {user ? (
                  // Logged in state
                  <div className="text-center space-y-4">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                      <Store className="h-7 w-7 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold text-headline">
                      {isSeller ? "Welcome Back, Seller!" : "Complete Your Setup"}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {isSeller
                        ? "Head to your dashboard to manage products and orders."
                        : "Finish setting up your seller account to start listing products."}
                    </p>
                    <Button variant="o42Primary" className="w-full h-11 gap-2" asChild>
                      <Link href={isSeller ? "/seller/dashboard" : "/seller/onboarding"}>
                        {isSeller ? "Go to Dashboard" : "Complete Registration"}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ) : (
                  // Not logged in state
                  <div className="space-y-5">
                    <div className="text-center">
                      <h2 className="text-xl font-bold text-headline mb-1">
                        Get Started
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Create your seller account or sign in
                      </p>
                    </div>

                    <Button variant="o42Primary" className="w-full h-12 gap-2 text-base" asChild>
                      <Link href="/signup">
                        <UserPlus className="h-5 w-5" />
                        Register as a Seller
                      </Link>
                    </Button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-3 text-muted-foreground">
                          or
                        </span>
                      </div>
                    </div>

                    <Button variant="outline" className="w-full h-11 gap-2" asChild>
                      <Link href="/seller/login">
                        <LogIn className="h-4 w-4" />
                        Seller Login
                      </Link>
                    </Button>

                    <p className="text-center text-xs text-muted-foreground pt-2">
                      By registering, you agree to our{" "}
                      <Link href="/terms" className="text-primary hover:underline">
                        Terms of Service
                      </Link>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-16 bg-white/60">
        <div className="container max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-bold text-headline text-center mb-4">
            Why Sell With Us?
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Everything you need to grow your maritime business online.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENEFITS.map((benefit) => (
              <div
                key={benefit.title}
                className="rounded-xl border border-border bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                  <benefit.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="container max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold text-headline text-center mb-12">
            How It Works
          </h2>
          <div className="space-y-6">
            {STEPS.map((item) => (
              <div
                key={item.step}
                className="flex gap-4 items-start rounded-xl border border-border bg-white p-6 shadow-sm"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white/60">
        <div className="container max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold text-headline text-center mb-4">
            What Can You Sell?
          </h2>
          <p className="text-muted-foreground text-center mb-8">
            We support a wide range of maritime products and services.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {CATEGORIES.map((category) => (
              <div
                key={category}
                className="flex items-center gap-2 rounded-lg border border-border bg-white p-4"
              >
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-sm font-medium">{category}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16">
        <div className="container max-w-3xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-headline mb-4">
            Ready to Start Selling?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            No mandatory monthly fees. List your products for free. We only make money when you make money.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Button variant="o42Primary" size="lg" asChild className="gap-2">
                <Link href={isSeller ? "/seller/dashboard" : "/seller/onboarding"}>
                  {isSeller ? "Go to Dashboard" : "Complete Registration"}
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="o42Primary" size="lg" asChild className="gap-2">
                  <Link href="/signup">
                    Start Selling Today
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/seller/login">Seller Login</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>
    </SellerLayout>
  );
};

export default SellOnOceanHotspot;
