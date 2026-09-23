// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/utils";
import { getPlaceholderSvg } from "@/lib/productPlaceholders";
import { Loader2, ShieldCheck, CreditCard, Package } from "lucide-react";
import { trackAnalyticsEvent } from "@/lib/analytics";
import { isShopOpen } from "@/config/shop";
import { CheckoutClosedPlaceholder } from "@/components/shop/CheckoutClosedPlaceholder";

const paymentTier = "card" as const;

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const CartCheckout = () => {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const { items, total, clearCart } = useCart();
  const { toast } = useToast();

  if (!isShopOpen()) {
    return <CheckoutClosedPlaceholder />;
  }

  const [processing, setProcessing] = useState(false);

  // Form fields
  const [buyerName, setBuyerName] = useState(profile?.full_name || "");
  const [buyerEmail, setBuyerEmail] = useState(profile?.email || user?.email || "");
  const [buyerPhone, setBuyerPhone] = useState(profile?.phone || "");
  const [shippingAddress, setShippingAddress] = useState("");
  const [createAccount, setCreateAccount] = useState(true);

  // Track if checkout is in progress to prevent redirect
  const [checkoutInitiated, setCheckoutInitiated] = useState(false);

  // Redirect to cart if empty (but not during checkout)
  useEffect(() => {
    if (items.length === 0 && !checkoutInitiated) {
      router.push("/cart");
    }
  }, [items.length, router, checkoutInitiated]);

  useEffect(() => {
    if (items.length === 0) return;
    trackAnalyticsEvent("checkout_view", {
      userId: user?.id,
      metadata: { item_count: items.length, cart_total: total },
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onLeave = () => {
      if (checkoutInitiated || items.length === 0) return;
      trackAnalyticsEvent("checkout_abandon", {
        userId: user?.id,
        metadata: { item_count: items.length, stage: "cart_checkout_form" },
      });
    };
    window.addEventListener("pagehide", onLeave);
    return () => window.removeEventListener("pagehide", onLeave);
  }, [checkoutInitiated, items.length, user?.id]);

  useEffect(() => {
    if (profile) {
      setBuyerName(profile.full_name || "");
      setBuyerEmail(profile.email || user?.email || "");
      setBuyerPhone(profile.phone || "");
    }
  }, [profile, user]);

  // Group items by seller
  const itemsBySeller = items.reduce((acc, item) => {
    if (!acc[item.seller_id]) {
      acc[item.seller_id] = [];
    }
    acc[item.seller_id].push(item);
    return acc;
  }, {} as Record<string, typeof items>);

  const normalizeUKPhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) return "";
    if (digits.startsWith("44")) return `+${digits}`;
    if (digits.startsWith("0")) return `+44${digits.slice(1)}`;
    return `+44${digits}`;
  };

  const isValidUKPostcode = (value: string) => {
    const trimmed = value.trim();
    return /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i.test(trimmed);
  };

  const getShippingPostcode = (value: string) => {
    const match = value.match(/[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}/i);
    return match ? match[0].trim() : "";
  };


  const handleCheckout = async () => {
    if (items.length === 0) return;

    if (!buyerName.trim() || !buyerEmail.trim() || !buyerPhone.trim() || !shippingAddress.trim()) {
      toast({ title: "All required fields must be filled", variant: "destructive" });
      return;
    }

    const postcode = getShippingPostcode(shippingAddress);
    if (!postcode || !isValidUKPostcode(postcode)) {
      toast({ title: "Invalid UK postcode", description: "Please include a valid UK postcode in the shipping address, such as SW1A 1AA or M12 6AE.", variant: "destructive" });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(buyerEmail)) {
      toast({ title: "Please enter a valid email", variant: "destructive" });
      return;
    }
    const normalizedPhone = normalizeUKPhone(buyerPhone);
    if (!normalizedPhone || normalizedPhone.length < 11) {
      toast({ title: "Please enter a valid UK phone number", variant: "destructive" });
      return;
    }

    setProcessing(true);

    try {
      setCheckoutInitiated(true);
      trackAnalyticsEvent("checkout_start", {
        userId: user?.id,
        metadata: { item_count: items.length, cart_total: total },
      });

      const { data, error } = await supabase.functions.invoke("create-cart-checkout", {
        body: {
          cartItems: items.map(item => ({
            productId: item.id,
            quantity: item.quantity,
          })),
          buyerId: user?.id || null,
          buyerEmail: buyerEmail.trim(),
          buyerName: buyerName.trim(),
          buyerPhone: normalizedPhone,
          shippingAddress: shippingAddress.trim() || null,
          createAccount,
          successUrl: `${window.location.origin}/order-confirmation`,
          cancelUrl: window.location.href,
        },
      });

      // FIX: Changed data.sessionUrl to data.url to match your Edge Function return
      if (error || !data?.url) {
        setCheckoutInitiated(false);
        throw new Error(error?.message || "Failed to create checkout session");
      }

      // Do not clear the cart before redirecting to Stripe.
      // The cart should stay intact until the order is confirmed on success.
      window.location.href = data.url;
      
    } catch (error) {
        console.error("Checkout error:", error);
        
        // This helps you see what the server actually said:
        const errorMessage = error instanceof Error ? error.message : "Server Error";
        
        toast({
          title: "Checkout Failed",
          description: `Debug: ${errorMessage}`, 
          variant: "destructive",
        });
        setProcessing(false);
      }
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-4xl py-12">
        {/* Breadcrumb Navigation */}
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/browse">Browse</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/cart">Cart</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Checkout</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid md:grid-cols-2 gap-8 animate-slide-up">
          {/* Order Summary */}
          <div className="order-2 md:order-1">
            <div className="rounded-xl border border-border bg-card p-6 shadow-lg">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Order Summary ({items.length} {items.length === 1 ? "item" : "items"})
              </h2>

              {/* Items list */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {items.map((item) => {
                  const itemVat = item.vat_treatment === "plus_vat"
                    ? item.price * ((item.vat_rate ?? 20) / 100)
                    : item.vat_treatment === "vat_included"
                    ? item.price - item.price / (1 + (item.vat_rate ?? 20) / 100)
                    : 0;
                  const itemNetPrice = item.vat_treatment === "vat_included" ? item.price / (1 + (item.vat_rate ?? 20) / 100) : item.price;
                  const itemTotal = (itemNetPrice + itemVat) * item.quantity;

                  return (
                    <div key={item.id} className="flex gap-3">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-16 h-16 object-cover rounded-lg border shrink-0"
                        />
                      ) : getPlaceholderSvg(item.title) ? (
                        <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                          {getPlaceholderSvg(item.title)}
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center shrink-0">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm line-clamp-2">{item.title}</h3>
                        <p className="text-xs text-muted-foreground">
                          Qty: {item.quantity}
                          {item.vat_treatment === "plus_vat" && ` · ${formatPrice(item.currency, item.price)} + VAT`}
                          {item.vat_treatment === "vat_included" && ` · ${formatPrice(item.currency, item.price)} inc. VAT`}
                        </p>
                        <p className="text-sm font-medium text-primary whitespace-nowrap">
                          {formatPrice(item.currency, itemTotal)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal (ex. VAT)</span>
                  <span>
                    {formatPrice(
                      items[0]?.currency,
                      items.reduce((sum, item) => {
                        const netPrice = item.vat_treatment === "vat_included" ? item.price / (1 + (item.vat_rate ?? 20) / 100) : item.price;
                        return sum + netPrice * item.quantity;
                      }, 0)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>VAT</span>
                  <span>
                    {formatPrice(
                      items[0]?.currency,
                      items.reduce((sum, item) => {
                        if (item.vat_treatment === "plus_vat") return sum + item.price * ((item.vat_rate ?? 20) / 100) * item.quantity;
                        if (item.vat_treatment === "vat_included") return sum + (item.price - item.price / (1 + (item.vat_rate ?? 20) / 100)) * item.quantity;
                        return sum;
                      }, 0)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span className="text-muted-foreground">Calculated later</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2 border-t border-border">
                  <span>Total</span>
                  <span className="text-primary">
                    {formatPrice(items[0]?.currency, total)}
                  </span>
                </div>
              </div>

              {/* Payment Method Badge */}
              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <ShieldCheck className="h-4 w-4 text-green-500" />
                  <span>Secure Payment via Stripe</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CreditCard className="h-4 w-4 text-primary" />
                  <span>Funds held securely until you confirm receipt</span>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="order-1 md:order-2">
            <div className="rounded-xl border border-border bg-card p-6 shadow-lg">
              <h2 className="text-lg font-semibold mb-4">Your Details</h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    placeholder="john@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    placeholder="+44 7700 900123"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Shipping Address *</Label>
                  <Textarea
                    id="address"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Flat 3, 22 High Street, Bristol, BS1 4AA"
                    rows={4}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Please include your full delivery address and a valid UK postcode.
                  </p>
                </div>

                <Button
                  onClick={handleCheckout}
                  disabled={processing}
                  variant="o42Primary"
                  className="w-full h-12"
                >
                  {processing ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing...</>
                  ) : (
                    <><CreditCard className="mr-2 h-4 w-4" />Pay {formatPrice(items[0]?.currency, total)}</>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CartCheckout;
