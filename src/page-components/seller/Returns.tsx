// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getSellerNavItems } from "@/config/sellerNavItems";
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
}

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  requested: { label: "Requested", variant: "secondary" },
  approved: { label: "Approved", variant: "default" },
  rejected: { label: "Rejected", variant: "destructive" },
  shipped_back: { label: "Shipped Back", variant: "default" },
  received: { label: "Received", variant: "default" },
  refunded: { label: "Refunded", variant: "default" },
};

const SellerReturns = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [returns, setReturns] = useState<Return[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedReturn, setSelectedReturn] = useState<Return | null>(null);
  const [sellerNotes, setSellerNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    if (profile && !profile.is_seller) {
      router.push("/");
      return;
    }
    if (profile?.is_seller) {
      fetchReturns();
    }
  }, [user, profile, authLoading, router]);

  const fetchReturns = async () => {
    const { data } = await supabase
      .from("returns")
      .select("*, orders(order_number, total_amount, currency)")
      .eq("seller_id", user!.id)
      .order("created_at", { ascending: false });

    const returnsData = data || [];
    const buyerIds = returnsData.map((r) => r.buyer_id).filter(Boolean);

    const { data: profiles } = buyerIds.length
      ? await supabase
          .from("profiles")
          .select("id, email, full_name")
          .in("id", buyerIds)
      : { data: [] as Array<{ id: string; email: string | null; full_name: string | null }> };

    const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

    const formattedReturns = returnsData.map((ret) => {
      const buyerProfile = profileMap.get(ret.buyer_id);
      return {
        ...ret,
        order: ret.orders as Return["order"],
        buyer_name: buyerProfile?.full_name || buyerProfile?.email || "Unknown",
        buyer_email: buyerProfile?.email || "Unknown",
      } as Return;
    });

    setReturns(formattedReturns);
    setLoadingData(false);
  };

  const filteredReturns = returns.filter((ret) => {
    if (activeTab === "pending")
      return ["requested", "approved", "shipped_back"].includes(ret.status);
    if (activeTab === "completed")
      return ["received", "refunded", "rejected"].includes(ret.status);
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

  const pendingCount = returns.filter((r) =>
    ["requested", "approved", "shipped_back"].includes(r.status)
  ).length;

  if (authLoading || loadingData) {
    return (
      <DashboardLayout
        sidebarItems={getSellerNavItems({ orders: pendingCount })}
        sidebarTitle="Seller Dashboard"
      >
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      sidebarItems={getSellerNavItems({ orders: pendingCount })}
      sidebarTitle="Seller Dashboard"
    >
      <div className="p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Returns & Refunds
          </h1>
          <p className="text-base text-muted-foreground">
            View and track return requests from your customers
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="h-4 w-4" />
              Pending ({pendingCount})
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Completed (
              {returns.filter((r) =>
                ["received", "refunded", "rejected"].includes(r.status)
              ).length}
              )
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {filteredReturns.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center">
                <RotateCcw className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-foreground text-lg mb-2">
                  No returns found
                </h3>
                <p className="text-base text-muted-foreground">
                  No returns in this category
                </p>
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-card overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold text-foreground">
                        Order
                      </TableHead>
                      <TableHead className="font-semibold text-foreground">
                        Customer
                      </TableHead>
                      <TableHead className="font-semibold text-foreground">
                        Reason
                      </TableHead>
                      <TableHead className="font-semibold text-foreground">
                        Status
                      </TableHead>
                      <TableHead className="font-semibold text-foreground">
                        Tracking
                      </TableHead>
                      <TableHead className="font-semibold text-foreground">
                        Refund
                      </TableHead>
                      <TableHead className="font-semibold text-foreground">
                        Date
                      </TableHead>
                      <TableHead className="font-semibold text-foreground text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedItems.map((ret) => {
                      const statusConfig =
                        STATUS_CONFIG[ret.status] || STATUS_CONFIG.requested;
                      return (
                        <TableRow key={ret.id} className="hover:bg-muted/30">
                          <TableCell className="text-foreground">
                            <div className="text-sm font-medium">
                              {ret.order?.order_number ||
                                `${ret.order_id.slice(0, 8)}...`}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {ret.order
                                ? formatPrice(
                                    ret.order.currency,
                                    ret.order.total_amount
                                  )
                                : "—"}
                            </div>
                          </TableCell>
                          <TableCell className="text-foreground">
                            <div className="text-sm font-medium truncate">
                              {ret.buyer_name}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium text-foreground max-w-[200px] truncate">
                            {ret.reason}
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusConfig.variant}>
                              {statusConfig.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-foreground text-sm">
                            {ret.tracking_number || "—"}
                          </TableCell>
                          <TableCell className="text-foreground">
                            {ret.refund_amount !== null
                              ? formatPrice(
                                  ret.order?.currency,
                                  ret.refund_amount
                                )
                              : "—"}
                          </TableCell>
                          <TableCell className="text-foreground">
                            {new Date(ret.created_at).toLocaleDateString(
                              "en-GB"
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedReturn(ret);
                                setSellerNotes("");
                              }}
                            >
                              View
                            </Button>
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

        {/* Return Details Dialog */}
        <Dialog
          open={!!selectedReturn}
          onOpenChange={() => setSelectedReturn(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Return Details</DialogTitle>
              <DialogDescription>
                View the return request details and status.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <p className="text-base font-medium">Status:</p>
                <Badge
                  variant={
                    STATUS_CONFIG[selectedReturn?.status || "requested"]
                      ?.variant
                  }
                >
                  {
                    STATUS_CONFIG[selectedReturn?.status || "requested"]
                      ?.label
                  }
                </Badge>
              </div>

              <div>
                <p className="text-base font-medium mb-1">Order:</p>
                <p className="text-base text-muted-foreground">
                  {selectedReturn?.order?.order_number ||
                    (selectedReturn?.order_id
                      ? `${selectedReturn.order_id.slice(0, 8)}...`
                      : "—")}
                  {selectedReturn?.order
                    ? ` — ${formatPrice(
                        selectedReturn.order.currency,
                        selectedReturn.order.total_amount
                      )}`
                    : ""}
                </p>
              </div>

              <div>
                <p className="text-base font-medium mb-1">Customer:</p>
                <p className="text-base text-muted-foreground">
                  {selectedReturn?.buyer_name}
                </p>
              </div>

              <div>
                <p className="text-base font-medium mb-1">Reason:</p>
                <p className="text-base text-muted-foreground">
                  {selectedReturn?.reason}
                </p>
                {selectedReturn?.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedReturn.description}
                  </p>
                )}
              </div>

              {selectedReturn?.tracking_number && (
                <div>
                  <p className="text-base font-medium mb-1">
                    Return Tracking:
                  </p>
                  <p className="text-base text-muted-foreground">
                    {selectedReturn.tracking_number}
                  </p>
                </div>
              )}

              {selectedReturn?.refund_amount !== null &&
                selectedReturn?.refund_amount !== undefined && (
                  <div>
                    <p className="text-base font-medium mb-1">
                      Refund Amount:
                    </p>
                    <p className="text-base text-green-600 font-medium">
                      {formatPrice(
                        selectedReturn.order?.currency,
                        selectedReturn.refund_amount
                      )}
                    </p>
                  </div>
                )}

              {selectedReturn?.admin_notes && (
                <div>
                  <p className="text-base font-medium mb-1">Admin Notes:</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedReturn.admin_notes}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground border-t pt-3">
                <span>
                  Requested:{" "}
                  {new Date(
                    selectedReturn?.created_at || ""
                  ).toLocaleDateString("en-GB")}
                </span>
                {selectedReturn?.approved_at && (
                  <span>
                    Approved:{" "}
                    {new Date(selectedReturn.approved_at).toLocaleDateString(
                      "en-GB"
                    )}
                  </span>
                )}
                {selectedReturn?.shipped_at && (
                  <span>
                    Shipped Back:{" "}
                    {new Date(selectedReturn.shipped_at).toLocaleDateString(
                      "en-GB"
                    )}
                  </span>
                )}
                {selectedReturn?.received_at && (
                  <span>
                    Received:{" "}
                    {new Date(selectedReturn.received_at).toLocaleDateString(
                      "en-GB"
                    )}
                  </span>
                )}
                {selectedReturn?.refunded_at && (
                  <span>
                    Refunded:{" "}
                    {new Date(selectedReturn.refunded_at).toLocaleDateString(
                      "en-GB"
                    )}
                  </span>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setSelectedReturn(null)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default SellerReturns;
