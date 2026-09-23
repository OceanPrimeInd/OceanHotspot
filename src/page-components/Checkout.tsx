// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/utils";
import { getPlaceholderSvg } from "@/lib/productPlaceholders";
import { Loader2, ArrowLeft, ShieldCheck, CreditCard, Package, Landmark, Phone, Copy, CheckCircle2, AlertTriangle } from "lucide-react";
import { isShopOpen } from "@/config/shop";
import { CheckoutClosedPlaceholder } from "@/components/shop/CheckoutClosedPlaceholder";

// ─── Payment Tier Logic ──────────────────────────────────────────────────────
const ESCROW_THRESHOLD = 500;   // £500
const PREMIUM_THRESHOLD = 10000; // £10,000

function getPaymentTier(totalGBP: number) {
  if (totalGBP < ESCROW_THRESHOLD) return "card" as const;
  if (totalGBP <= PREMIUM_THRESHOLD) return "escrow" as const;
  return "premium" as const;
}

const BANK_DETAILS = {
  accountName: "Ocean Hotspot Ltd",
  bank: "Barclays",
  sortCode: "20-XX-XX",
  accountNumber: "XXXXXXXX",
  iban: "GB00 BARC 2000 0000 0000 00",
};
// ─────────────────────────────────────────────────────────────────────────────

interface Product {
  id: string;
  seller_id: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  image_url: string | null;
  vat_treatment: string | null;
  vat_rate: number | null;
}

const Checkout = () => {
  const { productId } = useParams<{ productId: string }>();
  const router = useRouter();
  const { user, profile } = useAuth();
  const { toast } = useToast();

  if (!isShopOpen()) {
    return <CheckoutClosedPlaceholder />;
  }

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [bankOrderRef, setBankOrderRef] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Form fields
  const [buyerName, setBuyerName] = useState(profile?.full_name || "");
  const [buyerEmail, setBuyerEmail] = useState(profile?.email || user?.email || "");
  const [buyerPhone, setBuyerPhone] = useState(profile?.phone || "");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [postcode, setPostcode] = useState("");
  const [country, setCountry] = useState("United Kingdom");
  const [shippingAddress, setShippingAddress] = useState("");
  const [createAccount, setCreateAccount] = useState(true);
  const [showPaymentStep, setShowPaymentStep] = useState(false);

  useEffect(() => {
    const composed = [addressLine1, addressLine2, city, postcode, country].filter(Boolean).join(", ");
    setShippingAddress(composed);
  }, [addressLine1, addressLine2, city, postcode, country]);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .eq("is_published", true)
        .single();

      if (error || !data) {
        toast({ title: "Product not found", variant: "destructive" });
        router.push("/browse");
        return;
      }

      setProduct(data);
      setLoading(false);
    };

    fetchProduct();
  }, [productId, router, toast]);

  useEffect(() => {
    if (profile) {
      setBuyerName(profile.full_name || "");
      setBuyerEmail(profile.email || user?.email || "");
      setBuyerPhone(profile.phone || "");
    }
  }, [profile, user]);

  // For plus_vat: price is ex-VAT, VAT = price × rate%, total = price × (1 + rate)
  // For vat_included: price is gross (inc. VAT), VAT = price × (rate/(100+rate)), net = price / (1 + rate)
  // For vat_exempt: no VAT, total = price
  const vatRate = (product?.vat_rate ?? 20) / 100;

  const calculateVAT = () => {
    if (!product) return 0;
    if (product.vat_treatment === "plus_vat") return product.price * vatRate;
    if (product.vat_treatment === "vat_included") return product.price - product.price / (1 + vatRate);
    return 0;
  };

  const calculateNetPrice = () => {
    if (!product) return 0;
    if (product.vat_treatment === "vat_included") return product.price / (1 + vatRate);
    return product.price;
  };

  const calculateTotal = () => {
    if (!product) return 0;
    return calculateNetPrice() + calculateVAT();
  };

  const paymentTier = product ? getPaymentTier(calculateTotal()) : "card";

  const copyRef = (ref: string) => {
    navigator.clipboard.writeText(ref);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const normalizeUKPhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) return "";
    if (digits.startsWith("44")) return `+${digits}`;
    if (digits.startsWith("0")) return `+44${digits.slice(1)}`;
    return `+44${digits}`;
  };

  const isValidUKPostcode = (value: string) => /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i.test(value.trim());

  const handleBankTransferOrder = async () => {
    if (!product) return;
    if (!buyerName.trim() || !buyerEmail.trim() || !buyerPhone.trim()) {
      toast({ title: "Please fill in required fields", variant: "destructive" });
      return;
    }
    if (!addressLine1.trim() || !city.trim() || !postcode.trim()) {
      toast({ title: "Shipping address required", description: "Please add address line 1, city and postcode.", variant: "destructive" });
      return;
    }
    if (!isValidUKPostcode(postcode)) {
      toast({ title: "Invalid UK postcode", description: "Please enter a valid UK postcode such as SW1A 1AA or M12 6AE.", variant: "destructive" });
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

    // ─── Payment splitting: look up distributor for this seller ───────────────
    const total = calculateTotal();
    const PLATFORM_FEE_RATE = 0.05; // 5%

    const { data: distProduct } = await supabase
      .from("distributor_products")
      .select("distributor_id, commission_rate, distributors(id, commission_rate)")
      .eq("seller_id", product.seller_id)
      .eq("status", "active")
      .is("product_id", null) // whole-catalog partnership
      .maybeSingle();

    const distributorId = distProduct?.distributor_id ?? null;
    const distributorCommissionRate =
      distProduct?.commission_rate ?? distProduct?.distributors?.commission_rate ?? 0;
    const distributorCommission = distributorId
      ? Number((total * distributorCommissionRate / 100).toFixed(2))
      : 0;
    const platformFee = Number((total * PLATFORM_FEE_RATE).toFixed(2));
    const sellerPayout = Number((total - distributorCommission - platformFee).toFixed(2));
    // ─────────────────────────────────────────────────────────────────────────

    const { data: orderData, error: orderError } = await supabase.functions.invoke("create-bank-order", {
      body: {
        sellerId: product.seller_id,
        buyerId: user?.id || null,
        buyerEmail: buyerEmail.trim(),
        buyerName: buyerName.trim(),
        buyerPhone: normalizedPhone,
        shippingAddress: shippingAddress.trim() || null,
        createAccount,
        subtotal: calculateNetPrice(),
        vatAmount: calculateVAT(),
        totalAmount: total,
        currency: product.currency || "GBP",
        paymentStatus: "awaiting_bank_transfer",
        distributorId: distributorId,
        distributorCommission,
        platformFee,
        sellerPayout,
        item: {
          productId: product.id,
          productTitle: product.title,
          productImageUrl: product.image_url,
          unitPrice: product.price,
          quantity: 1,
          totalPrice: product.price,
          vatRate: product.vat_treatment === "plus_vat" ? (product.vat_rate ?? 20) / 100 : 0,
        },
      },
    });

    const order = orderData?.order;

    if (!orderError && order) {
      setBankOrderRef(order.order_number || order.id?.slice(0, 8).toUpperCase());
    } else {
      toast({ title: "Order Failed", description: orderError?.message || "Could not create your order. Please try again.", variant: "destructive" });
    }
    setProcessing(false);
  };

  const continueToPayment = () => {
    if (!buyerName.trim() || !buyerEmail.trim() || !buyerPhone.trim()) {
      toast({ title: "Please fill in required fields", variant: "destructive" });
      return;
    }
    if (!addressLine1.trim() || !city.trim() || !postcode.trim()) {
      toast({ title: "Shipping address required", description: "Please add address line 1, city and postcode.", variant: "destructive" });
      return;
    }
    if (!isValidUKPostcode(postcode)) {
      toast({ title: "Invalid UK postcode", description: "Please enter a valid UK postcode such as SW1A 1AA or M12 6AE.", variant: "destructive" });
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

    setShowPaymentStep(true);
  };

  const handleCheckout = async () => {
    if (!product) return;

    if (!buyerName.trim() || !buyerEmail.trim() || !buyerPhone.trim()) {
      toast({ title: "Please fill in required fields", variant: "destructive" });
      return;
    }
    if (!addressLine1.trim() || !city.trim() || !postcode.trim()) {
      toast({ title: "Shipping address required", description: "Please add address line 1, city and postcode.", variant: "destructive" });
      return;
    }
    if (!isValidUKPostcode(postcode)) {
      toast({ title: "Invalid UK postcode", description: "Please enter a valid UK postcode such as SW1A 1AA or M12 6AE.", variant: "destructive" });
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
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          productId: product.id,
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

      if (error || !data?.sessionUrl) {
        throw new Error(error?.message || "Failed to create checkout session");
      }

      // Redirect to Stripe Checkout
      window.location.href = data.sessionUrl;
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Checkout Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <Button asChild>
            <Link href="/browse">Browse Products</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-4xl py-12">
        <Link
          href={`/product/${productId}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Product
        </Link>

        <div className="grid md:grid-cols-2 gap-8 animate-slide-up">
          {/* Order Summary */}
          <div className="order-2 md:order-1">
            <div className="rounded-xl border border-border bg-card p-6 shadow-lg">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Order Summary
              </h2>

              <div className="flex gap-4 mb-6">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="w-20 h-20 object-cover rounded-lg border"
                  />
                ) : getPlaceholderSvg(product.title) ? (
                  <div className="w-20 h-20 rounded-lg overflow-hidden">
                    {getPlaceholderSvg(product.title)}
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <h3 className="font-medium">{product.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    Qty: 1
                    {product.vat_treatment === "plus_vat" && ` · ${formatPrice(product.currency, product.price)} + VAT`}
                    {product.vat_treatment === "vat_included" && ` · ${formatPrice(product.currency, product.price)} inc. VAT`}
                  </p>
                </div>
              </div>

              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal (ex. VAT)</span>
                  <span>{formatPrice(product.currency, calculateNetPrice())}</span>
                </div>
                {calculateVAT() > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>
                      VAT ({product.vat_rate ?? 20}%){product.vat_treatment === "vat_included" ? " incl." : ""}
                    </span>
                    <span>{formatPrice(product.currency, calculateVAT())}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span className="text-muted-foreground">Calculated later</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2 border-t border-border">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(product.currency, calculateTotal())}</span>
                </div>
              </div>

              {/* Payment Method Badge */}
              <div className="mt-6 pt-6 border-t border-border">
                {paymentTier === "card" && (
                  <>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <ShieldCheck className="h-4 w-4 text-green-500" />
                      <span>Secure Payment via Stripe</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CreditCard className="h-4 w-4 text-primary" />
                      <span>Funds held securely until you confirm receipt</span>
                    </div>
                  </>
                )}
                {paymentTier === "escrow" && (
                  <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-amber-800 mb-1">
                      <ShieldCheck className="h-4 w-4" />
                      Escrow Protected Transaction
                    </div>
                    <p className="text-xs text-amber-700">
                      Orders £500–£10,000 use bank transfer + Transpact escrow. Your funds are protected until you confirm receipt.
                    </p>
                  </div>
                )}
                {paymentTier === "premium" && (
                  <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-blue-800 mb-1">
                      <ShieldCheck className="h-4 w-4" />
                      Premium Secure Transaction
                    </div>
                    <p className="text-xs text-blue-700">
                      High-value orders (£10,000+) require bank transfer + escrow + phone KYC verification. Our team will contact you.
                    </p>
                  </div>
                )}
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
                    name="name"
                    autoComplete="name"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    placeholder="john@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    name="tel"
                    type="tel"
                    autoComplete="tel"
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    placeholder="+44 7123 456789"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address-line1">Address line 1 *</Label>
                  <Input
                    id="address-line1"
                    name="address-line1"
                    autoComplete="address-line1"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    placeholder="123 Harbour Street"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address-line2">Address line 2</Label>
                  <Input
                    id="address-line2"
                    name="address-line2"
                    autoComplete="address-line2"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    placeholder="Flat, suite, etc."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      name="city"
                      autoComplete="address-level2"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Southampton"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postcode">Postcode *</Label>
                    <Input
                      id="postcode"
                      name="postal-code"
                      autoComplete="postal-code"
                      value={postcode}
                      onChange={(e) => setPostcode(e.target.value)}
                      placeholder="SO14 3FJ"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    name="country"
                    autoComplete="country-name"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                </div>

                {/* ── Bank Transfer Confirmation ── */}
                {bankOrderRef ? (
                  <div className="rounded-xl border border-green-200 bg-green-50 p-5 space-y-4">
                    <div className="flex items-center gap-2 text-green-700 font-semibold">
                      <CheckCircle2 className="h-5 w-5" />
                      Order Created — Please Transfer Payment
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Your Order Ref:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-foreground">{bankOrderRef}</span>
                          <button onClick={() => copyRef(bankOrderRef)} className="text-primary hover:text-primary/80">
                            {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Amount to Transfer:</span>
                        <span className="font-bold text-primary">{formatPrice(product!.currency, calculateTotal())}</span>
                      </div>
                    </div>

                    <div className="rounded-lg bg-white border border-border p-4 text-sm space-y-1">
                      <p className="font-semibold text-foreground mb-2 flex items-center gap-2"><Landmark className="h-4 w-4 text-primary" /> Bank Transfer Details</p>
                      <div className="flex justify-between"><span className="text-muted-foreground">Account Name:</span><span>{BANK_DETAILS.accountName}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Bank:</span><span>{BANK_DETAILS.bank}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Sort Code:</span><span className="font-mono">{BANK_DETAILS.sortCode}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Account No:</span><span className="font-mono">{BANK_DETAILS.accountNumber}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">IBAN:</span><span className="font-mono text-xs">{BANK_DETAILS.iban}</span></div>
                      <div className="flex justify-between mt-2 pt-2 border-t border-border">
                        <span className="text-muted-foreground font-medium">Payment Ref:</span>
                        <span className="font-mono font-bold text-primary">{bankOrderRef}</span>
                      </div>
                    </div>

                    <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 flex items-start gap-2">
                      <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>Use <strong>Transpact escrow</strong> for added protection — both parties agree, funds released on delivery. Cost: £2.99. <a href="https://www.transpact.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">Set up escrow →</a></span>
                    </div>

                    {paymentTier === "premium" && (
                      <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-xs text-blue-800 flex items-start gap-2">
                        <Phone className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>For orders over £10,000 our team will call you to complete <strong>identity verification</strong> before funds are released. Alternatively, pay a <strong>10% refundable deposit</strong> now to reserve this item.</span>
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground text-center">
                      Your order will be confirmed within 1 business day once payment is received. You'll get a confirmation email.
                    </p>
                  </div>
                ) : paymentTier === "card" ? (
                  <Button
                    onClick={handleCheckout}
                    disabled={processing}
                    variant="o42Primary"
                    className="w-full h-12"
                  >
                    {processing ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing...</>
                    ) : (
                      <><CreditCard className="mr-2 h-4 w-4" />Proceed to Payment</>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={handleBankTransferOrder}
                    disabled={processing}
                    variant="o42Primary"
                    className="w-full h-12"
                  >
                    {processing ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating order...</>
                    ) : paymentTier === "premium" ? (
                      <><Phone className="mr-2 h-4 w-4" />Start Secure Purchase</>
                    ) : (
                      <><Landmark className="mr-2 h-4 w-4" />Pay via Bank Transfer + Escrow</>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
