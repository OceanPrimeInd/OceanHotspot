// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getBuyerNavItems } from "@/config/buyerNavItems";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase/client";
import {
  Loader2,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
} from "lucide-react";

interface Order {
  id: string;
  order_number: string;
  seller_id: string;
  status: string;
  total_amount: number;
  currency: string;
  created_at: string;
  shipped_at: string | null;
  delivered_at: string | null;
  buyer_confirmed_at: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending_payment: { label: "Pending Payment", color: "bg-yellow-100 text-yellow-800", icon: <Clock className="h-4 w-4" /> },
  paid: { label: "Paid", color: "bg-blue-100 text-blue-800", icon: <CheckCircle2 className="h-4 w-4" /> },
  processing: { label: "Processing", color: "bg-purple-100 text-purple-800", icon: <Package className="h-4 w-4" /> },
  shipped: { label: "Shipped", color: "bg-cyan-100 text-cyan-800", icon: <Truck className="h-4 w-4" /> },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-800", icon: <CheckCircle2 className="h-4 w-4" /> },
  completed: { label: "Completed", color: "bg-emerald-100 text-emerald-800", icon: <CheckCircle2 className="h-4 w-4" /> },
  cancelled: { label: "Cancelled", color: "bg-gray-100 text-gray-800", icon: <AlertCircle className="h-4 w-4" /> },
  refunded: { label: "Refunded", color: "bg-red-100 text-red-800", icon: <AlertCircle className="h-4 w-4" /> },
  disputed: { label: "Disputed", color: "bg-orange-100 text-orange-800", icon: <AlertCircle className="h-4 w-4" /> },
};

const BuyerOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    const fetchOrders = async () => {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("buyer_id", user.id)
        .order("created_at", { ascending: false });

      setOrders(data || []);
      setLoading(false);
    };

    fetchOrders();
  }, [user, authLoading, router]);

  const confirmReceipt = async (orderId: string) => {
    await supabase
      .from("orders")
      .update({
        status: "completed",
        buyer_confirmed_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    // Refresh orders
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("buyer_id", user!.id)
      .order("created_at", { ascending: false });

    setOrders(data || []);
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout sidebarItems={getBuyerNavItems()} sidebarTitle="My Account">
        <div className="container flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={getBuyerNavItems()} sidebarTitle="My Account">
      <div className="container py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-headline">My Orders</h1>
          <p className="text-sm text-muted-foreground">
            Track your purchases and order history
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-headline mb-2">No orders yet</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Start browsing to find great maritime products.
            </p>
            <Button variant="o42Primary" asChild>
              <Link href="/browse">Browse Products</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending_payment;

              return (
                <div
                  key={order.id}
                  className="rounded-lg border border-border bg-card p-5 shadow-card"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-headline">
                          {order.order_number}
                        </h3>
                        <Badge className={statusConfig.color}>
                          {statusConfig.icon}
                          <span className="ml-1">{statusConfig.label}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Ordered on{" "}
                        {new Date(order.created_at).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-bold text-headline">
                        {formatPrice(order.currency, order.total_amount)}
                      </p>

                      <div className="mt-3 flex gap-2 justify-end">
                        {order.status === "delivered" && !order.buyer_confirmed_at && (
                          <Button
                            size="sm"
                            variant="o42Primary"
                            onClick={() => confirmReceipt(order.id)}
                          >
                            <CheckCircle2 className="mr-1 h-4 w-4" />
                            Confirm Receipt
                          </Button>
                        )}
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/orders/${order.id}`}>View Details</Link>
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  {(order.shipped_at || order.delivered_at) && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex gap-6 text-xs text-muted-foreground">
                        {order.shipped_at && (
                          <span className="flex items-center gap-1">
                            <Truck className="h-3 w-3" />
                            Shipped: {new Date(order.shipped_at).toLocaleDateString("en-GB")}
                          </span>
                        )}
                        {order.delivered_at && (
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Delivered: {new Date(order.delivered_at).toLocaleDateString("en-GB")}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BuyerOrders;
