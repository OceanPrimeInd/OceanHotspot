"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ShoppingCart,
  ChevronDown,
  ChevronRight,
  User,
  Shield,
  Store,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useState, useEffect, FormEvent, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/utils";
import {
  Command,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CATEGORY_TREE, TOP_CATEGORIES } from "@/components/browse/vintedFilterConfig";
import { getCategoryIcon, getSubgroupIcon } from "@/components/browse/categoryIcons";

interface SearchSuggestion {
  id: string;
  title: string;
  price: number;
  currency: string;
}

const BRAND = {
  orange: "#f26d2a",
};

export function TopBar() {
  const { user, profile, signOut } = useAuth();
  const { itemCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const { isAdmin } = useAdminCheck();
  const router = useRouter();
  const headerRef = useRef<HTMLElement | null>(null);

  const [mounted, setMounted] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>(TOP_CATEGORIES[0]);
  const [activeSubgroup, setActiveSubgroup] = useState<string>("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const isSeller = profile?.is_seller && profile?.company_name;
  const subgroups = Object.keys(CATEGORY_TREE[activeCategory] ?? {});
  const activeItems = CATEGORY_TREE[activeCategory]?.[activeSubgroup] ?? [];

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const firstSubgroup = Object.keys(CATEGORY_TREE[activeCategory] ?? {})[0] ?? "";
    setActiveSubgroup(firstSubgroup);
  }, [activeCategory]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoadingSuggestions(true);
    const { data, error } = await supabase
      .from("products")
      .select("id, title, price, currency")
      .eq("is_published", true)
      .ilike("title", `%${query}%`)
      .limit(5);

    if (!error && data) setSuggestions(data);
    setLoadingSuggestions(false);
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => fetchSuggestions(searchQuery), 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, fetchSuggestions]);

  const handleSuggestionClick = (productId: string) => {
    setShowSuggestions(false);
    setSearchQuery("");
    setIsMenuOpen(false);
    router.push(`/product/${productId}`);
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setIsMenuOpen(false);
    if (searchQuery.trim()) {
      router.push(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getDashboardLink = () => {
    if (isAdmin) return "/admin";
    if (isSeller) return "/seller/dashboard";
    return "/account/settings";
  };

  const getDashboardLabel = () => {
    if (isAdmin) return "Admin Dashboard";
    if (isSeller) return "Seller Dashboard";
    return "My Account";
  };

  const openCategoryMenu = (category: string) => {
    if (activeCategory === category && isMenuOpen) {
      setIsMenuOpen(false);
      return;
    }
    setActiveCategory(category);
    setIsMenuOpen(true);
  };

  const browseLink = (category: string, subgroup?: string, item?: string) => {
    const parts = [category, subgroup, item].filter(Boolean);
    return `/browse?q=${encodeURIComponent(parts.join(" "))}`;
  };

  const categoryRows = [
    TOP_CATEGORIES.slice(0, 8),
    TOP_CATEGORIES.slice(8),
  ] as const;

  const renderCategoryButton = (category: string) => {
    const Icon = getCategoryIcon(category);
    const isActive = activeCategory === category && isMenuOpen;

    return (
      <button
        key={category}
        type="button"
        onMouseEnter={() => {
          if (isMenuOpen) setActiveCategory(category);
        }}
        onClick={() => openCategoryMenu(category)}
        className={`group flex min-h-[64px] w-full min-w-0 flex-col items-center justify-center gap-1.5 rounded-lg px-1.5 py-2 transition-all duration-200 md:min-h-[68px] md:px-2 ${
          isActive
            ? "bg-primary/10 font-semibold text-primary shadow-[0_2px_10px_hsl(var(--primary)/0.14)] ring-1 ring-primary/15"
            : "font-medium text-[#4a5861] hover:bg-primary/5 hover:text-primary hover:shadow-[0_1px_6px_hsl(var(--primary)/0.08)]"
        }`}
      >
        <Icon
          className={`h-5 w-5 shrink-0 transition ${
            isActive ? "text-primary" : "text-[#6b7a84] group-hover:text-primary"
          }`}
        />
        <span className="w-full text-center text-xs leading-snug sm:text-[13px] md:text-sm">
          {category}
        </span>
      </button>
    );
  };

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 border-b border-[#e8e8e8] bg-white text-[#1d2a2f] shadow-[0_1px_8px_rgba(24,39,52,0.06)]"
    >
      {/* Top row */}
      <div className="page-container flex items-center gap-2 py-2.5 md:gap-3">
        <Link
          href="/"
          className="flex shrink-0 items-center"
          onClick={() => setIsMenuOpen(false)}
        >
          <img src="/logo.png" alt="Ocean Hotspot" className="h-9 w-auto md:h-10" />
        </Link>

        <form
          onSubmit={handleSearch}
          className="hidden min-w-0 flex-1 items-stretch overflow-hidden rounded-lg border border-[#d4d4d4] bg-[#f4f4f4] md:flex"
        >
          <div className="flex min-w-0 flex-1 items-center gap-2.5 px-3.5">
            <Search className="h-4 w-4 shrink-0 text-[#8a969e]" />
            <Popover open={showSuggestions && suggestions.length > 0} onOpenChange={setShowSuggestions}>
              <PopoverTrigger asChild>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  placeholder="Search for items"
                  className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-[#1d2a2f] placeholder:text-[#8a969e] focus:outline-none"
                />
              </PopoverTrigger>
              <PopoverContent
                className="w-[var(--radix-popover-trigger-width)] p-0"
                align="start"
                onOpenAutoFocus={(e) => e.preventDefault()}
              >
                <Command>
                  <CommandList>
                    {loadingSuggestions ? (
                      <div className="px-4 py-4 text-sm text-slate-500">Searching...</div>
                    ) : suggestions.length === 0 ? (
                      <CommandEmpty>No products found.</CommandEmpty>
                    ) : (
                      <CommandGroup heading="Suggestions">
                        {suggestions.map((suggestion) => (
                          <CommandItem
                            key={suggestion.id}
                            onSelect={() => handleSuggestionClick(suggestion.id)}
                            className="cursor-pointer"
                          >
                            <Search className="mr-2 h-4 w-4 text-slate-500" />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm">{suggestion.title}</p>
                                <p className="text-xs font-medium text-primary">
                                {formatPrice(suggestion.currency, suggestion.price)}
                              </p>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <button
            type="submit"
            className="flex w-12 shrink-0 items-center justify-center border-l border-[#d4d4d4] text-[#1d2a2f] transition hover:bg-[#ebebeb]"
            aria-label="Search"
          >
            <Search className="h-[18px] w-[18px]" />
          </button>
        </form>

        <div className="flex shrink-0 items-center gap-1.5 md:gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="hidden items-center gap-2 px-2 py-1 text-[#2e3d44] md:flex">
                  <div className="text-left">
                    <p className="text-[10px] leading-none text-[#8a969e]">
                      Hello, {user.email?.split("@")[0]}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-sm font-semibold">
                      {isAdmin && <Shield className="h-3 w-3 text-red-500" />}
                      {isSeller && !isAdmin && <Store className="h-3 w-3 text-primary" />}
                      Account <ChevronDown className="h-3 w-3" />
                    </p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="z-50 w-52 bg-white">
                <DropdownMenuItem asChild>
                  <Link href={getDashboardLink()} className="font-medium">
                    {getDashboardLabel()}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {isAdmin && (
                  <>
                    <DropdownMenuItem asChild><Link href="/admin/sellers">Manage Sellers</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link href="/admin/orders">All Orders</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link href="/admin/users">Users</Link></DropdownMenuItem>
                  </>
                )}
                {!isAdmin && !isSeller && (
                  <>
                    <DropdownMenuItem asChild><Link href="/my-orders">My Orders</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link href="/my-returns">My Returns</Link></DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="text-red-500">
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden items-center gap-1.5 md:flex">
              <Link
                href="/join"
                className="whitespace-nowrap rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10"
              >
                Sign up | Log in
              </Link>
              <Link
                href="/sell"
                className="whitespace-nowrap rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                Sell now
              </Link>
            </div>
          )}

          <Link
            href="/cart"
            className="relative flex items-center justify-center rounded-lg border border-[#e0e0e0] bg-white p-2 text-[#2e3d44] transition hover:border-[#c8c8c8]"
            onClick={() => setIsMenuOpen(false)}
          >
            <ShoppingCart className="h-5 w-5" />
            {mounted && itemCount > 0 && (
              <span
                className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
                style={{ backgroundColor: BRAND.orange }}
              >
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            )}
          </Link>

          {!isAdmin && !isSeller && (
            <Link
              href="/wishlist"
              className="relative flex items-center justify-center rounded-lg border border-[#e0e0e0] bg-white p-2 text-[#2e3d44] transition hover:border-[#c8c8c8]"
              onClick={() => setIsMenuOpen(false)}
            >
              <Heart className="h-4 w-4" />
              {mounted && wishlistCount > 0 && (
                <span
                  className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold text-white"
                  style={{ backgroundColor: BRAND.orange }}
                >
                  {wishlistCount > 9 ? "9+" : wishlistCount}
                </span>
              )}
            </Link>
          )}

          <Button variant="ghost" size="icon" asChild className="md:hidden">
            <Link href={user ? getDashboardLink() : "/login"}>
              {isAdmin ? <Shield className="h-5 w-5 text-red-500" /> : <User className="h-5 w-5" />}
            </Link>
          </Button>
        </div>
      </div>

      {/* Category nav — two equal-height rows */}
      <nav className="border-t border-[#ececec]">
        <div className="page-container flex flex-col gap-2 py-2.5 md:gap-2.5 md:py-3">
          <div className="grid min-h-[64px] grid-cols-4 items-stretch gap-x-1.5 sm:grid-cols-4 md:min-h-[68px] md:grid-cols-8 md:gap-x-2">
            {categoryRows[0].map(renderCategoryButton)}
          </div>

          <div className="h-px bg-[#e4e4e4]" aria-hidden="true" />

          <div className="grid min-h-[64px] grid-cols-4 items-stretch gap-x-1.5 sm:grid-cols-4 md:min-h-[68px] md:grid-cols-8 md:gap-x-2">
            {categoryRows[1].map(renderCategoryButton)}
          </div>
        </div>
      </nav>

      {/* Mega menu */}
      {isMenuOpen && (
        <div className="border-t border-[#ececec] bg-white shadow-[0_12px_32px_rgba(15,34,87,0.08)]">
          <div className="page-container py-6 md:py-8">
            <div className="grid gap-6 md:grid-cols-[260px_1fr]">
              <div className="space-y-0.5 border-r border-[#ececec] pr-4">
                {subgroups.map((subgroup) => {
                  const SubgroupIcon = getSubgroupIcon(subgroup);
                  const isSelected = activeSubgroup === subgroup;

                  return (
                    <button
                      key={subgroup}
                      type="button"
                      onMouseEnter={() => setActiveSubgroup(subgroup)}
                      onClick={() => setActiveSubgroup(subgroup)}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[15px] transition ${
                        isSelected
                          ? "bg-[#f5f8fb] font-semibold text-[#1d2a2f]"
                          : "text-[#5a6973] hover:bg-[#fafafa] hover:text-[#1d2a2f]"
                      }`}
                    >
                      <SubgroupIcon
                        className={`h-[18px] w-[18px] shrink-0 ${isSelected ? "text-primary" : "text-[#8a969e]"}`}
                      />
                      <span className="flex-1">{subgroup}</span>
                      {isSelected && (
                        <ChevronRight className="h-4 w-4 shrink-0 text-primary" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div>
                <h3 className="mb-4 text-lg font-semibold text-[#1d2a2f]">{activeSubgroup}</h3>
                <div className="grid gap-x-10 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  <Link
                    href={browseLink(activeCategory, activeSubgroup)}
                    className="text-[15px] font-medium text-primary transition hover:underline"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    All {activeSubgroup}
                  </Link>
                  {activeItems.map((item) => (
                    <Link
                      key={item}
                      href={browseLink(activeCategory, activeSubgroup, item)}
                      className="text-[15px] text-[#4b5d68] transition hover:text-primary hover:underline"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
