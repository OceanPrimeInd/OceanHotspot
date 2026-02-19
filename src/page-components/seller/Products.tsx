// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getSellerNavItems } from "@/config/sellerNavItems";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { StatCard } from "@/components/dashboard/StatCard";
import { getStatusInfo, isProductComplete } from "@/config/productStatus";
import {
  Loader2,
  Plus,
  Package,
  MoreHorizontal,
  Pencil,
  Send,
  EyeOff,
  Eye,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  Upload,
} from "lucide-react";

interface Product {
  id: string;
  title: string;
  brand: string | null;
  price: number;
  currency: string | null;
  image_url: string | null;
  status: string | null;
  admin_notes: string | null;
  created_at: string | null;
  submitted_at: string | null;
  is_deleted: boolean | null;
  condition: string | null;
  entity_type: string | null;
  domain_category: string | null;
  description: string | null;
  vat_treatment: string | null;
  availability_status: string | null;
  ships_from: string | null;
  shipping_cost_rule: string | null;
}

const SellerProducts = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !profile?.is_seller) {
      router.push("/seller/login");
      return;
    }
    fetchProducts();
  }, [user, profile, authLoading, router]);

  const fetchProducts = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("seller_id", user.id)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false });

    setProducts((data as Product[]) || []);
    setLoadingData(false);
  };

  const submitForReview = async (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product && !isProductComplete(product)) {
      toast({
        title: "Incomplete Product",
        description: "Please fill in all required fields before submitting for review.",
        variant: "destructive",
      });
      router.push(`/seller/products/${productId}/edit`);
      return;
    }

    const { error } = await supabase
      .from("products")
      .update({
        status: "pending_review",
        submitted_at: new Date().toISOString(),
        admin_notes: null,
      })
      .eq("id", productId)
      .eq("seller_id", user!.id);

    if (error) {
      toast({ title: "Error", description: "Failed to submit product", variant: "destructive" });
      return;
    }
    toast({ title: "Submitted", description: "Product submitted for review. We'll notify you once approved." });
    fetchProducts();
  };

  const deactivateProduct = async (productId: string) => {
    const { error } = await supabase
      .from("products")
      .update({ status: "inactive" })
      .eq("id", productId)
      .eq("seller_id", user!.id);

    if (error) {
      toast({ title: "Error", description: "Failed to deactivate product", variant: "destructive" });
      return;
    }
    toast({ title: "Deactivated", description: "Product is now inactive." });
    fetchProducts();
  };

  const deleteProduct = async () => {
    if (!productToDelete) return;
    const { error } = await supabase
      .from("products")
      .update({ is_deleted: true })
      .eq("id", productToDelete)
      .eq("seller_id", user!.id);

    if (error) {
      toast({ title: "Error", description: "Failed to delete product", variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: "Product has been removed." });
      fetchProducts();
    }
    setDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  const filteredProducts = products.filter((p) => {
    if (activeTab === "all") return true;
    if (activeTab === "active") return p.status === "active";
    if (activeTab === "draft") return p.status === "draft";
    if (activeTab === "pending_review") return p.status === "pending_review";
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
    active: products.filter((p) => p.status === "active").length,
    draft: products.filter((p) => p.status === "draft").length,
    pending_review: products.filter((p) => p.status === "pending_review").length,
    rejected: products.filter((p) => p.status === "rejected").length,
    inactive: products.filter((p) => p.status === "inactive").length,
  };

  const sidebarItems = getSellerNavItems({
    orders: 0,
    enquiries: 0,
    messages: 0,
  });

  if (authLoading || loadingData) {
    return (
      <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Seller Center">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Seller Center">
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-headline mb-1">My Products</h1>
            <p className="text-sm text-muted-foreground">
              Manage your product listings and track their approval status
            </p>
          </div>
          <div className="mt-3 sm:mt-0 flex flex-wrap gap-2">
            <Button variant="outline" className="h-11 gap-2" asChild>
              <Link href="/seller/bulk-upload">
                <Upload className="h-4 w-4" />
                Bulk Upload (CSV)
              </Link>
            </Button>
            <Button variant="o42Primary" className="h-11 gap-2" asChild>
              <Link href="/seller/products/new">
                <Plus className="h-4 w-4" />
                Add Product
              </Link>
            </Button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard title="Total Products" value={counts.all} icon={Package} variant="default" />
          <StatCard title="Active" value={counts.active} icon={CheckCircle2} variant="success" />
          <StatCard title="Pending Review" value={counts.pending_review} icon={Clock} variant="warning" />
          <StatCard
            title="Rejected"
            value={counts.rejected}
            icon={XCircle}
            variant={counts.rejected > 0 ? "danger" : "default"}
          />
        </div>

        {/* Tabs + Table */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 flex-wrap h-auto gap-1">
            <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
            <TabsTrigger value="active">Active ({counts.active})</TabsTrigger>
            <TabsTrigger value="draft">Draft ({counts.draft})</TabsTrigger>
            <TabsTrigger value="pending_review">Pending ({counts.pending_review})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({counts.rejected})</TabsTrigger>
            <TabsTrigger value="inactive">Inactive ({counts.inactive})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {filteredProducts.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center">
                <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-foreground text-lg mb-2">
                  {activeTab === "all" ? "No products yet" : `No ${activeTab.replace("_", " ")} products`}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {activeTab === "all"
                    ? "Create your first product to start selling on Ocean Hotspot"
                    : `You don't have any products in this category`}
                </p>
                {activeTab === "all" && (
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <Button variant="outline" asChild>
                      <Link href="/seller/bulk-upload">
                        <Upload className="h-4 w-4 mr-2" />
                        Bulk Upload (CSV)
                      </Link>
                    </Button>
                    <Button variant="o42Primary" asChild>
                      <Link href="/seller/products/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Product
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-card overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold text-foreground w-14">Image</TableHead>
                      <TableHead className="font-semibold text-foreground">Product</TableHead>
                      <TableHead className="font-semibold text-foreground">Price</TableHead>
                      <TableHead className="font-semibold text-foreground">Status</TableHead>
                      <TableHead className="font-semibold text-foreground">Date</TableHead>
                      <TableHead className="font-semibold text-foreground text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedItems.map((product) => {
                      const statusInfo = getStatusInfo(product.status);
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
                          <TableCell className="text-foreground">
                            {product.price > 0
                              ? `${product.currency === "GBP" || !product.currency ? "£" : product.currency}${product.price.toLocaleString()}`
                              : "Enquiry"}
                          </TableCell>
                          <TableCell>
                            <Badge className={`${statusInfo.color} border text-xs`}>
                              {statusInfo.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-foreground text-sm">
                            {product.created_at
                              ? new Date(product.created_at).toLocaleDateString("en-GB")
                              : "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => router.push(`/seller/products/${product.id}/edit`)}>
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>

                                {(product.status === "draft" || product.status === "inactive") && (
                                  <DropdownMenuItem onClick={() => submitForReview(product.id)}>
                                    <Send className="h-4 w-4 mr-2" />
                                    Submit for Review
                                  </DropdownMenuItem>
                                )}

                                {product.status === "rejected" && (
                                  <DropdownMenuItem onClick={() => submitForReview(product.id)}>
                                    <Send className="h-4 w-4 mr-2" />
                                    Resubmit for Review
                                  </DropdownMenuItem>
                                )}

                                {product.status === "active" && (
                                  <DropdownMenuItem onClick={() => deactivateProduct(product.id)}>
                                    <EyeOff className="h-4 w-4 mr-2" />
                                    Deactivate
                                  </DropdownMenuItem>
                                )}

                                {product.status !== "active" && (
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => {
                                      setProductToDelete(product.id);
                                      setDeleteDialogOpen(true);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteProduct}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default SellerProducts;
