"use client";

import Link from "next/link";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { CreditCard, Landmark, Heart } from "lucide-react";

export function CheckoutClosedPlaceholder() {
  return (
    <Layout>
      <div className="container max-w-xl py-16">
        <h1 className="text-2xl font-bold text-headline mb-3">Checkout opens when the shop opens</h1>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          Until then, send us your wish list and we will confirm price, availability and delivery with you
          directly.
        </p>

        <div className="mb-8 space-y-3 rounded-xl border border-border bg-muted/30 p-5 text-sm">
          <p className="font-semibold text-foreground">How you will pay</p>
          <div className="flex items-center gap-2 text-muted-foreground">
            <CreditCard className="h-4 w-4 shrink-0" />
            Card — coming soon
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Landmark className="h-4 w-4 shrink-0" />
            Bank transfer — coming soon
          </div>
        </div>

        <Button variant="o42Primary" size="lg" className="w-full sm:w-auto" asChild>
          <Link href="/wishlist">
            <Heart className="mr-2 h-4 w-4" />
            Go to my wish list
          </Link>
        </Button>
        <Button variant="link" asChild className="mt-2 block">
          <Link href="/browse">Keep browsing</Link>
        </Button>
      </div>
    </Layout>
  );
}
