// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getAdminNavItems } from "@/config/adminNavItems";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Building2,
} from "lucide-react";

interface Seller {
  id: string;
  email: string | null;
  company_name: string | null;
  trading_name: string | null;
  legal_name: string | null;
  country: string | null;
  phone: string | null;
  logo_url: string | null;
  verification_status: string | null;
  verified_at: string | null;
  created_at: string | null;
  stripe_ready: boolean | null;
}

const AdminSellers = () => {
  const { isAdmin, loading } = useAdminCheck();
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    if (loading) return;
    if (!isAdmin) {
      router.push("/");
      return;
    }
    fetchSellers();
  }, [isAdmin, loading, router]);

  const fetchSellers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("is_seller", true)
      .order("created_at", { ascending: false });

    setSellers(data || []);
    setLoadingData(false);
  };

  const updateVerificationStatus = async (sellerId: string, status: "approved" | "rejected") => {
    const { error } = await supabase
      .from("profiles")
      .update({
        verification_status: status,
        verified_at: new Date().toISOString(),
        verified_by: user?.id,
      })
      .eq("id", sellerId);

    if (error) {
      toast({ title: "Error", description: "Failed to update seller status", variant: "destructive" });
      return;
    }

    toast({ title: "Success", description: `Seller ${status} successfully` });
    fetchSellers();
  };

  const filteredSellers = sellers.filter((seller) => {
    if (activeTab === "pending") return seller.verification_status === "pending" || !seller.verification_status;
    if (activeTab === "approved") return seller.verification_status === "approved";
    if (activeTab === "rejected") return seller.verification_status === "rejected";
    return true;
  });

  const {
    paginatedItems,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    goToPage,
  } = usePagination(filteredSellers, { pageSize: 10 });

  const pendingCount = sellers.filter(s => s.verification_status === "pending" || !s.verification_status).length;

  if (loading || loadingData) {
    return (
      <DashboardLayout sidebarItems={getAdminNavItems({ sellers: pendingCount })} sidebarTitle="Ocean Hotspot Admin">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={getAdminNavItems({ sellers: pendingCount })} sidebarTitle="Ocean Hotspot Admin">
      <div className="p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Seller Verification</h1>
          <p className="text-base text-muted-foreground">
            Review and verify seller accounts before they can list products
          </p>
        </div>

        {/* Verification Checklist */}
        <div className="mb-6 rounded-lg border border-border bg-card p-4">
          <h3 className="font-semibold text-foreground mb-2">Verification Checklist</h3>
          <ul className="text-sm text-foreground space-y-1">
            <li>✓ Phone number verification</li>
            <li>✓ Company registration check</li>
            <li>✓ Quality documentation review</li>
            <li>✓ Logo verification</li>
          </ul>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="h-4 w-4" />
              Pending ({sellers.filter(s => s.verification_status === "pending" || !s.verification_status).length})
            </TabsTrigger>
            <TabsTrigger value="approved" className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Approved ({sellers.filter(s => s.verification_status === "approved").length})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="gap-2">
              <XCircle className="h-4 w-4" />
              Rejected ({sellers.filter(s => s.verification_status === "rejected").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {filteredSellers.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center">
                <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-foreground text-lg mb-2">No sellers found</h3>
                <p className="text-base text-muted-foreground">No sellers in this category</p>
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-card overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold text-foreground w-12">Logo</TableHead>
                      <TableHead className="font-semibold text-foreground">Company</TableHead>
                      <TableHead className="font-semibold text-foreground">Email</TableHead>
                      <TableHead className="font-semibold text-foreground">Phone</TableHead>
                      <TableHead className="font-semibold text-foreground">Country</TableHead>
                      <TableHead className="font-semibold text-foreground">Status</TableHead>
                      <TableHead className="font-semibold text-foreground">Registered</TableHead>
                      {activeTab === "pending" && (
                        <TableHead className="font-semibold text-foreground text-right">Actions</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedItems.map((seller) => (
                      <TableRow key={seller.id} className="hover:bg-muted/30">
                        <TableCell>
                          {seller.logo_url ? (
                            <img src={seller.logo_url} alt="Logo" className="w-10 h-10 object-contain rounded border bg-white" />
                          ) : (
                            <div className="w-10 h-10 rounded border bg-muted flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">{seller.company_name || seller.trading_name || "—"}</p>
                            {seller.legal_name && seller.legal_name !== seller.company_name && (
                              <p className="text-xs text-muted-foreground">Legal: {seller.legal_name}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-foreground">{seller.email || "—"}</TableCell>
                        <TableCell className="text-foreground">{seller.phone || "—"}</TableCell>
                        <TableCell className="text-foreground">{seller.country || "—"}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Badge variant={seller.verification_status === "approved" ? "default" : seller.verification_status === "rejected" ? "destructive" : "secondary"}>
                              {seller.verification_status || "pending"}
                            </Badge>
                            {seller.stripe_ready && (
                              <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                                Stripe
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-foreground">
                          {seller.created_at ? new Date(seller.created_at).toLocaleDateString("en-GB") : "—"}
                        </TableCell>
                        {activeTab === "pending" && (
                          <TableCell className="text-right">
                            <div className="flex gap-1 justify-end">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 border-green-600 hover:bg-green-50"
                                onClick={() => updateVerificationStatus(seller.id, "approved")}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-destructive border-destructive hover:bg-destructive/10"
                                onClick={() => updateVerificationStatus(seller.id, "rejected")}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
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

export default AdminSellers;
