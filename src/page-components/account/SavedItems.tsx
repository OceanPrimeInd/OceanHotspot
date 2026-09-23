"use client";

import Link from "next/link";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";

export default function SavedItems() {
  return (
    <Layout>
      <div className="container max-w-lg py-16 text-center">
        <h1 className="text-2xl font-bold text-headline mb-3">Saved items</h1>
        <p className="text-muted-foreground mb-8">Your wish list holds the products you want until we open.</p>
        <Button variant="o42Primary" asChild>
          <Link href="/wishlist">Go to my wish list</Link>
        </Button>
      </div>
    </Layout>
  );
}
