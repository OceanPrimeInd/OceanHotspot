"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { CONTACT_EMAIL } from "@/config/contact";
import { isCustomerCheckoutEnabled } from "@/config/launch";

type Props = {
  productTitle?: string;
  className?: string;
  size?: "default" | "lg";
};

export function ContactToOrderCTA({ productTitle, className = "", size = "lg" }: Props) {
  if (isCustomerCheckoutEnabled()) return null;

  const subject = productTitle
    ? encodeURIComponent(`Order enquiry: ${productTitle}`)
    : encodeURIComponent("Order enquiry — Ocean Hotspot");
  const mailto = `mailto:${CONTACT_EMAIL}?subject=${subject}`;

  return (
    <div className={`space-y-3 ${className}`}>
      <Button variant="o42Primary" size={size} className="w-full h-14 text-lg" asChild>
        <a href={mailto}>
          <MessageSquare className="mr-2 h-5 w-5" />
          Contact us to order
        </a>
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        We&apos;ll confirm price (including bank-transfer options) and arrange supply.{" "}
        <Link href="/contact" className="text-primary hover:underline">
          Contact page
        </Link>
      </p>
    </div>
  );
}
