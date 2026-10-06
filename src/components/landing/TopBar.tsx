"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  ShoppingCart,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  User,
  Shield,
  Store,
  Heart,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useState, useEffect, FormEvent, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/utils";
import { trackSiteSearch } from "@/lib/analytics";
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
import { NAV_CATEGORIES, getNavBackendKeys, getSubgroupsForBackend } from "@/components/browse/filterConfig";
import { browseUrlForNavLabel, navLabelToCategorySlug } from "@/lib/navBrowse";
import { STORE_NAV } from "@/lib/storefront";
interface SearchSuggestion {
  id: string;
  title: string;
  price: number;
  currency: string;
}

function isPortalPath(pathname: string | null) {
  if (!pathname) return false;
  return (
    pathname.startsWith("/seller") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/distributor")
  );
}

export function TopBar() {
  const { user, profile, signOut } = useAuth();
  const { itemCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const { isAdmin } = useAdminCheck();
  const router = useRouter();
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement | null>(null);
  const showMarketplaceChrome = !isPortalPath(pathname);

  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPanel, setMenuPanel] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const isSeller = profile?.is_seller && profile?.company_name;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!isMenuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        setMenuPanel(null);
      }
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [isMenuOpen]);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoadingSuggestions(true);
    const escaped = query.replace(/[%_,]/g, " ");
    // Title + description only until DB has part_number and types are regenerated
    const { data, error } = await supabase
      .from("products")
      .select("id, title, price, currency")
      .eq("is_published", true)
      .or(`title.ilike.%${escaped}%,description.ilike.%${escaped}%`)
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
      trackSiteSearch(searchQuery.trim(), user?.id);
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

  const closeMenu = () => {
    setIsMenuOpen(false);
    setMenuPanel(null);
  };

  const subgroupsFor = (label: string) =>
    getNavBackendKeys(label).flatMap((key) => getSubgroupsForBackend(key));

  const isRepeatAllLabel = (subgroup: string, panel: string) => {
    const norm = subgroup.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    const panelNorm = panel.toLowerCase();
    return (
      norm === "all" ||
      norm === `all ${panelNorm}` ||
      norm === `view all ${panelNorm}` ||
      norm === "view all" ||
      norm.startsWith("view all ")
    );
  };

  const helloLabel = user ? `Hello, ${user.email?.split("@")[0]}` : "Hello, sign in";

  const allMenu =
    mounted && isMenuOpen
      ? createPortal(
          <>
            <button
              type="button"
              className="fixed inset-0 z-[80] bg-black/60"
              aria-label="Close menu"
              onClick={closeMenu}
            />
            <aside className="fixed inset-y-0 left-0 z-[90] flex w-[min(100%,365px)] flex-col bg-white text-[#0f1111] shadow-2xl">
              <div className="flex items-center justify-between bg-primary px-5 py-3.5 text-white">
                {menuPanel ? (
                  <button
                    type="button"
                    onClick={() => setMenuPanel(null)}
                    className="inline-flex items-center gap-2 text-lg font-bold"
                  >
                    <ChevronLeft className="h-5 w-5" />
                    Main menu
                  </button>
                ) : (
                  <Link
                    href={user ? getDashboardLink() : "/login"}
                    onClick={closeMenu}
                    className="inline-flex items-center gap-3 text-lg font-bold"
                  >
                    <User className="h-6 w-6" />
                    {helloLabel}
                  </Link>
                )}
                <button type="button" onClick={closeMenu} aria-label="Close" className="rounded p-1 hover:bg-white/15">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pb-8">
                {menuPanel ? (
                  <div className="py-2">
                    <h2 className="px-6 py-3 text-lg font-bold">{menuPanel}</h2>
                    <Link
                      href={browseUrlForNavLabel(menuPanel)}
                      onClick={closeMenu}
                      className="block px-6 py-2.5 text-sm hover:bg-[#eee]"
                    >
                      All {menuPanel}
                    </Link>
                    {subgroupsFor(menuPanel)
                      .filter((subgroup) => !isRepeatAllLabel(subgroup, menuPanel))
                      .map((subgroup) => {
                      const slug = navLabelToCategorySlug(menuPanel);
                      const href = slug
                        ? `/browse?cat=${encodeURIComponent(slug)}&label=${encodeURIComponent(`${menuPanel} / ${subgroup}`)}`
                        : `/browse?q=${encodeURIComponent(subgroup)}`;
                      return (
                        <Link
                          key={subgroup}
                          href={href}
                          onClick={closeMenu}
                          className="block px-6 py-2.5 text-sm hover:bg-[#eee]"
                        >
                          {subgroup}
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <>
                    <section className="border-b border-[#d5d9d9] py-3">
                      <h2 className="px-6 py-2 text-lg font-bold">Shop by department</h2>
                      {NAV_CATEGORIES.map((category) => {
                        const subgroups = subgroupsFor(category.label);
                        if (subgroups.length > 0) {
                          return (
                            <button
                              key={category.label}
                              type="button"
                              onClick={() => setMenuPanel(category.label)}
                              className="flex w-full items-center justify-between px-6 py-2.5 text-left text-sm hover:bg-[#eee]"
                            >
                              {category.label}
                              <ChevronRight className="h-4 w-4 text-[#555]" />
                            </button>
                          );
                        }
                        return (
                          <Link
                            key={category.label}
                            href={browseUrlForNavLabel(category.label)}
                            onClick={closeMenu}
                            className="block px-6 py-2.5 text-sm hover:bg-[#eee]"
                          >
                            {category.label}
                          </Link>
                        );
                      })}
                    </section>
                    <section className="py-3">
                      <h2 className="px-6 py-2 text-lg font-bold">Explore Ocean Hotspot</h2>
                      {STORE_NAV.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={closeMenu}
                          className="flex items-center justify-between px-6 py-2.5 text-sm hover:bg-[#eee]"
                        >
                          {item.label}
                          <ChevronRight className="h-4 w-4 text-[#555]" />
                        </Link>
                      ))}
                    </section>
                  </>
                )}
              </div>
            </aside>
          </>,
          document.body,
        )
      : null;

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 border-b border-[#e8e8e8] bg-white text-[#1d2a2f] shadow-[0_1px_8px_rgba(24,39,52,0.06)]"
    >
      {/* Top row */}
      <div className="flex w-full items-center gap-2 px-3 py-2.5 md:gap-3 md:px-4">
        <Link
          href="/"
          className="flex shrink-0 items-center"
          onClick={() => setIsMenuOpen(false)}
        >
          <img src="/logo.png" alt="Ocean Hotspot" className="h-9 w-auto md:h-10" />
        </Link>

        {showMarketplaceChrome ? (
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
                  placeholder="Search by part number, product or boat"
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
        ) : (
          <div className="hidden min-w-0 flex-1 md:block" aria-hidden />
        )}

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
                Sell
              </Link>
            </div>
          )}

          {showMarketplaceChrome && (
          <Link
            href="/cart"
            className="relative flex items-center justify-center rounded-lg border border-[#e0e0e0] bg-white p-2 text-[#2e3d44] transition hover:border-[#c8c8c8]"
            aria-label={itemCount > 0 ? `Basket, ${itemCount} items` : "Basket"}
            onClick={() => setIsMenuOpen(false)}
          >
            <ShoppingCart className="h-5 w-5" />
            {mounted && itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            )}
          </Link>
          )}

          {showMarketplaceChrome && !isAdmin && !isSeller && (
            <Link
              href="/wishlist"
              className="relative inline-flex items-center gap-1.5 rounded-lg border-2 border-primary bg-white px-2.5 py-1.5 text-sm font-semibold text-primary transition hover:bg-primary/10 md:px-3"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="relative inline-flex">
                <Heart className="h-4 w-4" />
                {mounted && wishlistCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                    {wishlistCount > 9 ? "9+" : wishlistCount}
                  </span>
                )}
              </span>
              <span className="hidden sm:inline">Wish list</span>
            </Link>
          )}

          <Button variant="ghost" size="icon" asChild className="md:hidden">
            <Link href={user ? getDashboardLink() : "/login"}>
              {isAdmin ? <Shield className="h-5 w-5 text-red-500" /> : <User className="h-5 w-5" />}
            </Link>
          </Button>
        </div>
      </div>

      {showMarketplaceChrome && (
      <nav className="border-t border-[#ececec] bg-white">
        <div className="w-full overflow-x-auto px-3 md:px-4">
          <div className="flex min-w-max items-center gap-0.5 py-1">
            <button
              type="button"
              onClick={() => {
                setMenuPanel(null);
                setIsMenuOpen((open) => !open);
              }}
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-bold text-[#1d2a2f] hover:bg-[#f7f7f7]"
              aria-expanded={isMenuOpen}
            >
              <Menu className="h-5 w-5" />
              All
            </button>
            {STORE_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className="whitespace-nowrap rounded-md px-2.5 py-1.5 text-sm font-medium text-[#4a5861] hover:bg-[#f7f7f7]"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
      )}
      {allMenu}
    </header>
  );
}
