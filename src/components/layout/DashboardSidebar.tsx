"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
}

interface DashboardSidebarProps {
  items: NavItem[];
  title: string;
}

export function DashboardSidebar({ items, title }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-card border-r border-border flex-shrink-0 min-h-screen">
      {/* Sidebar Header */}
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-bold text-headline">{title}</h2>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <span className="flex-1">{item.title}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={cn(
                      "flex h-5 min-w-5 items-center justify-center rounded-full text-xs font-bold px-1.5",
                      isActive
                        ? "bg-primary-foreground text-primary"
                        : "bg-destructive text-destructive-foreground"
                    )}>
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
