"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { accountPages } from "@/config/accountPages";
import { cn } from "@/lib/utils";

export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2 lg:flex-col">
      {accountPages.map((page) => (
        <Link
          key={page.path}
          href={page.path}
          className={cn(
            "rounded-full lg:rounded-md px-3 py-1.5 text-sm transition-colors",
            pathname === page.path
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
          )}
        >
          {page.label}
        </Link>
      ))}
    </nav>
  );
}
