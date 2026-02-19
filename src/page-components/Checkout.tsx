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
import { Loader2, ArrowLeft, ShieldCheck, CreditCard, Package } from "lucide-react";

interface Product {
  id: string;
  seller_id: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  image_url: string | null;
  vat_treatment: string | null;
}

const Checkout = () => {
  const { productId } = useParams<{ productId: string }>();
  const router = useRouter();
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Form fields
  const [buyerName, setBuyerName] = useState(profile?.full_name || "");
  const [buyerEmail, setBuyerEmail] = useState(profile?.email || user?.email || "");
  const [buyerPhone, setBuyerPhone] = useState(profile?.phone || "");
  const [shippingAddress, setShippingAddress] = useState("");

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

  const calculateVAT = () => {
    if (!product) return 0;
    return product.vat_treatment === "plus_vat" ? product.price * 0.2 : 0;
  };

  const calculateTotal = () => {
    if (!product) return 0;
    return product.price + calculateVAT();
  };

  const handleCheckout = async () => {
    if (!product) return;

    // Validation
    if (!buyerName.trim() || !buyerEmail.trim()) {
      toast({ title: "Please fill in required fields", variant: "destructive" });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(buyerEmail)) {
      toast({ title: "Please enter a valid email", variant: "destructive" });
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
          buyerPhone: buyerPhone.trim() || null,
          shippingAddress: shippingAddress.trim() || null,
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
                ) : (
                  <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <h3 className="font-medium">{product.title}</h3>
                  <p className="text-sm text-muted-foreground">Qty: 1</p>
                </div>
              </div>

              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatPrice(product.currency, product.price)}</span>
                </div>
                {calculateVAT() > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>VAT (20%)</span>
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

              {/* Trust Badges */}
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
                  <Label htmlFor="phone">Phone (Optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    placeholder="+44 123 456 7890"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Shipping Address</Label>
                  <Textarea
                    id="address"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Enter your shipping address..."
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Seller will contact you to confirm shipping details
                  </p>
                </div>

                <Button
                  onClick={handleCheckout}
                  disabled={processing}
                  variant="o42Primary"
                  className="w-full h-12"
                >
                  {processing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Proceed to Payment
                    </>
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

export default Checkout;
