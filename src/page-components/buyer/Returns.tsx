// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getBuyerNavItems } from "@/config/buyerNavItems";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  RotateCcw,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  DollarSign,
  Plus,
} from "lucide-react";

interface Return {
  id: string;
  order_id: string;
  reason: string;
  description: string | null;
  status: string;
  refund_amount: number | null;
  tracking_number: string | null;
  created_at: string;
  requested_at: string | null;
  approved_at: string | null;
  refunded_at: string | null;
  order?: {
    order_number: string;
    total_amount: number;
    currency: string;
  } | null;
}

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  currency: string;
  seller_id: string;
  status: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  requested: { label: "Requested", color: "bg-yellow-100 text-yellow-800", icon: <Clock className="h-4 w-4" /> },
  approved: { label: "Approved", color: "bg-blue-100 text-blue-800", icon: <CheckCircle className="h-4 w-4" /> },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-800", icon: <XCircle className="h-4 w-4" /> },
  shipped_back: { label: "Shipped Back", color: "bg-cyan-100 text-cyan-800", icon: <Truck className="h-4 w-4" /> },
  received: { label: "Received", color: "bg-purple-100 text-purple-800", icon: <Package className="h-4 w-4" /> },
  refunded: { label: "Refunded", color: "bg-green-100 text-green-800", icon: <DollarSign className="h-4 w-4" /> },
};

const RETURN_REASONS = [
  "Damaged in transit",
  "Wrong item received",
  "Item not as described",
  "Changed my mind",
  "Defective product",
  "Other",
];

const BuyerReturns = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [returns, setReturns] = useState<Return[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewReturn, setShowNewReturn] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [trackingNumbers, setTrackingNumbers] = useState<Record<string, string>>({});

  // New return form
  const [selectedOrderId, setSelectedOrderId] = useState(orderId || "");
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    fetchData();
  }, [user, authLoading, router]);

  const fetchData = async () => {
    const [returnsRes, ordersRes] = await Promise.all([
      supabase
        .from("returns")
        .select("*, orders(order_number, total_amount, currency)")
        .eq("buyer_id", user!.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("orders")
        .select("*")
        .eq("buyer_id", user!.id)
        .in("status", ["delivered", "completed"])
        .order("created_at", { ascending: false }),
    ]);

    const returnsData = (returnsRes.data || []).map((ret) => ({
      ...ret,
      order: ret.orders as Return["order"],
    }));
    setReturns(returnsData);
    setOrders(ordersRes.data || []);
    setLoading(false);
  };

  const submitReturn = async () => {
    if (!selectedOrderId || !reason) return;
    setSubmitting(true);

    const order = orders.find(o => o.id === selectedOrderId);
    if (!order) {
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.from("returns").insert({
      order_id: selectedOrderId,
      buyer_id: user!.id,
      seller_id: order.seller_id,
      reason,
      description: description || null,
      status: "requested",
    });

    setSubmitting(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to submit return request",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Return request submitted successfully",
    });

    setShowNewReturn(false);
    setSelectedOrderId("");
    setReason("");
    setDescription("");
    fetchData();
  };

  const updateTrackingNumber = async (returnId: string, trackingNumber: string) => {
    const { error } = await supabase
      .from("returns")
      .update({
        tracking_number: trackingNumber,
        status: "shipped_back",
        shipped_at: new Date().toISOString(),
      })
      .eq("id", returnId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update tracking number",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Tracking number added",
    });

    fetchData();
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-headline mb-2">My Returns</h1>
            <p className="text-muted-foreground">
              Track and manage your return requests
            </p>
          </div>
          <Dialog open={showNewReturn} onOpenChange={setShowNewReturn}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Request Return
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request a Return</DialogTitle>
                <DialogDescription>
                  Select an order and provide details for your return request.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Order *</Label>
                  <Select value={selectedOrderId} onValueChange={setSelectedOrderId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an order" />
                    </SelectTrigger>
                    <SelectContent>
                      {orders.map((order) => (
                        <SelectItem key={order.id} value={order.id}>
                          {order.order_number} - {formatPrice(order.currency, order.total_amount)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Reason *</Label>
                  <Select value={reason} onValueChange={setReason}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a reason" />
                    </SelectTrigger>
                    <SelectContent>
                      {RETURN_REASONS.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Additional Details</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide more details about your return..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={submitReturn}
                  disabled={submitting || !selectedOrderId || !reason}
                >
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Request
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {returns.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center">
            <RotateCcw className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-headline mb-2">No returns yet</h3>
            <p className="text-sm text-muted-foreground mb-6">
              You haven't requested any returns. If you need to return an item, click the button above.
            </p>
            <Button variant="outline" asChild>
              <Link href="/my-orders">View Orders</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {returns.map((ret) => {
              const statusConfig = STATUS_CONFIG[ret.status] || STATUS_CONFIG.requested;
              return (
                <div
                  key={ret.id}
                  className="rounded-lg border border-border bg-card p-5 shadow-card"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-headline">
                          Return Request
                        </h3>
                        <Badge className={statusConfig.color}>
                          {statusConfig.icon}
                          <span className="ml-1">{statusConfig.label}</span>
                        </Badge>
                      </div>

                      <div className="text-xs text-muted-foreground mb-2">
                        Order{" "}
                        {ret.order?.order_number || `${ret.order_id.slice(0, 8)}...`}{" "}
                        •{" "}
                        {ret.order
                          ? formatPrice(ret.order.currency, ret.order.total_amount)
                          : "Amount unavailable"}
                      </div>

                      <p className="text-sm font-medium mb-1">Reason: {ret.reason}</p>
                      {ret.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {ret.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                        <span>
                          Requested:{" "}
                          {new Date(ret.requested_at || ret.created_at).toLocaleDateString("en-GB")}
                        </span>
                        {ret.approved_at && (
                          <span>Approved: {new Date(ret.approved_at).toLocaleDateString("en-GB")}</span>
                        )}
                        {ret.refund_amount !== null && (
                          <span className="text-green-600 font-medium">
                            Refund: {formatPrice(ret.order?.currency, ret.refund_amount)}
                          </span>
                        )}
                        <Link href={`/orders/${ret.order_id}`} className="text-primary hover:underline">
                          View Order
                        </Link>
                      </div>

                      {ret.tracking_number && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Tracking: {ret.tracking_number}
                        </p>
                      )}
                    </div>

                    {ret.status === "approved" && !ret.tracking_number && (
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Tracking number"
                          className="w-40"
                          value={trackingNumbers[ret.id] || ""}
                          onChange={(e) =>
                            setTrackingNumbers((prev) => ({
                              ...prev,
                              [ret.id]: e.target.value,
                            }))
                          }
                        />
                        <Button
                          size="sm"
                          onClick={() => {
                            const tracking = trackingNumbers[ret.id];
                            if (tracking) {
                              updateTrackingNumber(ret.id, tracking);
                              setTrackingNumbers((prev) => ({ ...prev, [ret.id]: "" }));
                            }
                          }}
                        >
                          <Truck className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BuyerReturns;
