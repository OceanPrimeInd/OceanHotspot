"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isCustomerCheckoutEnabled, OPENING_SOON_LABEL } from "@/config/launch";
import { CONTACT_EMAIL } from "@/config/contact";

function isSupplierOrAdminPath(pathname: string | null) {
  if (!pathname) return false;
  return (
    pathname.startsWith("/seller") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/distributor") ||
    pathname === "/sell" ||
    pathname === "/signup" ||
    pathname.startsWith("/signup")
  );
}

export function OpeningSoonBanner() {
  const pathname = usePathname();

  if (isCustomerCheckoutEnabled() || isSupplierOrAdminPath(pathname)) {
    return null;
  }

  return (
    <div className="border-b border-amber-200/80 bg-amber-50 px-4 py-2.5 text-center text-sm text-amber-950">
      <span className="font-semibold">{OPENING_SOON_LABEL}</span>
      {" — "}
      Browse the catalogue and supplier showrooms here. To buy,{" "}
      <Link href="/contact" className="font-semibold text-primary underline-offset-2 hover:underline">
        contact Ocean Hotspot
      </Link>{" "}
      (
      <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium underline-offset-2 hover:underline">
        {CONTACT_EMAIL}
      </a>
      ). Online card checkout is not live yet.
    </div>
  );
}
