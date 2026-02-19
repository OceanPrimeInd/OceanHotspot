// @ts-nocheck
"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  Package,
  Search,
  FileQuestion,
  Inbox,
  AlertCircle,
  FolderOpen,
  Users,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";

// Predefined empty state types with their icons and default content
const emptyStatePresets = {
  cart: {
    icon: ShoppingCart,
    title: "Your cart is empty",
    description: "Looks like you haven't added anything yet. Browse our products to find something you'll love.",
    actionLabel: "Browse Products",
    actionHref: "/browse",
  },
  products: {
    icon: Package,
    title: "No products found",
    description: "We couldn't find any products matching your criteria. Try adjusting your filters or search terms.",
    actionLabel: "Clear Filters",
  },
  search: {
    icon: Search,
    title: "No results found",
    description: "We couldn't find anything matching your search. Try different keywords or browse our categories.",
    actionLabel: "Browse All",
    actionHref: "/browse",
  },
  orders: {
    icon: Inbox,
    title: "No orders yet",
    description: "You haven't placed any orders yet. Start shopping to see your orders here.",
    actionLabel: "Start Shopping",
    actionHref: "/browse",
  },
  notFound: {
    icon: FileQuestion,
    title: "Page not found",
    description: "The page you're looking for doesn't exist or has been moved.",
    actionLabel: "Go Home",
    actionHref: "/",
  },
  error: {
    icon: AlertCircle,
    title: "Something went wrong",
    description: "We encountered an error. Please try again or contact support if the problem persists.",
    actionLabel: "Try Again",
  },
  folder: {
    icon: FolderOpen,
    title: "No files here",
    description: "This folder is empty. Upload files or create new content to get started.",
    actionLabel: "Upload Files",
  },
  users: {
    icon: Users,
    title: "No users found",
    description: "There are no users matching your criteria.",
    actionLabel: "Clear Filters",
  },
  messages: {
    icon: MessageSquare,
    title: "No messages",
    description: "You don't have any messages yet. Start a conversation to see your messages here.",
    actionLabel: "New Message",
  },
};

export type EmptyStatePreset = keyof typeof emptyStatePresets;

interface EmptyStateProps {
  preset?: EmptyStatePreset;
  icon?: LucideIcon;
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
  onSecondaryAction?: () => void;
  className?: string;
  iconClassName?: string;
  compact?: boolean;
  children?: React.ReactNode;
}

export function EmptyState({
  preset,
  icon: CustomIcon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  secondaryActionLabel,
  secondaryActionHref,
  onSecondaryAction,
  className,
  iconClassName,
  compact = false,
  children,
}: EmptyStateProps) {
  // Get preset values or use custom props
  const presetConfig = preset ? emptyStatePresets[preset] : null;
  const Icon = CustomIcon || presetConfig?.icon || Package;
  const displayTitle = title || presetConfig?.title || "Nothing here";
  const displayDescription = description || presetConfig?.description;
  const displayActionLabel = actionLabel || presetConfig?.actionLabel;
  const displayActionHref = actionHref || presetConfig?.actionHref;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center animate-in fade-in-50 slide-in-from-bottom-4 duration-500",
        compact ? "py-8 px-4" : "py-16 px-6",
        className
      )}
    >
      {/* Animated Icon with Background */}
      <div
        className={cn(
          "relative mb-6",
          compact ? "mb-4" : "mb-6"
        )}
      >
        {/* Outer ring animation */}
        <div className="absolute inset-0 rounded-full bg-primary/5 animate-ping" style={{ animationDuration: "3s" }} />
        {/* Icon container */}
        <div
          className={cn(
            "relative flex items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-secondary/10",
            compact ? "h-16 w-16" : "h-24 w-24",
            iconClassName
          )}
        >
          <Icon
            className={cn(
              "text-primary/60",
              compact ? "h-8 w-8" : "h-12 w-12"
            )}
          />
        </div>
      </div>

      {/* Title */}
      <h3
        className={cn(
          "font-semibold text-headline",
          compact ? "text-lg mb-1" : "text-xl mb-2"
        )}
      >
        {displayTitle}
      </h3>

      {/* Description */}
      {displayDescription && (
        <p
          className={cn(
            "text-muted-foreground max-w-md",
            compact ? "text-sm mb-4" : "text-base mb-6"
          )}
        >
          {displayDescription}
        </p>
      )}

      {/* Custom children */}
      {children}

      {/* Action Buttons */}
      {(displayActionLabel || secondaryActionLabel) && (
        <div className={cn("flex flex-col sm:flex-row gap-3", compact && "gap-2")}>
          {displayActionLabel && (
            displayActionHref ? (
              <Button asChild variant="o42Primary" size={compact ? "sm" : "default"}>
                <Link href={displayActionHref}>{displayActionLabel}</Link>
              </Button>
            ) : onAction ? (
              <Button onClick={onAction} variant="o42Primary" size={compact ? "sm" : "default"}>
                {displayActionLabel}
              </Button>
            ) : null
          )}

          {secondaryActionLabel && (
            secondaryActionHref ? (
              <Button asChild variant="outline" size={compact ? "sm" : "default"}>
                <Link href={secondaryActionHref}>{secondaryActionLabel}</Link>
              </Button>
            ) : onSecondaryAction ? (
              <Button onClick={onSecondaryAction} variant="outline" size={compact ? "sm" : "default"}>
                {secondaryActionLabel}
              </Button>
            ) : null
          )}
        </div>
      )}
    </div>
  );
}
