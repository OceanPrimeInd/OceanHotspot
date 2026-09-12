// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getAdminNavItems } from "@/config/adminNavItems";
import { formatPrice } from "@/lib/utils";
import {
  Loader2,
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  Truck,
  DollarSign,
} from "lucide-react";

interface Return {
  id: string;
  order_id: string;
  buyer_id: string;
  seller_id: string;
  reason: string;
  description: string | null;
  status: string;
  refund_amount: number | null;
  tracking_number: string | null;
  admin_notes: string | null;
  created_at: string;
  approved_at: string | null;
  shipped_at: string | null;
  received_at: string | null;
  refunded_at: string | null;
  order?: {
    order_number: string;
    total_amount: number;
    currency: string;
  } | null;
  buyer_name?: string;
  buyer_email?: string;
  seller_name?: string;
  seller_email?: string;
}

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  requested: { label: "Requested", variant: "secondary" },
  approved: { label: "Approved", variant: "default" },
  rejected: { label: "Rejected", variant: "destructive" },
  shipped_back: { label: "Shipped Back", variant: "default" },
  received: { label: "Received", variant: "default" },
  refunded: { label: "Refunded", variant: "default" },
};

const AdminReturns = () => {
  const { isAdmin, loading } = useAdminCheck();
  const router = useRouter();
  const { toast } = useToast();
  const [returns, setReturns] = useState<Return[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState("requested");
  const [selectedReturn, setSelectedReturn] = useState<Return | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!isAdmin) {
      router.push("/admin/login");
      return;
    }
    fetchReturns();
  }, [isAdmin, loading, router]);

  const fetchReturns = async () => {
    const { data } = await supabase
      .from("returns")
      .select("*, orders(order_number, total_amount, currency)")
      .order("created_at", { ascending: false });

    const returnsData = data || [];
    const buyerIds = returnsData.map((r) => r.buyer_id).filter(Boolean);
    const sellerIds = returnsData.map((r) => r.seller_id).filter(Boolean);
    const profileIds = Array.from(new Set([...buyerIds, ...sellerIds]));

    const { data: profiles } = profileIds.length
      ? await supabase
          .from("profiles")
          .select("id, email, full_name, company_name, trading_name")
          .in("id", profileIds)
      : { data: [] as Array<{ id: string; email: string | null; full_name: string | null; company_name: string | null; trading_name: string | null }> };

    const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

    const formattedReturns = returnsData.map((ret) => {
      const buyerProfile = profileMap.get(ret.buyer_id);
      const sellerProfile = profileMap.get(ret.seller_id);
      return {
        ...ret,
        order: ret.orders as Return["order"],
        buyer_name:
          buyerProfile?.full_name ||
          buyerProfile?.company_name ||
          buyerProfile?.trading_name ||
          buyerProfile?.email ||
          "Unknown",
        buyer_email: buyerProfile?.email || "Unknown",
        seller_name:
          sellerProfile?.full_name ||
          sellerProfile?.company_name ||
          sellerProfile?.trading_name ||
          sellerProfile?.email ||
          "Unknown",
        seller_email: sellerProfile?.email || "Unknown",
      } as Return;
    });

    setReturns(formattedReturns);
    setLoadingData(false);
  };

  const updateReturnStatus = async (status: string, additionalData: Record<string, unknown> = {}) => {
    if (!selectedReturn) return;
    setProcessing(true);

    // For refunds, call the process-refund edge function to process via Stripe
    if (status === "refunded") {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const response = await supabase.functions.invoke("process-refund", {
          body: {
            return_id: selectedReturn.id,
            refund_amount: parseFloat(refundAmount),
            admin_notes: adminNotes || selectedReturn.admin_notes,
          },
        });

        if (response.error) {
          toast({
            title: "Refund Failed",
            description: response.error.message || "Failed to process refund via Stripe",
            variant: "destructive",
          });
          setProcessing(false);
          return;
        }

        const result = response.data;
        if (result?.error) {
          toast({
            title: "Refund Failed",
            description: result.error,
            variant: "destructive",
          });
          setProcessing(false);
          return;
        }

        toast({ title: "Refund Processed", description: "Refund has been processed via Stripe and buyer has been notified by email." });
        setSelectedReturn(null);
        setAdminNotes("");
        setRefundAmount("");
        setProcessing(false);
        fetchReturns();
        return;
      } catch (err: any) {
        toast({
          title: "Error",
          description: err.message || "Failed to process refund",
          variant: "destructive",
        });
        setProcessing(false);
        return;
      }
    }

    // For non-refund status updates, update database directly
    const updateData: Record<string, unknown> = {
      status,
      admin_notes: adminNotes || selectedReturn.admin_notes,
      ...additionalData,
    };

    if (status === "approved") {
      updateData.approved_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("returns")
      .update(updateData)
      .eq("id", selectedReturn.id);

    setProcessing(false);

    if (error) {
      toast({ title: "Error", description: "Failed to update return status", variant: "destructive" });
      return;
    }

    toast({ title: "Success", description: `Return ${status} successfully` });
    setSelectedReturn(null);
    setAdminNotes("");
    setRefundAmount("");
    fetchReturns();
  };

  const filteredReturns = returns.filter((ret) => {
    if (activeTab === "requested") return ret.status === "requested";
    if (activeTab === "in_progress") return ["approved", "shipped_back", "received"].includes(ret.status);
    if (activeTab === "completed") return ["refunded", "rejected"].includes(ret.status);
    return true;
  });

  const {
    paginatedItems,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    goToPage,
  } = usePagination(filteredReturns, { pageSize: 10 });

  const requestedCount = returns.filter(r => r.status === "requested").length;

  if (loading || loadingData) {
    return (
      <DashboardLayout sidebarItems={getAdminNavItems({ returns: requestedCount })} sidebarTitle="Ocean Hotspot Admin">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={getAdminNavItems({ returns: requestedCount })} sidebarTitle="Ocean Hotspot Admin">
      <div className="p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Returns Management</h1>
          <p className="text-base text-muted-foreground">
            Process and track product returns
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="requested" className="gap-2">
              <Clock className="h-4 w-4" />
              Requested ({returns.filter(r => r.status === "requested").length})
            </TabsTrigger>
            <TabsTrigger value="in_progress" className="gap-2">
              <Truck className="h-4 w-4" />
              In Progress ({returns.filter(r => ["approved", "shipped_back", "received"].includes(r.status)).length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Completed ({returns.filter(r => ["refunded", "rejected"].includes(r.status)).length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {filteredReturns.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center">
                <RotateCcw className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-foreground text-lg mb-2">No returns found</h3>
                <p className="text-base text-muted-foreground">No returns in this category</p>
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-card overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold text-foreground">Order</TableHead>
                      <TableHead className="font-semibold text-foreground">Buyer</TableHead>
                      <TableHead className="font-semibold text-foreground">Seller</TableHead>
                      <TableHead className="font-semibold text-foreground">Reason</TableHead>
                      <TableHead className="font-semibold text-foreground">Status</TableHead>
                      <TableHead className="font-semibold text-foreground">Refund</TableHead>
                      <TableHead className="font-semibold text-foreground">Created</TableHead>
                      <TableHead className="font-semibold text-foreground text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedItems.map((ret) => {
                      const statusConfig = STATUS_CONFIG[ret.status] || STATUS_CONFIG.requested;
                      return (
                        <TableRow key={ret.id} className="hover:bg-muted/30">
                          <TableCell className="text-foreground">
                            <div className="text-sm font-medium">
                              {ret.order?.order_number || `${ret.order_id.slice(0, 8)}...`}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {ret.order
                                ? formatPrice(ret.order.currency, ret.order.total_amount)
                                : "Amount unavailable"}
                            </div>
                          </TableCell>
                          <TableCell className="text-foreground">
                            <div className="text-sm font-medium truncate">
                              {ret.buyer_name || "Unknown"}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {ret.buyer_email || "No email"}
                            </div>
                          </TableCell>
                          <TableCell className="text-foreground">
                            <div className="text-sm font-medium truncate">
                              {ret.seller_name || "Unknown"}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {ret.seller_email || "No email"}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium text-foreground max-w-[200px] truncate">
                            {ret.reason}
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                          </TableCell>
                          <TableCell className="text-foreground">
                            {ret.refund_amount !== null
                              ? formatPrice(ret.order?.currency, ret.refund_amount)
                              : "—"}
                          </TableCell>
                          <TableCell className="text-foreground">
                            {new Date(ret.created_at).toLocaleDateString("en-GB")}
                          </TableCell>
                          <TableCell className="text-right">
                            {ret.status !== "refunded" && ret.status !== "rejected" && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedReturn(ret);
                                  setAdminNotes(ret.admin_notes || "");
                                  setRefundAmount(ret.refund_amount?.toString() || "");
                                }}
                              >
                                Process
                              </Button>
                            )}
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

        {/* Process Return Dialog */}
        <Dialog open={!!selectedReturn} onOpenChange={() => setSelectedReturn(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Process Return</DialogTitle>
              <DialogDescription>Update the return status and add notes.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <p className="text-base font-medium mb-1">Current Status:</p>
                <Badge variant={STATUS_CONFIG[selectedReturn?.status || "requested"]?.variant}>
                  {STATUS_CONFIG[selectedReturn?.status || "requested"]?.label}
                </Badge>
              </div>

              <div>
                <p className="text-base font-medium mb-1">Order:</p>
                <p className="text-base text-muted-foreground">
                  {selectedReturn?.order?.order_number ||
                    (selectedReturn?.order_id ? `${selectedReturn.order_id.slice(0, 8)}...` : "—")}
                  {selectedReturn?.order
                    ? ` • ${formatPrice(selectedReturn.order.currency, selectedReturn.order.total_amount)}`
                    : ""}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-base font-medium mb-1">Buyer:</p>
                  <p className="text-base text-muted-foreground">
                    {selectedReturn?.buyer_name || "Unknown"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedReturn?.buyer_email || "No email"}
                  </p>
                </div>
                <div>
                  <p className="text-base font-medium mb-1">Seller:</p>
                  <p className="text-base text-muted-foreground">
                    {selectedReturn?.seller_name || "Unknown"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedReturn?.seller_email || "No email"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-base font-medium mb-1">Reason:</p>
                <p className="text-base text-muted-foreground">{selectedReturn?.reason}</p>
              </div>

              {(selectedReturn?.status === "received" || selectedReturn?.status === "approved") && (
                <div>
                  <p className="text-base font-medium mb-1">Refund Amount (£):</p>
                  <Input
                    type="number"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    placeholder="Enter refund amount"
                    className="text-base"
                  />
                </div>
              )}

              <div>
                <p className="text-base font-medium mb-1">Admin Notes:</p>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this return..."
                  rows={3}
                  className="text-base"
                />
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              {selectedReturn?.status === "requested" && (
                <>
                  <Button variant="outline" onClick={() => updateReturnStatus("approved")} disabled={processing}>
                    <CheckCircle className="mr-1 h-4 w-4" />
                    Approve
                  </Button>
                  <Button variant="destructive" onClick={() => updateReturnStatus("rejected")} disabled={processing}>
                    <XCircle className="mr-1 h-4 w-4" />
                    Reject
                  </Button>
                </>
              )}
              {selectedReturn?.status === "approved" && (
                <Button variant="outline" onClick={() => updateReturnStatus("shipped_back")} disabled={processing}>
                  <Truck className="mr-1 h-4 w-4" />
                  Mark Shipped
                </Button>
              )}
              {selectedReturn?.status === "shipped_back" && (
                <Button variant="outline" onClick={() => updateReturnStatus("received")} disabled={processing}>
                  <Package className="mr-1 h-4 w-4" />
                  Mark Received
                </Button>
              )}
              {selectedReturn?.status === "received" && (
                <Button onClick={() => updateReturnStatus("refunded")} disabled={processing || !refundAmount}>
                  <DollarSign className="mr-1 h-4 w-4" />
                  Issue Refund
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default AdminReturns;
