import Link from "next/link";
import {
  Anchor,
  BadgeCheck,
  Building2,
  ClipboardList,
  Cog,
  Flame,
  FlaskConical,
  Fuel,
  Heart,
  LifeBuoy,
  Map,
  MapPin,
  Package,
  Radio,
  Receipt,
  Scale,
  Shield,
  Ship,
  Sparkles,
  Store,
  Sun,
  User,
  Users,
  Wrench,
  Zap,
} from "lucide-react";
import type { HomeCard } from "@/lib/storefront";

const ICONS = {
  anchor: Anchor,
  badge: BadgeCheck,
  building: Building2,
  clipboard: ClipboardList,
  cog: Cog,
  flame: Flame,
  flask: FlaskConical,
  fuel: Fuel,
  heart: Heart,
  life: LifeBuoy,
  map: Map,
  package: Package,
  pin: MapPin,
  radio: Radio,
  receipt: Receipt,
  scale: Scale,
  shield: Shield,
  ship: Ship,
  spark: Sparkles,
  store: Store,
  sun: Sun,
  user: User,
  users: Users,
  wrench: Wrench,
  zap: Zap,
} as const;

export function HomeCategoryCard({ card }: { card: HomeCard }) {
  return (
    <article className="flex h-full flex-col bg-white p-4 shadow-sm md:p-5">
      <h2 className="mb-3 text-xl font-bold leading-tight text-[#0f1111]">{card.title}</h2>
      <div className="grid flex-1 grid-cols-2 gap-3">
        {card.tiles.map((tile) => {
          const Icon = ICONS[tile.icon as keyof typeof ICONS] ?? Package;
          return (
            <Link key={tile.label} href={tile.href} className="group min-w-0">
              <div className={`flex aspect-[4/3] items-center justify-center ${tile.tone}`}>
                <Icon className="h-8 w-8 text-[#0c2340]" strokeWidth={1.75} />
              </div>
              <p className="mt-1 truncate text-xs text-[#0f1111] group-hover:text-primary group-hover:underline">
                {tile.label}
              </p>
            </Link>
          );
        })}
      </div>
      <Link href={card.href} className="mt-4 text-sm text-primary hover:text-[#c9521a] hover:underline">
        {card.linkLabel}
      </Link>
    </article>
  );
}
