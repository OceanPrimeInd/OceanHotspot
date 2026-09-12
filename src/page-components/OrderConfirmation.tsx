// @ts-nocheck
"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useSearchParams, useParams } from "next/navigation";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { clearStoredCart } from "@/lib/cartStorage";
import { formatPrice } from "@/lib/utils";
import { CheckCircle2, Package, ArrowRight, Loader2 } from "lucide-react";
import { trackAnalyticsEvent } from "@/lib/analytics";

interface OrderDetails {
  id: string;
  order_number: string;
  total_amount: number;
  currency: string;
  buyer_email: string;
  status: string;
  payment_status?: string;
}

function isStripeSuccessReturn(sessionId: string | null) {
  return !!sessionId && sessionId.startsWith("cs_");
}

const OrderConfirmation = () => {
  const searchParams = useSearchParams();
  const { orderId: orderIdParam } = useParams<{ orderId: string }>();
  const { clearCart } = useCart();
  const orderId = searchParams.get("order_id") || orderIdParam || null;
  const sessionId = searchParams.get("session_id");
  const guestTokenFromUrl = searchParams.get("token");
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState<boolean | null>(null);
  const [guestToken, setGuestToken] = useState<string | null>(guestTokenFromUrl);
  const [loading, setLoading] = useState(true);
  const confirmedRef = useRef(false);

  useEffect(() => {
    const confirmAndFetch = async () => {
      if (!orderId && !sessionId) {
        setLoading(false);
        return;
      }

      if (confirmedRef.current) return;
      confirmedRef.current = true;

      if (isStripeSuccessReturn(sessionId)) {
        clearStoredCart();
        clearCart();
      }

      if (sessionId) {
        const { data: confirmData, error: confirmError } = await supabase.functions.invoke(
          "confirm-payment",
          {
            body: { session_id: sessionId, order_id: orderId },
          },
        );

        const payload = (confirmData ?? {}) as {
          success?: boolean;
          order?: OrderDetails & { guest_access_token?: string };
          error?: string;
          detail?: string;
          stripeWarning?: string;
          emailSent?: boolean;
        };

        if (payload.order) {
          clearStoredCart();
          clearCart();
          trackAnalyticsEvent("checkout_complete", {
            metadata: {
              order_id: payload.order.id,
              order_number: payload.order.order_number,
            },
          });
          setOrder(payload.order);
          setEmailSent(payload.emailSent ?? null);
          const token =
            payload.order.guest_access_token || guestTokenFromUrl || null;
          setGuestToken(token);
          if (token && orderId) {
            sessionStorage.setItem(`oh_order_token_${orderId}`, token);
          }
          if (payload.error || payload.stripeWarning) {
            setLoadError(payload.error || payload.stripeWarning || null);
          }
          setLoading(false);
          return;
        }

        if (payload.error) {
          setLoadError(payload.detail ? `${payload.error} (${payload.detail})` : payload.error);
        } else if (confirmError) {
          setLoadError(confirmError.message || "Could not confirm payment");
        }
      }

      if (orderId) {
        const { data } = await supabase
          .from("orders")
          .select("id, order_number, total_amount, currency, buyer_email, status, payment_status")
          .eq("id", orderId)
          .maybeSingle();

        if (data) {
          clearStoredCart();
          clearCart();
          setOrder(data);
          setLoading(false);
          return;
        }
      }

      setLoading(false);
    };

    confirmAndFetch();
  }, [orderId, sessionId, clearCart]);

  if (loading) {
    return (
      <Layout>
        <div className="container flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Confirming your order...</p>
        </div>
      </Layout>
    );
  }

  if (!order) {
    const paidViaStripe = isStripeSuccessReturn(sessionId);

    return (
      <Layout>
        <div className="container py-20 text-center max-w-lg mx-auto">
          {paidViaStripe ? (
            <>
              <CheckCircle2 className="mx-auto h-14 w-14 text-green-600 mb-4" />
              <h1 className="text-2xl font-bold mb-4">Payment received</h1>
              <p className="text-muted-foreground mb-2">
                Stripe completed your payment. Log in with your checkout email to see order details.
              </p>
              {orderId && (
                <p className="text-sm text-muted-foreground mb-4 font-mono">Order ref: {orderId}</p>
              )}
              {loadError && (
                <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-left">
                  {loadError}
                </p>
              )}
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-4">We could not load this order</h1>
              <p className="text-muted-foreground mb-6">
                Check your email for confirmation or open My Orders while logged in with the same
                email you used at checkout.
              </p>
            </>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {orderId && guestTokenFromUrl && (
              <Button variant="o42Primary" asChild>
                <Link href={`/orders/${orderId}?token=${encodeURIComponent(guestTokenFromUrl)}`}>
                  View order (no login)
                </Link>
              </Button>
            )}
            {orderId && !guestTokenFromUrl && (
              <Button variant="o42Primary" asChild>
                <Link href="/orders/track">Find my order</Link>
              </Button>
            )}
            <Button variant={orderId ? "outline" : "o42Primary"} asChild>
              <Link href="/my-orders">My Orders</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/browse">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const isPaid =
    order.payment_status === "paid" ||
    order.status === "paid" ||
    order.status === "processing" ||
    order.status === "shipped" ||
    order.status === "delivered" ||
    order.status === "completed";

  return (
    <Layout>
      <div className="container max-w-2xl py-12">
        <div className="text-center animate-slide-up">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>

          <h1 className="text-3xl font-bold text-headline mb-2">
            {isPaid ? "Order Confirmed!" : "Order Received"}
          </h1>
          <p className="text-muted-foreground mb-8">
            {isPaid
              ? emailSent === true
                ? "Your payment was successful. We sent a confirmation email to your inbox."
                : emailSent === false
                  ? "Your payment was successful. Email could not be sent — use the button below to view your order (no login required)."
                  : "Your payment was successful."
              : "Your order is being processed."}
          </p>

          {loadError && (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6 text-left">
              {loadError}
            </p>
          )}

          <div className="rounded-xl border border-border bg-card p-6 shadow-lg text-left mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Package className="h-6 w-6 text-primary" />
              <h2 className="text-lg font-semibold">Order Details</h2>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Number</span>
                <span className="font-mono font-semibold">{order.order_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email</span>
                <span>{order.buyer_email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="font-semibold text-primary">
                  {formatPrice(order.currency, order.total_amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className={`font-medium ${isPaid ? "text-green-600" : "text-amber-600"}`}>
                  {isPaid ? "Payment Confirmed" : "Processing"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="o42Primary" asChild>
              <Link
                href={
                  guestToken
                    ? `/orders/${order.id}?token=${encodeURIComponent(guestToken)}`
                    : `/orders/${order.id}`
                }
              >
                View this order (no login)
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/orders/track">Track with email</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/browse">Continue shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrderConfirmation;
