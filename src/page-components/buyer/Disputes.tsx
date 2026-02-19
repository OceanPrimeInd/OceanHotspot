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
  AlertTriangle,
  Clock,
  CheckCircle,
  MessageSquare,
  Plus,
} from "lucide-react";

interface Dispute {
  id: string;
  order_id: string;
  reason: string;
  description: string | null;
  status: string;
  resolution_notes: string | null;
  created_at: string;
  resolved_at: string | null;
  order?: {
    order_number: string;
    total_amount: number;
    currency: string;
    status: string;
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

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  open: { label: "Open", color: "bg-yellow-100 text-yellow-800" },
  under_review: { label: "Under Review", color: "bg-blue-100 text-blue-800" },
  resolved_buyer: { label: "Resolved (In Your Favor)", color: "bg-green-100 text-green-800" },
  resolved_seller: { label: "Resolved (Seller Favor)", color: "bg-purple-100 text-purple-800" },
  closed: { label: "Closed", color: "bg-gray-100 text-gray-800" },
};

const DISPUTE_REASONS = [
  "Item not received",
  "Item not as described",
  "Damaged item",
  "Seller unresponsive",
  "Unauthorized charge",
  "Other",
];

const BuyerDisputes = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewDispute, setShowNewDispute] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New dispute form
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
    const [disputesRes, ordersRes] = await Promise.all([
      supabase
        .from("disputes")
        .select("*, orders(order_number, total_amount, currency, status)")
        .eq("buyer_id", user!.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("orders")
        .select("*")
        .eq("buyer_id", user!.id)
        .order("created_at", { ascending: false }),
    ]);

    const disputesData = (disputesRes.data || []).map((dispute) => ({
      ...dispute,
      order: dispute.orders as Dispute["order"],
    }));
    setDisputes(disputesData);
    setOrders(ordersRes.data || []);
    setLoading(false);
  };

  const submitDispute = async () => {
    if (!selectedOrderId || !reason) return;
    setSubmitting(true);

    const order = orders.find(o => o.id === selectedOrderId);
    if (!order) {
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.from("disputes").insert({
      order_id: selectedOrderId,
      buyer_id: user!.id,
      seller_id: order.seller_id,
      initiated_by: user!.id,
      reason,
      description: description || null,
      status: "open",
    });

    setSubmitting(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to submit dispute",
        variant: "destructive",
      });
      return;
    }

    // Update order status to disputed
    await supabase
      .from("orders")
      .update({ status: "disputed" })
      .eq("id", selectedOrderId);

    toast({
      title: "Success",
      description: "Dispute submitted. Our team will review it shortly.",
    });

    setShowNewDispute(false);
    setSelectedOrderId("");
    setReason("");
    setDescription("");
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
            <h1 className="text-2xl font-bold text-headline mb-2">My Disputes</h1>
            <p className="text-muted-foreground">
              Track and manage your order disputes
            </p>
          </div>
          <Dialog open={showNewDispute} onOpenChange={setShowNewDispute}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <Plus className="mr-2 h-4 w-4" />
                Open Dispute
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Open a Dispute</DialogTitle>
                <DialogDescription>
                  If you have an issue with an order that you couldn't resolve with the seller, you can open a dispute for our team to review.
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
                      {DISPUTE_REASONS.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Description *</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the issue in detail..."
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="destructive"
                  onClick={submitDispute}
                  disabled={submitting || !selectedOrderId || !reason || !description}
                >
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Dispute
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {disputes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-headline mb-2">No disputes</h3>
            <p className="text-sm text-muted-foreground mb-6">
              You haven't opened any disputes. We hope you don't need to!
            </p>
            <Button variant="outline" asChild>
              <Link href="/my-orders">View Orders</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {disputes.map((dispute) => {
              const statusConfig = STATUS_CONFIG[dispute.status] || STATUS_CONFIG.open;
              return (
                <div
                  key={dispute.id}
                  className="rounded-lg border border-border bg-card p-5 shadow-card"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        <h3 className="font-semibold text-headline">
                          {dispute.reason}
                        </h3>
                        <Badge className={statusConfig.color}>
                          {statusConfig.label}
                        </Badge>
                      </div>

                      <div className="text-xs text-muted-foreground mb-2">
                        Order{" "}
                        {dispute.order?.order_number ||
                          `${dispute.order_id.slice(0, 8)}...`}{" "}
                        •{" "}
                        {dispute.order
                          ? formatPrice(dispute.order.currency, dispute.order.total_amount)
                          : "Amount unavailable"}
                      </div>

                      {dispute.description && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {dispute.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                        <span>Opened: {new Date(dispute.created_at).toLocaleDateString("en-GB")}</span>
                        {dispute.resolved_at && (
                          <span>Resolved: {new Date(dispute.resolved_at).toLocaleDateString("en-GB")}</span>
                        )}
                        <Link href={`/orders/${dispute.order_id}`} className="text-primary hover:underline">
                          View Order
                        </Link>
                      </div>

                      {dispute.resolution_notes && (
                        <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Resolution:</p>
                          <p className="text-sm">{dispute.resolution_notes}</p>
                        </div>
                      )}
                    </div>

                    {dispute.status === "open" && (
                      <Badge variant="outline" className="gap-1">
                        <Clock className="h-3 w-3" />
                        Awaiting Review
                      </Badge>
                    )}
                    {dispute.status === "resolved_buyer" && (
                      <CheckCircle className="h-6 w-6 text-green-500" />
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

export default BuyerDisputes;
