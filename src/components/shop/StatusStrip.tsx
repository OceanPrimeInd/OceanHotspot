"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isShopOpen } from "@/config/shop";
import { CONTACT_EMAIL } from "@/config/contact";
import { buildWhatsAppUrl, isWhatsAppConfigured } from "@/lib/whatsapp";

function isPortalPath(pathname: string | null) {
  if (!pathname) return false;
  return (
    pathname.startsWith("/seller") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/distributor") ||
    pathname === "/sell" ||
    pathname.startsWith("/signup")
  );
}

export function StatusStrip() {
  const pathname = usePathname();
  if (isShopOpen() || isPortalPath(pathname)) return null;

  const wa = buildWhatsAppUrl("Hi Ocean Hotspot — I have a question before you open.");

  return (
    <div className="border-b border-[#e8d4d4] bg-[#fff7f7] px-4 py-2.5 text-center text-sm text-[#4a3030]">
      <span className="font-semibold text-[#b3161c]">Opening soon.</span> Browse now, build your wish list and we
      will tell you the day we open.{" "}
      <Link href="/contact" className="font-semibold text-primary underline-offset-2 hover:underline">
        Contact us
      </Link>
      {wa && (
        <>
          {" · "}
          <a href={wa} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#128C7E] hover:underline">
            WhatsApp us
          </a>
        </>
      )}
      {" · "}
      <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-primary hover:underline">
        Email us
      </a>
    </div>
  );
}
