// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useParams } from "next/navigation";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/utils";
import { CheckCircle2, Package, ArrowRight, Loader2 } from "lucide-react";

interface OrderDetails {
  id: string;
  order_number: string;
  total_amount: number;
  currency: string;
  buyer_email: string;
  status: string;
}

const OrderConfirmation = () => {
  const searchParams = useSearchParams();
  const { orderId: orderIdParam } = useParams<{ orderId: string }>();
  const orderId = searchParams.get("order_id") || orderIdParam || null;
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const confirmAndFetch = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      const sessionId = searchParams.get("session_id");

      // If we have a Stripe session ID, confirm payment via edge function
      if (sessionId) {
        try {
          await supabase.functions.invoke("confirm-payment", {
            body: { session_id: sessionId, order_id: orderId },
          });
        } catch (err) {
          console.error("confirm-payment error:", err);
        }
      }

      // Fetch the order (should now be updated to "paid")
      const { data } = await supabase
        .from("orders")
        .select("id, order_number, total_amount, currency, buyer_email, status")
        .eq("id", orderId)
        .single();

      if (data) {
        setOrder(data);
      }
      setLoading(false);
    };

    confirmAndFetch();
  }, [orderId, searchParams]);

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
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <Button asChild>
            <Link href="/browse">Continue Shopping</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const isPaid = order.status === "paid" || order.status === "processing";

  return (
    <Layout>
      <div className="container max-w-2xl py-12">
        <div className="text-center animate-slide-up">
          {/* Success Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>

          <h1 className="text-3xl font-bold text-headline mb-2">
            {isPaid ? "Order Confirmed!" : "Order Received"}
          </h1>
          <p className="text-muted-foreground mb-8">
            {isPaid 
              ? "Your payment was successful. The seller has been notified."
              : "Your order is being processed. You'll receive a confirmation email shortly."
            }
          </p>

          {/* Order Details Card */}
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

          {/* What's Next */}
          <div className="rounded-xl border border-border bg-muted/30 p-6 text-left mb-8">
            <h3 className="font-semibold mb-3">What happens next?</h3>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="font-semibold text-foreground">1.</span>
                The seller will review and prepare your order
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground">2.</span>
                You'll receive shipping details and tracking information
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground">3.</span>
                Confirm receipt when your order arrives
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground">4.</span>
                Payment is released to the seller after confirmation
              </li>
            </ol>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="o42Primary" asChild>
              <Link href="/my-orders">
                View My Orders
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/browse">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrderConfirmation;
