"use client";

import { MessageCircle } from "lucide-react";
import { buildWhatsAppUrl, isWhatsAppConfigured } from "@/lib/whatsapp";
import { usePathname } from "next/navigation";

const DEFAULT_MSG = "Hi Ocean Hotspot — I'd like help finding a marine part.";

export function WhatsAppFloatingButton() {
  const pathname = usePathname();
  if (pathname?.startsWith("/seller") || pathname?.startsWith("/admin")) return null;
  if (!isWhatsAppConfigured()) return null;

  const href = buildWhatsAppUrl(DEFAULT_MSG);
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 right-4 z-40 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#20bd5a] md:bottom-6"
      aria-label="WhatsApp us"
    >
      <MessageCircle className="h-5 w-5" />
      <span className="hidden sm:inline">WhatsApp us</span>
    </a>
  );
}

type LinkProps = {
  message?: string;
  className?: string;
  children?: React.ReactNode;
};

export function WhatsAppLink({ message = DEFAULT_MSG, className = "", children }: LinkProps) {
  if (!isWhatsAppConfigured()) return null;
  const href = buildWhatsAppUrl(message);
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={(event) => event.stopPropagation()}
    >
      {children ?? "WhatsApp us"}
    </a>
  );
}
