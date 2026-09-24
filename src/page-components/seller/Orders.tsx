// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
} from "@/components/ui/dialog";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { usePagination } from "@/hooks/usePagination";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getSellerNavItems } from "@/config/sellerNavItems";
import {
  Loader2,
  Package,
  Truck,
  CheckCircle2,
} from "lucide-react";

interface Order {
  id: string;
  order_number: string;
  buyer_name: string | null;
  buyer_email: string;
  status: string;
  total_amount: number;
  subtotal?: number | null;
  vat_amount?: number | null;
  platform_fee?: number | null;
  currency: string;
  created_at: string;
  shipped_at: string | null;
  delivered_at: string | null;
  tracking_number: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending_payment: { label: "Pending", variant: "secondary" },
  paid: { label: "Paid", variant: "default" },
  processing: { label: "Processing", variant: "default" },
  shipped: { label: "Shipped", variant: "default" },
  delivered: { label: "Delivered", variant: "default" },
  completed: { label: "Completed", variant: "default" },
  cancelled: { label: "Cancelled", variant: "secondary" },
  refunded: { label: "Refunded", variant: "destructive" },
  disputed: { label: "Disputed", variant: "destructive" },
};

const SellerOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [shipDialogOpen, setShipDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [updating, setUpdating] = useState(false);
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    if (profile && !profile.is_seller) {
      router.push("/seller/onboarding");
      return;
    }

    if (profile?.is_seller) {
      fetchOrders();
    }
  }, [user, profile, authLoading, router]);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("seller_id", user!.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error", description: "Failed to load orders.", variant: "destructive" });
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string, tracking?: string) => {
    setUpdating(true);

    const { data, error } = await supabase.functions.invoke("order-status", {
      body: {
        order_id: orderId,
        status: newStatus,
        tracking_number: tracking || null,
      },
    });

    setUpdating(false);

    if (error || data?.error) {
      toast({
        title: "Error",
        description: data?.error || error?.message || "Failed to update order.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Updated",
      description: newStatus === "shipped"
        ? "Order marked as shipped. Buyer notified by email."
        : "Order status updated.",
    });

    setShipDialogOpen(false);
    setSelectedOrderId(null);
    setTrackingNumber("");
    fetchOrders();
  };

  const openShipDialog = (orderId: string) => {
    setSelectedOrderId(orderId);
    setTrackingNumber("");
    setShipDialogOpen(true);
  };

  const filteredOrders = filterStatus === "all"
    ? orders
    : orders.filter((o) => o.status === filterStatus);

  const {
    paginatedItems,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    goToPage,
  } = usePagination(filteredOrders, { pageSize: 15 });

  const pendingOrdersCount = orders.filter((o) => ["paid", "processing", "shipped"].includes(o.status)).length;

  if (authLoading || loading) {
    return (
      <DashboardLayout sidebarItems={getSellerNavItems({ orders: pendingOrdersCount })} sidebarTitle="Seller Dashboard">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={getSellerNavItems({ orders: pendingOrdersCount })} sidebarTitle="Seller Dashboard">
      <div className="p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Order Management</h1>
          <p className="text-base text-muted-foreground mt-1">
            View orders, mark as dispatched, and add tracking numbers
          </p>
        </div>

        <div className="mb-4 flex gap-4 items-center">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="pending_payment">Pending Payment</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="disputed">Disputed</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-foreground">
            {filteredOrders.length} order{filteredOrders.length !== 1 ? "s" : ""}
          </span>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-foreground text-lg mb-2">No orders yet</h3>
            <p className="text-base text-muted-foreground">
              Orders will appear here when customers make purchases.
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold text-foreground">Order #</TableHead>
                  <TableHead className="font-semibold text-foreground">Customer</TableHead>
                  <TableHead className="font-semibold text-foreground">Total</TableHead>
                  <TableHead className="font-semibold text-foreground">Ex VAT</TableHead>
                  <TableHead className="font-semibold text-foreground">Platform fee (5%)</TableHead>
                  <TableHead className="font-semibold text-foreground">Status</TableHead>
                  <TableHead className="font-semibold text-foreground">Tracking</TableHead>
                  <TableHead className="font-semibold text-foreground">Date</TableHead>
                  <TableHead className="font-semibold text-foreground text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedItems.map((order) => {
                  const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending_payment;

                  return (
                    <TableRow key={order.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium text-foreground">{order.order_number}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-foreground">{order.buyer_name || "Guest"}</p>
                          <p className="text-xs text-muted-foreground">{order.buyer_email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        {formatPrice(order.currency, order.total_amount)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatPrice(
                          order.currency,
                          order.subtotal ?? order.total_amount - (order.vat_amount ?? 0),
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {order.platform_fee != null
                          ? formatPrice(order.currency, order.platform_fee)
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[140px] truncate">
                        {order.tracking_number || "—"}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {new Date(order.created_at).toLocaleDateString("en-GB")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          {order.status === "paid" && (
                            <Button size="sm" variant="outline" onClick={() => updateOrderStatus(order.id, "processing")} disabled={updating}>
                              Process
                            </Button>
                          )}
                          {order.status === "processing" && (
                            <Button size="sm" variant="outline" onClick={() => openShipDialog(order.id)} disabled={updating}>
                              <Truck className="h-4 w-4 mr-1" />
                              Dispatch
                            </Button>
                          )}
                          {order.status === "shipped" && (
                            <Button size="sm" variant="outline" onClick={() => updateOrderStatus(order.id, "delivered")} disabled={updating}>
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            <DataTablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={goToPage}
            />
          </div>
        )}
      </div>

      <Dialog open={shipDialogOpen} onOpenChange={setShipDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark order as dispatched</DialogTitle>
            <DialogDescription>
              Add a tracking number if you have one. The buyer will receive a dispatch email.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="tracking">Tracking number (optional)</Label>
            <Input
              id="tracking"
              placeholder="e.g. RM123456789GB"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShipDialogOpen(false)} disabled={updating}>
              Cancel
            </Button>
            <Button
              onClick={() => selectedOrderId && updateOrderStatus(selectedOrderId, "shipped", trackingNumber)}
              disabled={updating || !selectedOrderId}
            >
              {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm dispatch"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default SellerOrders;
