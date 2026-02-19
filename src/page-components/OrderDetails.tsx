// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getBuyerNavItems } from "@/config/buyerNavItems";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { formatPrice } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, ArrowLeft, Package, Truck, CheckCircle2, XCircle, RotateCcw } from "lucide-react";

interface OrderItem {
  id: string;
  product_id: string;
  product_title: string;
  product_image_url: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  vat_rate: number | null;
}

interface OrderDetailsData {
  id: string;
  order_number: string;
  status: string | null;
  total_amount: number;
  subtotal: number;
  vat_amount: number | null;
  shipping_cost: number | null;
  currency: string | null;
  created_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  buyer_email: string;
  buyer_name: string | null;
  buyer_id: string | null;
  shipping_address: unknown | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending_payment: { label: "Pending Payment", color: "bg-yellow-100 text-yellow-800" },
  paid: { label: "Paid", color: "bg-blue-100 text-blue-800" },
  processing: { label: "Processing", color: "bg-purple-100 text-purple-800" },
  shipped: { label: "Shipped", color: "bg-cyan-100 text-cyan-800" },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-800" },
  completed: { label: "Completed", color: "bg-emerald-100 text-emerald-800" },
  cancelled: { label: "Cancelled", color: "bg-gray-100 text-gray-800" },
  refunded: { label: "Refunded", color: "bg-red-100 text-red-800" },
  disputed: { label: "Disputed", color: "bg-orange-100 text-orange-800" },
};

const OrderDetails = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [order, setOrder] = useState<OrderDetailsData | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notAuthorized, setNotAuthorized] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    if (!orderId) {
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      const { data: orderData, error } = await supabase
        .from("orders")
        .select(
          "id, order_number, status, total_amount, subtotal, vat_amount, shipping_cost, currency, created_at, shipped_at, delivered_at, buyer_email, buyer_name, buyer_id, shipping_address",
        )
        .eq("id", orderId)
        .maybeSingle();

      if (error || !orderData) {
        setLoading(false);
        return;
      }

      if (orderData.buyer_id && orderData.buyer_id !== user.id && orderData.buyer_email !== user.email) {
        setNotAuthorized(true);
        setLoading(false);
        return;
      }

      setOrder(orderData as OrderDetailsData);

      const { data: itemsData } = await supabase
        .from("order_items")
        .select("id, product_id, product_title, product_image_url, quantity, unit_price, total_price, vat_rate")
        .eq("order_id", orderId)
        .order("created_at", { ascending: true });

      setItems(itemsData || []);
      setLoading(false);
    };

    fetchOrder();
  }, [authLoading, user, orderId, router]);

  const handleCancelOrder = async () => {
    if (!orderId) return;
    setCancelling(true);

    try {
      const response = await supabase.functions.invoke("cancel-order", {
        body: {
          order_id: orderId,
          reason: cancelReason || "Cancelled by buyer",
        },
      });

      if (response.error) {
        toast({
          title: "Cancellation Failed",
          description: response.error.message || "Failed to cancel order",
          variant: "destructive",
        });
        setCancelling(false);
        return;
      }

      const result = response.data;
      if (result?.error) {
        toast({
          title: "Cancellation Failed",
          description: result.error,
          variant: "destructive",
        });
        setCancelling(false);
        return;
      }

      toast({
        title: "Order Cancelled",
        description: "Your order has been cancelled and a full refund has been initiated. You will receive a confirmation email.",
      });

      setShowCancelDialog(false);
      setCancelReason("");
      setCancelling(false);

      // Refresh order data
      setOrder((prev) => prev ? { ...prev, status: "cancelled" } : prev);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
      setCancelling(false);
    }
  };

  // Determine which action buttons to show
  const canCancel = order && ["paid", "processing"].includes(order.status || "");
  const canRequestReturn = order && ["delivered", "completed"].includes(order.status || "");

  if (authLoading || loading) {
    return (
      <DashboardLayout sidebarItems={getBuyerNavItems()} sidebarTitle="My Account">
        <div className="container flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (notAuthorized) {
    return (
      <DashboardLayout sidebarItems={getBuyerNavItems()} sidebarTitle="My Account">
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            This order is not associated with your account.
          </p>
          <Button variant="o42Primary" asChild>
            <Link href="/my-orders">Back to My Orders</Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  if (!order) {
    return (
      <DashboardLayout sidebarItems={getBuyerNavItems()} sidebarTitle="My Account">
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <Button variant="o42Primary" asChild>
            <Link href="/my-orders">Back to My Orders</Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const statusKey = order.status || "pending_payment";
  const statusConfig = STATUS_CONFIG[statusKey] || STATUS_CONFIG.pending_payment;
  const currency = order.currency || "GBP";
  const formatAddress = (addr: unknown): string | null => {
    if (!addr) return null;
    if (typeof addr === "string") return addr;
    if (typeof addr === "object") {
      const a = addr as Record<string, string>;
      return [a.address, a.street, a.city, a.state, a.postcode, a.postal_code, a.country]
        .filter(Boolean)
        .join(", ");
    }
    return null;
  };
  const shippingAddress = formatAddress(order.shipping_address);

  return (
    <DashboardLayout sidebarItems={getBuyerNavItems()} sidebarTitle="My Account">
      <div className="container max-w-4xl py-12">
        <Link
          href="/my-orders"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to My Orders
        </Link>

        <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-headline">Order {order.order_number}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Placed on{" "}
                {order.created_at
                  ? new Date(order.created_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "-"}
              </p>
            </div>
            <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
              <h2 className="font-semibold text-foreground">Order Summary</h2>
              <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(currency, order.subtotal)}</span>
                </div>
                {order.vat_amount !== null && (
                  <div className="flex justify-between">
                    <span>VAT</span>
                    <span>{formatPrice(currency, order.vat_amount)}</span>
                  </div>
                )}
                {order.shipping_cost !== null && (
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{formatPrice(currency, order.shipping_cost)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-foreground">
                  <span>Total</span>
                  <span>{formatPrice(currency, order.total_amount)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
              <h2 className="font-semibold text-foreground">Buyer Details</h2>
              <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                <div>{order.buyer_name || "Guest"}</div>
                <div>{order.buyer_email}</div>
                {shippingAddress && (
                  <div className="whitespace-pre-line">{shippingAddress}</div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="font-semibold text-foreground mb-3">Items</h2>
            {items.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center">
                <Package className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  Item details will appear here once they are available.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 rounded-xl border border-border bg-background p-4"
                  >
                    {item.product_image_url ? (
                      <img
                        src={item.product_image_url}
                        alt={item.product_title}
                        className="h-16 w-16 rounded-lg object-cover border"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground line-clamp-2">{item.product_title}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right text-sm font-semibold text-foreground">
                      {formatPrice(currency, item.total_price)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {(order.shipped_at || order.delivered_at) && (
            <div className="mt-8 rounded-xl border border-border/60 bg-muted/30 p-4">
              <h2 className="font-semibold text-foreground mb-3">Shipping Updates</h2>
              <div className="space-y-2 text-sm text-muted-foreground">
                {order.shipped_at && (
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    Shipped: {new Date(order.shipped_at).toLocaleDateString("en-GB")}
                  </div>
                )}
                {order.delivered_at && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Delivered: {new Date(order.delivered_at).toLocaleDateString("en-GB")}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {(canCancel || canRequestReturn) && (
            <div className="mt-8 rounded-xl border border-border/60 bg-muted/30 p-4">
              <h2 className="font-semibold text-foreground mb-3">Need Help?</h2>
              <div className="flex flex-wrap gap-3">
                {canCancel && (
                  <Button
                    variant="destructive"
                    onClick={() => setShowCancelDialog(true)}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancel Order
                  </Button>
                )}
                {canRequestReturn && (
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/my-returns?orderId=${orderId}`)}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Request Return
                  </Button>
                )}
              </div>
              {canCancel && (
                <p className="text-xs text-muted-foreground mt-3">
                  You can cancel your order before it has been shipped. A full refund will be processed to your original payment method.
                </p>
              )}
              {canRequestReturn && (
                <p className="text-xs text-muted-foreground mt-3">
                  If you received a damaged, wrong, or defective item, you can request a return within 14 days of delivery.
                </p>
              )}
            </div>
          )}

          {/* Cancelled/Refunded info */}
          {order.status === "cancelled" && (
            <div className="mt-8 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 p-4">
              <h2 className="font-semibold text-red-800 dark:text-red-300 mb-2">Order Cancelled</h2>
              <p className="text-sm text-red-700 dark:text-red-400">
                This order has been cancelled. A full refund has been initiated to your original payment method.
                Please allow 5-10 business days for the refund to appear.
              </p>
            </div>
          )}

          {order.status === "refunded" && (
            <div className="mt-8 rounded-xl border border-green-200 bg-green-50 dark:bg-green-950/20 p-4">
              <h2 className="font-semibold text-green-800 dark:text-green-300 mb-2">Refund Processed</h2>
              <p className="text-sm text-green-700 dark:text-green-400">
                A refund has been processed for this order. Please allow 5-10 business days for it to appear on your statement.
              </p>
            </div>
          )}
        </div>

        {/* Cancel Order Dialog */}
        <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Order</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel order {order.order_number}? A full refund of{" "}
                <strong>{formatPrice(currency, order.total_amount)}</strong> will be processed to your original payment method.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <label className="text-sm font-medium">Reason for cancellation (optional)</label>
              <Textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Tell us why you're cancelling..."
                rows={3}
              />
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowCancelDialog(false)} disabled={cancelling}>
                Keep Order
              </Button>
              <Button variant="destructive" onClick={handleCancelOrder} disabled={cancelling}>
                {cancelling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Cancel Order & Refund
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default OrderDetails;
