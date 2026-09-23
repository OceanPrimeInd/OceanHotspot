// @ts-nocheck
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { EmptyState } from "@/components/ui/empty-state";
import { formatPrice } from "@/lib/utils";
import { getPlaceholderSvg } from "@/lib/productPlaceholders";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Package,
  ShieldCheck,
  LogIn,
} from "lucide-react";
import { isShopOpen } from "@/config/shop";
import { CheckoutClosedPlaceholder } from "@/components/shop/CheckoutClosedPlaceholder";

const Cart = () => {
  const { items, removeItem, updateQuantity, clearCart, total } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleCheckout = () => {
    router.push("/cart-checkout");
  };

  if (!isShopOpen()) {
    return <CheckoutClosedPlaceholder />;
  }

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container py-12">
          <EmptyState
            preset="cart"
            secondaryActionLabel="Continue Shopping"
            secondaryActionHref="/"
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-4xl py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-headline flex items-center gap-2">
            <ShoppingCart className="h-6 w-6" />
            Your Cart ({items.length} {items.length === 1 ? "item" : "items"})
          </h1>
          <Button variant="ghost" size="sm" onClick={clearCart}>
            Clear Cart
          </Button>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-3 space-y-4">
            {items.map((item) => {
              const itemVat = item.vat_treatment === "plus_vat"
                ? item.price * ((item.vat_rate ?? 20) / 100)
                : item.vat_treatment === "vat_included"
                ? item.price - item.price / (1 + (item.vat_rate ?? 20) / 100)
                : 0;
              const itemNetPrice = item.vat_treatment === "vat_included" ? item.price / (1 + (item.vat_rate ?? 20) / 100) : item.price;
              const itemTotal = (itemNetPrice + itemVat) * item.quantity;

              return (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 rounded-xl border border-border bg-card"
                >
                  {/* Image */}
                  <Link href={`/product/${item.id}`} className="flex-shrink-0">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-24 h-24 object-cover rounded-lg border"
                      />
                    ) : getPlaceholderSvg(item.title) ? (
                      <div className="w-24 h-24 rounded-lg overflow-hidden">
                        {getPlaceholderSvg(item.title)}
                      </div>
                    ) : (
                      <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center">
                        <Package className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/product/${item.id}`}
                      className="font-medium text-headline hover:text-primary line-clamp-2"
                    >
                      {item.title}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatPrice(item.currency, item.price)}
                      {item.vat_treatment === "plus_vat" && ` + VAT (${formatPrice(item.currency, itemVat)})`}
                      {item.vat_treatment === "vat_included" && " inc. VAT"}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-3">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>Decrease quantity</TooltipContent>
                      </Tooltip>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>Increase quantity</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>

                  {/* Price & Remove */}
                  <div className="flex flex-col items-end justify-between">
                    <span className="font-semibold text-primary">
                      {formatPrice(item.currency, itemTotal)}
                    </span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Remove from cart</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-border bg-card p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

              <div className="space-y-2 mb-4">
                {items.map((item) => {
                  const itemVat = item.vat_treatment === "plus_vat"
                    ? item.price * ((item.vat_rate ?? 20) / 100)
                    : item.vat_treatment === "vat_included"
                    ? item.price - item.price / (1 + (item.vat_rate ?? 20) / 100)
                    : 0;
                  const itemNetPrice = item.vat_treatment === "vat_included" ? item.price / (1 + (item.vat_rate ?? 20) / 100) : item.price;
                  return (
                    <div key={item.id} className="flex justify-between text-sm gap-2">
                      <span className="truncate min-w-0">
                        {item.title} x{item.quantity}
                      </span>
                      <span className="whitespace-nowrap shrink-0">
                        {formatPrice(item.currency, (itemNetPrice + itemVat) * item.quantity)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-border pt-4 mb-6">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-primary">
                    {formatPrice(items[0]?.currency, total)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Including VAT where applicable
                </p>
              </div>

              <Button
                variant="o42Primary"
                className="w-full h-12"
                onClick={handleCheckout}
              >
                <>
                  Continue to Checkout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              </Button>

              {/* Trust Badges */}
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-green-500" />
                  <span>Secure card payment via Stripe</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Cart;
