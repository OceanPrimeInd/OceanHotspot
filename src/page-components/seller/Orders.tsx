// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Clock,
  AlertCircle,
} from "lucide-react";

interface Order {
  id: string;
  order_number: string;
  buyer_name: string | null;
  buyer_email: string;
  status: string;
  total_amount: number;
  currency: string;
  created_at: string;
  shipped_at: string | null;
  delivered_at: string | null;
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

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const updateData: Record<string, unknown> = { status: newStatus };
    
    if (newStatus === "shipped") {
      updateData.shipped_at = new Date().toISOString();
    } else if (newStatus === "delivered") {
      updateData.delivered_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", orderId);

    if (error) {
      toast({ title: "Error", description: "Failed to update order.", variant: "destructive" });
    } else {
      toast({ title: "Updated", description: "Order status updated." });
      fetchOrders();
    }
  };

  const filteredOrders = filterStatus === "all" 
    ? orders 
    : orders.filter(o => o.status === filterStatus);

  const {
    paginatedItems,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    goToPage,
  } = usePagination(filteredOrders, { pageSize: 15 });

  const pendingOrdersCount = orders.filter(o => ["paid", "processing", "shipped"].includes(o.status)).length;

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
            View and manage customer orders
          </p>
        </div>

        {/* Filters */}
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

        {/* Orders Table */}
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
                  <TableHead className="font-semibold text-foreground">Status</TableHead>
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
                      <TableCell>
                        <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                      </TableCell>
                      <TableCell className="text-foreground">
                        {new Date(order.created_at).toLocaleDateString("en-GB")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          {order.status === "paid" && (
                            <Button size="sm" variant="outline" onClick={() => updateOrderStatus(order.id, "processing")}>
                              Process
                            </Button>
                          )}
                          {order.status === "processing" && (
                            <Button size="sm" variant="outline" onClick={() => updateOrderStatus(order.id, "shipped")}>
                              <Truck className="h-4 w-4" />
                            </Button>
                          )}
                          {order.status === "shipped" && (
                            <Button size="sm" variant="outline" onClick={() => updateOrderStatus(order.id, "delivered")}>
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
    </DashboardLayout>
  );
};

export default SellerOrders;
