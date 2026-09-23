// @ts-nocheck
"use client";

import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Mail, Store, Lock, MessageSquare } from "lucide-react";
import { CONTACT_EMAIL } from "@/config/contact";
import { ContactEmailLink } from "@/components/ContactEmailLink";

const enquiryTopics = [
  {
    icon: Store,
    title: "Vendor enquiries",
    description:
      "Interested in selling on Ocean Hotspot, or have questions about your vendor account?",
  },
  {
    icon: Mail,
    title: "Buyer support",
    description: "Need help with an order, return, or dispute?",
  },
  {
    icon: Lock,
    title: "Privacy and data",
    description: "Questions about your personal data or our privacy practices?",
  },
  {
    icon: MessageSquare,
    title: "General enquiries",
    description: "Anything else — include your topic in the subject line.",
  },
];

const Contact = () => {
  return (
    <Layout>
      <div className="container max-w-3xl py-12">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
          <h1 className="text-3xl font-bold text-headline mb-2">Contact Us</h1>
          <p className="text-muted-foreground mb-4">
            Get in touch with the Ocean Hotspot team. While the online checkout is opening soon,{" "}
            <strong>all orders and product questions</strong> come through us — include part numbers, links to
            listings, and your boat details. We can quote card and bank-transfer prices.
          </p>

          <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4">
            <p className="text-sm font-medium text-foreground">Email</p>
            <p className="mt-1 text-lg">
              <ContactEmailLink className="text-primary underline hover:text-primary/80 font-medium" />
            </p>
          </div>

          <div className="grid gap-4">
            {enquiryTopics.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-xl border border-border/60 bg-muted/30 p-4"
              >
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <Icon className="h-4 w-4 text-primary" />
                  {title}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            Ocean Hotspot is operated by Ocean Prime Industries Ltd, registered in England and Wales.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Button variant="o42Primary" asChild>
              <a href={`mailto:${CONTACT_EMAIL}`}>Email us</a>
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
