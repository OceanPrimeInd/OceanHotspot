// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatPrice } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { usePagination } from "@/hooks/usePagination";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getAdminNavItems } from "@/config/adminNavItems";
import {
  Loader2,
  ShoppingCart,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  DollarSign,
} from "lucide-react";

interface Order {
  id: string;
  order_number: string;
  buyer_email: string;
  buyer_name: string | null;
  seller_id: string;
  seller_name?: string;
  seller_email?: string;
  status: string;
  payment_status: string | null;
  total_amount: number;
  currency: string;
  created_at: string;
  shipped_at: string | null;
  delivered_at: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending_payment: { label: "Pending Payment", variant: "secondary" },
  paid: { label: "Paid", variant: "default" },
  processing: { label: "Processing", variant: "default" },
  shipped: { label: "Shipped", variant: "default" },
  delivered: { label: "Delivered", variant: "default" },
  completed: { label: "Completed", variant: "default" },
  cancelled: { label: "Cancelled", variant: "secondary" },
  refunded: { label: "Refunded", variant: "destructive" },
  disputed: { label: "Disputed", variant: "destructive" },
};

const AdminOrders = () => {
  const { isAdmin, loading } = useAdminCheck();
  const router = useRouter();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (loading) return;
    if (!isAdmin) {
      router.push("/");
      return;
    }
    fetchOrders();
  }, [isAdmin, loading, router]);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    const ordersData = data || [];
    const sellerIds = Array.from(new Set(ordersData.map((o) => o.seller_id).filter(Boolean)));
    const { data: sellers } = sellerIds.length
      ? await supabase
          .from("profiles")
          .select("id, email, full_name, company_name, trading_name")
          .in("id", sellerIds)
      : { data: [] as Array<{ id: string; email: string | null; full_name: string | null; company_name: string | null; trading_name: string | null }> };

    const sellerMap = new Map(sellers?.map((s) => [s.id, s]) || []);

    const formattedOrders = ordersData.map((order) => {
      const seller = sellerMap.get(order.seller_id);
      return {
        ...order,
        seller_name:
          seller?.company_name ||
          seller?.trading_name ||
          seller?.full_name ||
          seller?.email ||
          "Unknown",
        seller_email: seller?.email || "Unknown",
      };
    });

    setOrders(formattedOrders);
    setLoadingData(false);
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
      toast({ title: "Error", description: "Failed to update order status", variant: "destructive" });
      return;
    }

    toast({ title: "Success", description: `Order updated to ${newStatus}` });
    fetchOrders();
  };

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return ["pending_payment", "paid", "processing"].includes(order.status);
    if (activeTab === "shipped") return order.status === "shipped";
    if (activeTab === "completed") return ["delivered", "completed"].includes(order.status);
    if (activeTab === "issues") return ["cancelled", "refunded", "disputed"].includes(order.status);
    return true;
  });

  const {
    paginatedItems,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    goToPage,
  } = usePagination(filteredOrders, { pageSize: 15 });

  const pendingCount = orders.filter(o => ["pending_payment", "paid", "processing"].includes(o.status)).length;

  if (loading || loadingData) {
    return (
      <DashboardLayout sidebarItems={getAdminNavItems({ orders: pendingCount })} sidebarTitle="Ocean Hotspot Admin">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={getAdminNavItems({ orders: pendingCount })} sidebarTitle="Ocean Hotspot Admin">
      <div className="p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Orders Management</h1>
          <p className="text-base text-muted-foreground">
            View and manage all platform orders
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 flex-wrap">
            <TabsTrigger value="all">All ({orders.length})</TabsTrigger>
            <TabsTrigger value="pending" className="gap-1">
              <Clock className="h-4 w-4" />
              Pending ({orders.filter(o => ["pending_payment", "paid", "processing"].includes(o.status)).length})
            </TabsTrigger>
            <TabsTrigger value="shipped" className="gap-1">
              <Truck className="h-4 w-4" />
              Shipped ({orders.filter(o => o.status === "shipped").length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-1">
              <CheckCircle className="h-4 w-4" />
              Completed ({orders.filter(o => ["delivered", "completed"].includes(o.status)).length})
            </TabsTrigger>
            <TabsTrigger value="issues" className="gap-1">
              <AlertTriangle className="h-4 w-4" />
              Issues ({orders.filter(o => ["cancelled", "refunded", "disputed"].includes(o.status)).length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {filteredOrders.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center">
                <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-foreground text-lg mb-2">No orders found</h3>
                <p className="text-base text-muted-foreground">No orders in this category</p>
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-card overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold text-foreground">Order #</TableHead>
                      <TableHead className="font-semibold text-foreground">Customer</TableHead>
                      <TableHead className="font-semibold text-foreground">Seller</TableHead>
                      <TableHead className="font-semibold text-foreground">Total</TableHead>
                      <TableHead className="font-semibold text-foreground">Status</TableHead>
                      <TableHead className="font-semibold text-foreground">Created</TableHead>
                      <TableHead className="font-semibold text-foreground">Shipped</TableHead>
                      <TableHead className="font-semibold text-foreground text-right">Update Status</TableHead>
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
                              <p className="text-foreground">{order.buyer_name || "—"}</p>
                              <p className="text-xs text-muted-foreground">{order.buyer_email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-foreground">{order.seller_name || "—"}</p>
                              <p className="text-xs text-muted-foreground">{order.seller_email || "—"}</p>
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
                          <TableCell className="text-foreground">
                            {order.shipped_at ? new Date(order.shipped_at).toLocaleDateString("en-GB") : "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Select
                              value={order.status}
                              onValueChange={(value) => updateOrderStatus(order.id, value)}
                            >
                              <SelectTrigger className="w-[140px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending_payment">Pending Payment</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="processing">Processing</SelectItem>
                                <SelectItem value="shipped">Shipped</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                <SelectItem value="refunded">Refunded</SelectItem>
                                <SelectItem value="disputed">Disputed</SelectItem>
                              </SelectContent>
                            </Select>
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
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminOrders;
