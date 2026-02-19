// @ts-nocheck
"use client";

import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LifeBuoy, MessageSquare, PackageSearch } from "lucide-react";

const Help = () => {
  return (
    <Layout>
      <div className="container max-w-3xl py-12">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <LifeBuoy className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold text-headline">Help Centre</h1>
          </div>
          <p className="text-muted-foreground">
            Find quick answers about orders, returns, and account access. If you need a hand,
            our support team is ready to help.
          </p>

          <div className="mt-6 grid gap-4">
            <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <PackageSearch className="h-4 w-4 text-primary" />
                Track an order
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                View your order status and latest updates from the seller in your account dashboard.
              </p>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <MessageSquare className="h-4 w-4 text-primary" />
                Message a seller
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Need more details on a product? Send a direct enquiry to the seller from the listing.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Button variant="o42Primary" asChild>
              <Link href="/contact">Contact Support</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/my-orders">View My Orders</Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Help;
