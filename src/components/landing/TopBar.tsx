"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ShoppingCart, ChevronDown, User, Menu, Shield, Store, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useState, useEffect, FormEvent, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";
import { formatPrice } from "@/lib/utils";
import {
  Command,
  CommandInput,
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

interface DomainLabel {
  code: string;
  label: string;
}

interface SearchSuggestion {
  id: string;
  title: string;
  price: number;
  currency: string;
}

export function TopBar() {
  const { user, profile, signOut } = useAuth();
  const { itemCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const { isAdmin } = useAdminCheck();
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<DomainLabel[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const router = useRouter();

  const isSeller = profile?.is_seller && profile?.company_name;

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from("domain_labels")
        .select("code, label")
        .limit(10);
      if (data) setCategories(data);
    };
    fetchCategories();
  }, []);

  // Debounced search suggestions
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

    if (!error && data) {
      setSuggestions(data);
    }
    setLoadingSuggestions(false);
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchSuggestions(searchQuery);
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery, fetchSuggestions]);

  const handleSuggestionClick = (productId: string) => {
    setShowSuggestions(false);
    setSearchQuery("");
    router.push(`/product/${productId}`);
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Determine dashboard link based on role
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

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-light-grey">
      <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center flex-shrink-0">
          <img
            src="/logo.png"
            alt="Ocean Hotspot"
            className="h-10 w-auto"
          />
        </Link>
        {/* Category Dropdown + Search Bar - Hidden for Admin and Seller */}
        {!isAdmin && !isSeller && (
          <div className="hidden md:flex flex-1 max-w-3xl items-center mx-4">
            {/* Unified Amazon-style search bar */}
            <div className="flex flex-1 items-stretch h-11 rounded-md border-2 border-border focus-within:border-primary transition-colors overflow-hidden bg-background">
              {/* Category Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 px-3 bg-muted hover:bg-muted/80 border-r border-border text-sm font-medium whitespace-nowrap shrink-0 transition-colors">
                    <Menu className="h-4 w-4" />
                    <span className="hidden lg:inline ml-1">All Categories</span>
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 bg-background z-50">
                  <DropdownMenuItem asChild>
                    <Link
                      href="/browse"
                      className="cursor-pointer"
                      onClick={() => router.push("/browse")}
                    >
                      All Products
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {categories.map((cat) => (
                    <DropdownMenuItem key={cat.code} asChild>
                      <Link
                        href={`/browse?domain=${encodeURIComponent(cat.code)}`}
                        className="cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault();
                          router.push(`/browse?domain=${encodeURIComponent(cat.code)}`);
                        }}
                      >
                        {cat.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Search Input + Button */}
              <form onSubmit={handleSearch} className="flex flex-1 items-stretch">
                <Popover open={showSuggestions && suggestions.length > 0} onOpenChange={setShowSuggestions}>
                  <PopoverTrigger asChild>
                    <input
                      type="text"
                      placeholder="What are you looking for?"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                      className="flex-1 w-full px-4 text-base bg-transparent focus:outline-none"
                    />
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[var(--radix-popover-trigger-width)] p-0 bg-background"
                    align="start"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                  >
                    <Command>
                      <CommandList>
                        {loadingSuggestions ? (
                          <div className="py-6 text-center text-sm text-muted-foreground">
                            Searching...
                          </div>
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
                                <Search className="mr-2 h-4 w-4 text-muted-foreground" />
                                <div className="flex-1 min-w-0">
                                  <p className="truncate">{suggestion.title}</p>
                                  <p className="text-xs text-primary font-medium">
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
                <button
                  type="submit"
                  className="px-4 bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center transition-colors shrink-0"
                >
                  <Search className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Right-side navigation - Amazon style */}
        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
          {user ? (
            <>
              {/* Account & Lists Dropdown - Role-based */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="hidden md:flex items-center gap-1 h-auto py-1 px-2">
                    <div className="text-left">
                      <p className="text-[11px] text-muted-foreground leading-tight">
                        Hello, {user.email?.split('@')[0]}
                      </p>
                      <p className="text-sm font-semibold leading-tight flex items-center gap-0.5">
                        {isAdmin && <Shield className="h-3 w-3 mr-1 text-destructive" />}
                        {isSeller && !isAdmin && <Store className="h-3 w-3 mr-1 text-primary" />}
                        Account & Lists <ChevronDown className="h-3 w-3" />
                      </p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 bg-background z-50">
                  {/* Primary Dashboard Link */}
                  <DropdownMenuItem asChild>
                    <Link href={getDashboardLink()} className="font-medium">
                      {isAdmin && <Shield className="h-4 w-4 mr-2 text-destructive" />}
                      {isSeller && !isAdmin && <Store className="h-4 w-4 mr-2 text-primary" />}
                      {getDashboardLabel()}
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  {/* Admin-specific links */}
                  {isAdmin && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/sellers">Manage Sellers</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/orders">All Orders</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/disputes">Disputes</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/users">Users</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  
                  {/* Seller-specific links (only if seller and not admin) */}
                  {isSeller && !isAdmin && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/account/settings">My Account</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/seller/orders">My Orders</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/seller/returns">Returns</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  
                  {/* Customer links - only visible to non-sellers and non-admins */}
                  {!isAdmin && !isSeller && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/my-orders">My Orders</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/my-returns">My Returns</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/my-disputes">My Disputes</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  
                  <DropdownMenuItem onClick={signOut} className="text-destructive">
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Seller quick link */}
              {isSeller && !isAdmin && (
                <Button variant="ghost" asChild className="hidden md:flex items-center h-auto py-1 px-2">
                  <Link href="/seller/dashboard">
                    <div className="text-left">
                      <p className="text-[11px] text-muted-foreground leading-tight">Seller</p>
                      <p className="text-sm font-semibold leading-tight">Dashboard</p>
                    </div>
                  </Link>
                </Button>
              )}
              
              {/* Admin quick link */}
              {isAdmin && (
                <Button variant="ghost" asChild className="hidden md:flex items-center h-auto py-1 px-2">
                  <Link href="/admin">
                    <div className="text-left">
                      <p className="text-[11px] text-muted-foreground leading-tight">Admin</p>
                      <p className="text-sm font-semibold leading-tight">Dashboard</p>
                    </div>
                  </Link>
                </Button>
              )}
            </>
          ) : (
            <>
              {/* Sign In */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="hidden md:flex items-center gap-1 h-auto py-1 px-2">
                    <div className="text-left">
                      <p className="text-[11px] text-muted-foreground leading-tight">Hello, Sign in</p>
                      <p className="text-sm font-semibold leading-tight flex items-center gap-0.5">
                        Account & Lists <ChevronDown className="h-3 w-3" />
                      </p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-4 bg-background z-50">
                  <Button variant="o42Primary" asChild className="w-full mb-3">
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <p className="text-sm text-muted-foreground text-center">
                    New customer?{" "}
                    <Link href="/join" className="text-o42-blue hover:underline font-medium">
                      Register here
                    </Link>
                  </p>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}

          {/* Become a Seller - Only for non-admin and non-sellers */}
          {!isAdmin && !isSeller && (
            <Button variant="ghost" asChild className="hidden lg:flex items-center h-auto py-1 px-2">
              <a href="/sell" target="_blank" rel="noopener noreferrer">
                <div className="text-left">
                  <p className="text-[11px] text-muted-foreground leading-tight">Start</p>
                  <p className="text-sm font-semibold leading-tight">Selling</p>
                </div>
              </a>
            </Button>
          )}

          {/* Wishlist - Only for customers (hidden for Admin and Seller) */}
          {!isAdmin && !isSeller && (
            <Link
              href="/wishlist"
              className="relative flex items-center gap-1 px-2 py-1 rounded transition-colors"
            >
              <div className="relative">
                <Heart className="h-6 w-6" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {wishlistCount > 9 ? "9+" : wishlistCount}
                  </span>
                )}
              </div>
              <span className="hidden md:block text-sm font-semibold sr-only">Wishlist</span>
            </Link>
          )}

          {/* Cart - Only for customers (hidden for Admin and Seller) */}
          {!isAdmin && !isSeller && (
            <Link
              href="/cart"
              className="relative flex items-center gap-1 px-2 py-1 rounded hover:bg-muted transition-colors"
            >
              <div className="relative">
                <ShoppingCart className="h-6 w-6" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-o42-orange text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                )}
              </div>
              <span className="hidden md:block text-sm font-semibold">Cart</span>
            </Link>
          )}

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Mobile user icon - Role-aware */}
          <Button variant="ghost" size="icon" asChild className="md:hidden">
            <Link href={user ? getDashboardLink() : "/login"}>
              {isAdmin ? (
                <Shield className="h-5 w-5 text-destructive" />
              ) : (
                <User className="h-5 w-5" />
              )}
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
