// @ts-nocheck
"use client";

import Link from "next/link";
import { useState } from "react";
import { SellerLayout } from "@/components/layout/SellerLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PRODUCT_DOMAIN_CATEGORIES } from "@/config/productCategories";
import { PLATFORM_COMMISSION_MARKETING_LABEL } from "@/config/platform";
import {
  Store,
  ArrowRight,
  CheckCircle2,
  LogIn,
  UserPlus,
  Building2,
  Loader2,
} from "lucide-react";
import { SupplierApplicationWizard } from "@/components/sell/SupplierApplicationWizard";

const SellOnOceanHotspot = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const isSeller = profile?.is_seller && profile?.company_name;

  const [storeName, setStoreName] = useState("");
  const [storeBusiness, setStoreBusiness] = useState("");
  const [storeEmail, setStoreEmail] = useState("");
  const [storeSubmitting, setStoreSubmitting] = useState(false);
  const [storeDone, setStoreDone] = useState(false);

  const submitStoreInterest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim() || !storeBusiness.trim() || !storeEmail.trim()) return;

    setStoreSubmitting(true);
    const { error } = await supabase.from("store_interest").insert({
      name: storeName.trim(),
      business: storeBusiness.trim(),
      email: storeEmail.trim().toLowerCase(),
    });

    setStoreSubmitting(false);
    if (error) {
      toast({
        title: "Could not register",
        description: error.message.includes("store_interest")
          ? "Store registration is not live yet — apply the store_interest database migration."
          : error.message,
        variant: "destructive",
      });
      return;
    }

    setStoreDone(true);
    setStoreName("");
    setStoreBusiness("");
    setStoreEmail("");
    toast({ title: "Thank you", description: "We will be in touch when in-store selling opens." });
  };

  return (
    <SellerLayout>
      <section className="py-10 md:py-14">
        <div className="container max-w-6xl">
          <h1 className="text-3xl md:text-4xl font-bold text-headline mb-3">Sell with Ocean Hotspot</h1>
          <p className="text-muted-foreground max-w-2xl mb-10">
            Your showroom. Your brand. Your customers. You pay nothing until something sells.
          </p>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Online panel */}
            <div className="rounded-2xl border border-border bg-white p-6 md:p-8 shadow-sm">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">Sell online with Ocean Hotspot</p>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">Open now</span>
              </div>
              <h2 className="text-2xl font-bold text-headline mb-4 leading-snug">
                Set up your showroom and load your products now, ready for opening day.
              </h2>

              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed mb-6">
                <p>
                  A showroom that carries your brand, not ours. A direct line to your customers, so you keep the
                  relationship. {PLATFORM_COMMISSION_MARKETING_LABEL.charAt(0).toUpperCase() +
                    PLATFORM_COMMISSION_MARKETING_LABEL.slice(1)} on the order total, only when a product sells. No
                  listing fee and no joining fee.
                </p>
                <p className="font-medium text-foreground">How it works</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Sign up.</li>
                  <li>Set your price on each product.</li>
                  <li>Post your products.</li>
                  <li>Orders are paid by card via Stripe; we record platform commission on each sale.</li>
                  <li>Test it: ask one of your customers to buy one product here.</li>
                </ol>
                <p className="rounded-lg border border-amber-200/80 bg-amber-50/80 p-3 text-amber-950">
                  We are building range. We start marketing to customers once the shelves are full enough to be a real
                  alternative. Until then, your own customers are the first buyers.
                </p>
              </div>

              {user ? (
                <Button variant="o42Primary" className="w-full gap-2" asChild>
                  <Link href={isSeller ? "/seller/dashboard" : "/seller/onboarding"}>
                    {isSeller ? "Go to seller dashboard" : "Complete seller setup"}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <div className="space-y-3">
                  <Button variant="o42Primary" className="w-full gap-2 h-11" asChild>
                    <Link href="/signup">
                      <UserPlus className="h-4 w-4" />
                      Register as a seller
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full gap-2" asChild>
                    <Link href="/seller/login">
                      <LogIn className="h-4 w-4" />
                      Seller login
                    </Link>
                  </Button>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-border">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Categories you can list
                </p>
                <div className="flex flex-wrap gap-2">
                  {PRODUCT_DOMAIN_CATEGORIES.filter((c) => c.value !== "services").map((cat) => (
                    <span
                      key={cat.value}
                      className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium"
                    >
                      {cat.label}
                    </span>
                  ))}
                </div>
              </div>

              <p className="mt-6 text-xs text-muted-foreground" id="commission">
                Commission: {PLATFORM_COMMISSION_MARKETING_LABEL} on the order total (including VAT where
                applicable), recorded when the order is placed. See{" "}
                <Link href="/terms/supplier" className="text-primary hover:underline">
                  Supplier terms
                </Link>
                .
              </p>

              {!isSeller && <SupplierApplicationWizard />}
            </div>

            {/* In-store panel */}
            <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-6 md:p-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Sell in store
              </p>
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold text-headline">Sell in store with Ocean Hotspot</h2>
              </div>
              <p className="inline-flex rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-800 mb-4">
                Coming soon
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Register to be invited when counter sales, catalogue ordering, and store partnerships are live.
              </p>

              {storeDone ? (
                <p className="text-sm text-green-700 font-medium">Thanks — we have your details.</p>
              ) : (
                <form onSubmit={submitStoreInterest} className="space-y-4">
                  <div>
                    <Label htmlFor="store-name">Name</Label>
                    <Input
                      id="store-name"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="store-business">Business</Label>
                    <Input
                      id="store-business"
                      value={storeBusiness}
                      onChange={(e) => setStoreBusiness(e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="store-email">Email</Label>
                    <Input
                      id="store-email"
                      type="email"
                      value={storeEmail}
                      onChange={(e) => setStoreEmail(e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>
                  <Button type="submit" className="w-full gap-2" disabled={storeSubmitting}>
                    {storeSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Store className="h-4 w-4" />}
                    Register
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </SellerLayout>
  );
};

export default SellOnOceanHotspot;
