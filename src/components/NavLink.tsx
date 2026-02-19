"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

interface NavLinkProps extends ComponentProps<typeof Link> {
  activeClassName?: string;
  pendingClassName?: string;
}

export function NavLink({ href, className, activeClassName, children, ...props }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/" && pathname?.startsWith(href as string));

  return (
    <Link
      href={href}
      className={cn(className, isActive && activeClassName)}
      {...props}
    >
      {children}
    </Link>
  );
}

export default NavLink;
