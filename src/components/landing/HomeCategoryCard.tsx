import Link from "next/link";
import { Flame, Fuel, Map, Package, Scale } from "lucide-react";
import type { HomeBox } from "@/lib/storefront";

const ICONS = {
  flame: Flame,
  fuel: Fuel,
  map: Map,
  package: Package,
  scale: Scale,
} as const;

export function HomeCategoryCard({ card }: { card: HomeBox }) {
  const Icon = ICONS[card.icon as keyof typeof ICONS] ?? Package;
  const large = card.size === "large";

  return (
    <Link
      href={card.href}
      className={`group flex h-full flex-col bg-white p-4 shadow-sm ${
        large ? "sm:col-span-2 sm:row-span-2 md:p-5" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className={`font-bold leading-tight text-[#0f1111] ${large ? "text-2xl" : "text-lg"}`}>
          {card.title}
        </h2>
        {card.comingSoon && (
          <span className="shrink-0 rounded bg-[#0c2340] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
            Coming soon
          </span>
        )}
      </div>
      <p className={`mt-2 text-[#333] ${large ? "text-base" : "text-sm"}`}>{card.message}</p>
      <div className={`mt-3 flex flex-1 items-center justify-center ${card.tone} ${large ? "min-h-48" : "min-h-28"}`}>
        <Icon className={`text-[#0c2340] ${large ? "h-16 w-16" : "h-10 w-10"}`} strokeWidth={1.75} />
      </div>
    </Link>
  );
}
