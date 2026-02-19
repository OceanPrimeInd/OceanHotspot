// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
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
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getAdminNavItems } from "@/config/adminNavItems";
import { formatPrice } from "@/lib/utils";
import {
  Loader2,
  AlertTriangle,
  CheckCircle,
  Clock,
  MessageSquare,
  User,
  Store,
} from "lucide-react";

interface Dispute {
  id: string;
  order_id: string;
  buyer_id: string;
  seller_id: string;
  reason: string;
  description: string | null;
  status: string;
  buyer_evidence: unknown;
  seller_evidence: unknown;
  resolution_notes: string | null;
  created_at: string;
  resolved_at: string | null;
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
  open: { label: "Open", variant: "destructive" },
  under_review: { label: "Under Review", variant: "secondary" },
  resolved_buyer: { label: "Resolved (Buyer)", variant: "default" },
  resolved_seller: { label: "Resolved (Seller)", variant: "default" },
  closed: { label: "Closed", variant: "outline" },
};

const AdminDisputes = () => {
  const { isAdmin, loading } = useAdminCheck();
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState("open");
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!isAdmin) {
      router.push("/");
      return;
    }
    fetchDisputes();
  }, [isAdmin, loading, router]);

  const fetchDisputes = async () => {
    const { data } = await supabase
      .from("disputes")
      .select("*, orders(order_number, total_amount, currency)")
      .order("created_at", { ascending: false });

    const disputesData = data || [];
    const buyerIds = disputesData.map((d) => d.buyer_id).filter(Boolean);
    const sellerIds = disputesData.map((d) => d.seller_id).filter(Boolean);
    const profileIds = Array.from(new Set([...buyerIds, ...sellerIds]));

    const { data: profiles } = profileIds.length
      ? await supabase
          .from("profiles")
          .select("id, email, full_name, company_name, trading_name")
          .in("id", profileIds)
      : { data: [] as Array<{ id: string; email: string | null; full_name: string | null; company_name: string | null; trading_name: string | null }> };

    const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

    const formattedDisputes = disputesData.map((dispute) => {
      const buyerProfile = profileMap.get(dispute.buyer_id);
      const sellerProfile = profileMap.get(dispute.seller_id);
      return {
        ...dispute,
        order: dispute.orders as Dispute["order"],
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
      } as Dispute;
    });

    setDisputes(formattedDisputes);
    setLoadingData(false);
  };

  const resolveDispute = async (resolution: "resolved_buyer" | "resolved_seller" | "closed") => {
    if (!selectedDispute) return;
    setResolving(true);

    const { error } = await supabase
      .from("disputes")
      .update({
        status: resolution,
        resolution_notes: resolutionNotes,
        resolved_at: new Date().toISOString(),
        resolved_by: user?.id,
      })
      .eq("id", selectedDispute.id);

    setResolving(false);

    if (error) {
      toast({ title: "Error", description: "Failed to resolve dispute", variant: "destructive" });
      return;
    }

    toast({ title: "Success", description: "Dispute resolved successfully" });
    setSelectedDispute(null);
    setResolutionNotes("");
    fetchDisputes();
  };

  const filteredDisputes = disputes.filter((dispute) => {
    if (activeTab === "open") return dispute.status === "open";
    if (activeTab === "under_review") return dispute.status === "under_review";
    if (activeTab === "resolved") return ["resolved_buyer", "resolved_seller", "closed"].includes(dispute.status);
    return true;
  });

  const {
    paginatedItems,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    goToPage,
  } = usePagination(filteredDisputes, { pageSize: 10 });

  const openCount = disputes.filter(d => d.status === "open").length;

  if (loading || loadingData) {
    return (
      <DashboardLayout sidebarItems={getAdminNavItems({ disputes: openCount })} sidebarTitle="Ocean Hotspot Admin">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={getAdminNavItems({ disputes: openCount })} sidebarTitle="Ocean Hotspot Admin">
      <div className="p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Dispute Resolution</h1>
          <p className="text-base text-muted-foreground">
            Review and resolve customer disputes
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="open" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              Open ({disputes.filter(d => d.status === "open").length})
            </TabsTrigger>
            <TabsTrigger value="under_review" className="gap-2">
              <Clock className="h-4 w-4" />
              Under Review ({disputes.filter(d => d.status === "under_review").length})
            </TabsTrigger>
            <TabsTrigger value="resolved" className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Resolved ({disputes.filter(d => ["resolved_buyer", "resolved_seller", "closed"].includes(d.status)).length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {filteredDisputes.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center">
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-foreground text-lg mb-2">No disputes found</h3>
                <p className="text-base text-muted-foreground">No disputes in this category</p>
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-card overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold text-foreground">Reason</TableHead>
                      <TableHead className="font-semibold text-foreground">Order</TableHead>
                      <TableHead className="font-semibold text-foreground">Description</TableHead>
                      <TableHead className="font-semibold text-foreground">Status</TableHead>
                      <TableHead className="font-semibold text-foreground">Buyer</TableHead>
                      <TableHead className="font-semibold text-foreground">Seller</TableHead>
                      <TableHead className="font-semibold text-foreground">Created</TableHead>
                      {activeTab === "open" && (
                        <TableHead className="font-semibold text-foreground text-right">Actions</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedItems.map((dispute) => {
                      const statusConfig = STATUS_CONFIG[dispute.status] || STATUS_CONFIG.open;
                      return (
                        <TableRow key={dispute.id} className="hover:bg-muted/30">
                          <TableCell className="font-medium text-foreground max-w-[150px] truncate">
                            {dispute.reason}
                          </TableCell>
                          <TableCell className="text-foreground">
                            <div className="text-sm font-medium">
                              {dispute.order?.order_number || `${dispute.order_id.slice(0, 8)}...`}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {dispute.order
                                ? formatPrice(dispute.order.currency, dispute.order.total_amount)
                                : "Amount unavailable"}
                            </div>
                          </TableCell>
                          <TableCell className="text-foreground max-w-[200px] truncate">
                            {dispute.description || "—"}
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                          </TableCell>
                          <TableCell className="text-foreground">
                            <div className="text-sm font-medium truncate">
                              {dispute.buyer_name || "Unknown"}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {dispute.buyer_email || "No email"}
                            </div>
                          </TableCell>
                          <TableCell className="text-foreground">
                            <div className="text-sm font-medium truncate">
                              {dispute.seller_name || "Unknown"}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {dispute.seller_email || "No email"}
                            </div>
                          </TableCell>
                          <TableCell className="text-foreground">
                            {new Date(dispute.created_at).toLocaleDateString("en-GB")}
                          </TableCell>
                          {activeTab === "open" && (
                            <TableCell className="text-right">
                              <Button size="sm" onClick={() => setSelectedDispute(dispute)}>
                                Resolve
                              </Button>
                            </TableCell>
                          )}
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

        {/* Resolution Dialog */}
        <Dialog open={!!selectedDispute} onOpenChange={() => setSelectedDispute(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Resolve Dispute</DialogTitle>
              <DialogDescription>
                Review the evidence and make a decision on this dispute.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <p className="text-base font-medium mb-1">Reason:</p>
                <p className="text-base text-muted-foreground">{selectedDispute?.reason}</p>
              </div>

              <div>
                <p className="text-base font-medium mb-1">Order:</p>
                <p className="text-base text-muted-foreground">
                  {selectedDispute?.order?.order_number ||
                    (selectedDispute?.order_id ? `${selectedDispute.order_id.slice(0, 8)}...` : "—")}
                  {selectedDispute?.order
                    ? ` • ${formatPrice(selectedDispute.order.currency, selectedDispute.order.total_amount)}`
                    : ""}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-base font-medium mb-1">Buyer:</p>
                  <p className="text-base text-muted-foreground">
                    {selectedDispute?.buyer_name || "Unknown"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedDispute?.buyer_email || "No email"}
                  </p>
                </div>
                <div>
                  <p className="text-base font-medium mb-1">Seller:</p>
                  <p className="text-base text-muted-foreground">
                    {selectedDispute?.seller_name || "Unknown"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedDispute?.seller_email || "No email"}
                  </p>
                </div>
              </div>

              {selectedDispute?.description && (
                <div>
                  <p className="text-base font-medium mb-1">Description:</p>
                  <p className="text-base text-muted-foreground">{selectedDispute.description}</p>
                </div>
              )}

              <div>
                <p className="text-base font-medium mb-1">Resolution Notes:</p>
                <Textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Enter your decision and reasoning..."
                  rows={4}
                  className="text-base"
                />
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => resolveDispute("resolved_buyer")} disabled={resolving}>
                <User className="mr-1 h-4 w-4" />
                Favor Buyer
              </Button>
              <Button variant="outline" onClick={() => resolveDispute("resolved_seller")} disabled={resolving}>
                <Store className="mr-1 h-4 w-4" />
                Favor Seller
              </Button>
              <Button variant="secondary" onClick={() => resolveDispute("closed")} disabled={resolving}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default AdminDisputes;
