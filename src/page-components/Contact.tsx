// @ts-nocheck
"use client";

import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Mail, Store, Lock, MessageSquare } from "lucide-react";

const Contact = () => {
  return (
    <Layout>
      <div className="container max-w-3xl py-12">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
          <h1 className="text-3xl font-bold text-headline mb-2">Contact Us</h1>
          <p className="text-muted-foreground mb-6">
            Get in touch with the right team.
          </p>

          <div className="grid gap-4">
            <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <Store className="h-4 w-4 text-primary" />
                Vendor Enquiries
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Interested in selling on Ocean Hotspot, or have questions about your vendor account?
              </p>
              <p className="mt-2 text-sm">
                <a href="mailto:oceanhotspotservices@gmail.com" className="text-primary underline hover:text-primary/80">
                  oceanhotspotservices@gmail.com
                </a>
              </p>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <Mail className="h-4 w-4 text-primary" />
                Buyer Support
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Need help with an order, return, or dispute?
              </p>
              <p className="mt-2 text-sm">
                <a href="mailto:oceanhotspotservices@gmail.com" className="text-primary underline hover:text-primary/80">
                  oceanhotspotservices@gmail.com
                </a>
              </p>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <Lock className="h-4 w-4 text-primary" />
                Privacy and Data
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Questions about your personal data or our privacy practices?
              </p>
              <p className="mt-2 text-sm">
                <a href="mailto:oceanhotspotservices@gmail.com" className="text-primary underline hover:text-primary/80">
                  oceanhotspotservices@gmail.com
                </a>
              </p>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <MessageSquare className="h-4 w-4 text-primary" />
                General Enquiries
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Anything else?
              </p>
              <p className="mt-2 text-sm">
                <a href="mailto:oceanhotspotservices@gmail.com" className="text-primary underline hover:text-primary/80">
                  oceanhotspotservices@gmail.com
                </a>
              </p>
            </div>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            Ocean Hotspot is operated by Ocean Prime Industries Ltd, registered in England and Wales.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Button variant="o42Primary" asChild>
              <a href="mailto:oceanhotspotservices@gmail.com">Email Support</a>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/help">Back to Help Centre</Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
