// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getAdminNavItems } from "@/config/adminNavItems";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
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
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { StatCard } from "@/components/dashboard/StatCard";
import { getStatusInfo } from "@/config/productStatus";
import {
  Loader2,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  EyeOff,
  AlertTriangle,
} from "lucide-react";

interface Product {
  id: string;
  title: string;
  brand: string | null;
  price: number;
  pricing_type: string | null;
  currency: string | null;
  image_url: string | null;
  status: string | null;
  admin_notes: string | null;
  created_at: string | null;
  submitted_at: string | null;
  seller_id: string;
  profiles?: {
    company_name: string | null;
    email: string | null;
  };
}

const AdminProducts = () => {
  const { isAdmin, loading } = useAdminCheck();
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState("pending_review");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectProductId, setRejectProductId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!isAdmin) {
      router.push("/admin/login");
      return;
    }
    fetchProducts();
  }, [isAdmin, loading, router]);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .or("is_deleted.is.null,is_deleted.eq.false")
      .order("submitted_at", { ascending: false, nullsFirst: false });

    if (error) {
      setProducts([]);
      setLoadingData(false);
      return;
    }

    const productList = (data || []) as Product[];

    // Fetch seller profiles separately (products.seller_id references auth.users, not profiles)
    const sellerIds = [...new Set(productList.map((p) => p.seller_id))];
    if (sellerIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, company_name, email")
        .in("id", sellerIds);

      if (profiles) {
        const profileMap = new Map(profiles.map((p) => [p.id, p]));
        productList.forEach((product) => {
          const profile = profileMap.get(product.seller_id);
          if (profile) {
            product.profiles = {
              company_name: profile.company_name,
              email: profile.email,
            };
          }
        });
      }
    }

    setProducts(productList);
    setLoadingData(false);
  };

  const approveProduct = async (productId: string) => {
    const { error } = await supabase
      .from("products")
      .update({
        status: "active",
        is_published: true,
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
        admin_notes: null,
      })
      .eq("id", productId);

    if (error) {
      toast({ title: "Error", description: "Failed to approve product", variant: "destructive" });
      return;
    }
    toast({ title: "Approved", description: "Product is now live and visible to buyers." });
    fetchProducts();
  };

  const rejectProduct = async () => {
    if (!rejectProductId || !rejectReason.trim()) {
      toast({ title: "Error", description: "Please provide a reason for rejection", variant: "destructive" });
      return;
    }

    const { error } = await supabase
      .from("products")
      .update({
        status: "rejected",
        is_published: false,
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
        admin_notes: rejectReason.trim(),
      })
      .eq("id", rejectProductId);

    if (error) {
      toast({ title: "Error", description: "Failed to reject product", variant: "destructive" });
      return;
    }
    toast({ title: "Rejected", description: "Seller has been notified with your feedback." });
    setRejectDialogOpen(false);
    setRejectProductId(null);
    setRejectReason("");
    fetchProducts();
  };

  const deactivateProduct = async (productId: string) => {
    const { error } = await supabase
      .from("products")
      .update({
        status: "inactive",
        is_published: false,
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", productId);

    if (error) {
      toast({ title: "Error", description: "Failed to deactivate product", variant: "destructive" });
      return;
    }
    toast({ title: "Deactivated", description: "Product has been taken offline." });
    fetchProducts();
  };

  const filteredProducts = products.filter((p) => {
    if (activeTab === "all") return true;
    if (activeTab === "pending_review") return p.status === "pending_review";
    if (activeTab === "active") return p.status === "active";
    if (activeTab === "rejected") return p.status === "rejected";
    if (activeTab === "inactive") return p.status === "inactive";
    return true;
  });

  const {
    paginatedItems,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    goToPage,
  } = usePagination(filteredProducts, { pageSize: 10 });

  const counts = {
    all: products.length,
    pending_review: products.filter((p) => p.status === "pending_review").length,
    active: products.filter((p) => p.status === "active").length,
    rejected: products.filter((p) => p.status === "rejected").length,
    inactive: products.filter((p) => p.status === "inactive").length,
  };

  const navItems = getAdminNavItems({ products: counts.pending_review });

  if (loading || loadingData) {
    return (
      <DashboardLayout sidebarItems={navItems} sidebarTitle="Ocean Hotspot Admin">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={navItems} sidebarTitle="Ocean Hotspot Admin">
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-1">Product Management</h1>
          <p className="text-sm text-muted-foreground">
            Review and approve seller product listings before they go live
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Pending Review"
            value={counts.pending_review}
            icon={Clock}
            variant={counts.pending_review > 0 ? "warning" : "default"}
          />
          <StatCard title="Active Products" value={counts.active} icon={CheckCircle} variant="success" />
          <StatCard
            title="Rejected"
            value={counts.rejected}
            icon={XCircle}
            variant={counts.rejected > 0 ? "danger" : "default"}
          />
          <StatCard title="Total Listings" value={counts.all} icon={Package} variant="default" />
        </div>

        {/* Tabs + Table */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 flex-wrap h-auto gap-1">
            <TabsTrigger value="pending_review" className="gap-1">
              <Clock className="h-3.5 w-3.5" />
              Pending ({counts.pending_review})
            </TabsTrigger>
            <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
            <TabsTrigger value="active">Active ({counts.active})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({counts.rejected})</TabsTrigger>
            <TabsTrigger value="inactive">Inactive ({counts.inactive})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {filteredProducts.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center">
                <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-foreground text-lg mb-2">No products found</h3>
                <p className="text-sm text-muted-foreground">
                  {activeTab === "pending_review"
                    ? "No products are waiting for review"
                    : "No products in this category"}
                </p>
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-card overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold text-foreground w-14">Image</TableHead>
                      <TableHead className="font-semibold text-foreground">Product</TableHead>
                      <TableHead className="font-semibold text-foreground">Seller</TableHead>
                      <TableHead className="font-semibold text-foreground">Price</TableHead>
                      <TableHead className="font-semibold text-foreground">Status</TableHead>
                      <TableHead className="font-semibold text-foreground">Submitted</TableHead>
                      <TableHead className="font-semibold text-foreground text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedItems.map((product) => {
                      const statusInfo = getStatusInfo(product.status);
                      const sellerName = product.profiles?.company_name || product.profiles?.email || "Unknown Seller";
                      return (
                        <TableRow key={product.id} className="hover:bg-muted/30">
                          <TableCell>
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.title}
                                className="w-10 h-10 object-cover rounded border bg-white"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded border bg-muted flex items-center justify-center">
                                <Package className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-foreground line-clamp-1">{product.title}</p>
                              {product.brand && (
                                <p className="text-xs text-muted-foreground">{product.brand}</p>
                              )}
                              {product.status === "rejected" && product.admin_notes && (
                                <div className="flex items-center gap-1 mt-1">
                                  <AlertTriangle className="h-3 w-3 text-red-500 flex-shrink-0" />
                                  <p className="text-xs text-red-600 line-clamp-1">{product.admin_notes}</p>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-foreground text-sm">{sellerName}</TableCell>
                          <TableCell className="text-foreground text-sm">
                            {product.pricing_type === "poa"
                              ? "POA"
                              : product.pricing_type === "contact_us"
                              ? "Contact Us"
                              : product.pricing_type === "coming_soon"
                              ? "Coming Soon"
                              : product.price > 0
                              ? `${product.currency === "GBP" || !product.currency ? "£" : product.currency}${product.price.toLocaleString()}`
                              : "—"}
                          </TableCell>
                          <TableCell>
                            <Badge className={`${statusInfo.color} border text-xs`}>
                              {statusInfo.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-foreground text-sm">
                            {(product.submitted_at || product.created_at)
                              ? new Date(product.submitted_at || product.created_at!).toLocaleDateString("en-GB")
                              : "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-1 justify-end">
                              {product.status === "pending_review" && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-green-600 border-green-600 hover:bg-green-50 h-8"
                                    onClick={() => approveProduct(product.id)}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-destructive border-destructive hover:bg-destructive/10 h-8"
                                    onClick={() => {
                                      setRejectProductId(product.id);
                                      setRejectReason("");
                                      setRejectDialogOpen(true);
                                    }}
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </>
                              )}

                              {product.status === "active" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8"
                                  onClick={() => deactivateProduct(product.id)}
                                >
                                  <EyeOff className="h-4 w-4 mr-1" />
                                  Deactivate
                                </Button>
                              )}

                              {product.status === "inactive" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-600 border-green-600 hover:bg-green-50 h-8"
                                  onClick={() => approveProduct(product.id)}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Activate
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
          </TabsContent>
        </Tabs>
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Product</DialogTitle>
            <DialogDescription>
              Provide a reason for rejection. The seller will see this feedback and can resubmit after making changes.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Reason for rejection (e.g., missing product details, incorrect category, poor image quality...)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={rejectProduct}
              disabled={!rejectReason.trim()}
            >
              Reject Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminProducts;
