// @ts-nocheck
"use client";

import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Mail, Heart, MessageCircle } from "lucide-react";
import { CONTACT_EMAIL, COMPANY_LEGAL_LINE } from "@/config/contact";
import { ContactEmailLink } from "@/components/ContactEmailLink";
import { WhatsAppLink } from "@/components/shop/WhatsAppButton";

const Contact = () => {
  return (
    <Layout>
      <div className="container max-w-3xl py-12">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
          <h1 className="text-3xl font-bold text-headline mb-2">Talk to someone who knows boats</h1>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Ask about a product, send us a part number or a photo, or send us your product list. We reply by WhatsApp
            or email, whichever you prefer.
          </p>

          <div className="space-y-6">
            <section className="rounded-xl border border-[#128C7E]/30 bg-[#128C7E]/5 p-5">
              <div className="flex items-center gap-2 font-semibold text-[#128C7E]">
                <MessageCircle className="h-5 w-5" />
                WhatsApp
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Send us a message or a photo of the part you need.
              </p>
              <WhatsAppLink
                message="Hi Ocean Hotspot — I need help with a marine part."
                className="mt-4 inline-flex h-10 items-center rounded-md border border-[#128C7E] bg-background px-4 text-sm font-medium text-[#128C7E] hover:bg-[#128C7E]/10"
              >
                Message us on WhatsApp
              </WhatsAppLink>
            </section>

            <section className="rounded-xl border border-primary/20 bg-primary/5 p-5">
              <div className="flex items-center gap-2 font-semibold text-primary">
                <Mail className="h-5 w-5" />
                Email
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Write to us at{" "}
                <ContactEmailLink className="font-medium text-primary underline hover:text-primary/80" />.
              </p>
              <Button variant="o42Primary" className="mt-4" asChild>
                <a href={`mailto:${CONTACT_EMAIL}`}>Email us</a>
              </Button>
            </section>

            <section className="rounded-xl border border-border bg-muted/30 p-5">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <Heart className="h-5 w-5 text-red-500" />
                Your product list
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Save the products you want to your wish list and send it to us. You and we both get a copy by email.
              </p>
              <Button variant="outline" className="mt-4" asChild>
                <Link href="/wishlist">Go to my wish list</Link>
              </Button>
            </section>
          </div>

          <p className="mt-8 text-sm text-muted-foreground">{COMPANY_LEGAL_LINE.replace("© ", "")}</p>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
