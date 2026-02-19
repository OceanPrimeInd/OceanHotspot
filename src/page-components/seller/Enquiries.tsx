// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { getSellerNavItems } from "@/config/sellerNavItems";
import {
  Loader2,
  Mail,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";

interface Enquiry {
  id: string;
  message: string;
  is_read: boolean;
  created_at: string;
  product_id: string;
  buyer_id: string | null;
  buyer_name?: string | null;
  buyer_email?: string | null;
  product: {
    title: string;
  } | null;
}

const SellerEnquiries = () => {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();

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
      const fetchEnquiries = async () => {
        const { data: enquiriesData, error } = await supabase
          .from("enquiries")
          .select(`
            id,
            message,
            is_read,
            created_at,
            product_id,
            buyer_id,
            buyer_name,
            buyer_email,
            products(title)
          `)
          .eq("seller_id", user.id)
          .order("created_at", { ascending: false });

        if (!error && enquiriesData) {
          const buyerIds = [
            ...new Set(enquiriesData.map((e) => e.buyer_id).filter(Boolean)),
          ] as string[];

          const { data: buyerProfiles } = buyerIds.length
            ? await supabase
                .from("profiles")
                .select("id, email, full_name, company_name, trading_name")
                .in("id", buyerIds)
            : { data: [] as Array<{ id: string; email: string | null; full_name: string | null; company_name: string | null; trading_name: string | null }> };

          const profileMap = new Map(
            buyerProfiles?.map((p) => [p.id, p]) || []
          );

          const formattedEnquiries = enquiriesData.map((e) => {
            const buyerProfile = e.buyer_id ? profileMap.get(e.buyer_id) : undefined;
            return {
              ...e,
              product: e.products as { title: string } | null,
              buyer_name:
                e.buyer_name ||
                buyerProfile?.full_name ||
                buyerProfile?.company_name ||
                buyerProfile?.trading_name ||
                buyerProfile?.email ||
                "Unknown",
              buyer_email:
                e.buyer_email ||
                buyerProfile?.email ||
                "Unknown",
            };
          });

          setEnquiries(formattedEnquiries);

          const unreadIds = enquiriesData
            .filter((e) => !e.is_read)
            .map((e) => e.id);
          if (unreadIds.length > 0) {
            await supabase
              .from("enquiries")
              .update({ is_read: true })
              .in("id", unreadIds);
          }
        }

        setLoading(false);
      };

      fetchEnquiries();
    }
  }, [user, profile, authLoading, router]);

  const unreadCount = enquiries.filter(e => !e.is_read).length;

  const {
    paginatedItems,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    goToPage,
  } = usePagination(enquiries, { pageSize: 10 });

  if (authLoading || loading || !profile?.is_seller) {
    return (
      <DashboardLayout sidebarItems={getSellerNavItems({ enquiries: unreadCount })} sidebarTitle="Seller Dashboard">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={getSellerNavItems({ enquiries: unreadCount })} sidebarTitle="Seller Dashboard">
      <div className="p-6 lg:p-8">
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <Mail className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Customer Enquiries</h1>
              <p className="text-base text-muted-foreground">
                Messages from potential buyers
              </p>
            </div>
          </div>
        </div>

        {enquiries.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center">
            <Mail className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-foreground text-lg mb-2">No enquiries yet</h3>
            <p className="text-base text-muted-foreground">
              When buyers contact you about your products, their messages will appear here.
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold text-foreground w-12">Status</TableHead>
                  <TableHead className="font-semibold text-foreground">Product</TableHead>
                  <TableHead className="font-semibold text-foreground">Message</TableHead>
                  <TableHead className="font-semibold text-foreground">Customer</TableHead>
                  <TableHead className="font-semibold text-foreground">Date</TableHead>
                  <TableHead className="font-semibold text-foreground text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedItems.map((enquiry) => (
                  <TableRow key={enquiry.id} className={`hover:bg-muted/30 ${!enquiry.is_read ? "bg-primary/5" : ""}`}>
                    <TableCell>
                      {!enquiry.is_read ? (
                        <Badge variant="default" className="text-xs">New</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Read</Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-foreground max-w-[150px] truncate">
                      {enquiry.product?.title || "Unknown"}
                    </TableCell>
                    <TableCell className="text-foreground max-w-[250px]">
                      <p className="truncate">{enquiry.message}</p>
                    </TableCell>
                    <TableCell className="text-foreground text-sm">
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {enquiry.buyer_name || "Unknown"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {enquiry.buyer_email || "No email"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground">
                      {format(new Date(enquiry.created_at), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        {enquiry.buyer_email && enquiry.buyer_email !== "Unknown" ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                          >
                            <a
                              href={`mailto:${enquiry.buyer_email}?subject=${encodeURIComponent(
                                `Enquiry about ${enquiry.product?.title || "your product"}`
                              )}&body=${encodeURIComponent(`Hi ${enquiry.buyer_name || ""},\n\nThanks for your enquiry:\n\"${enquiry.message}\"\n\n`)}`
                              }
                            >
                              <Mail className="h-4 w-4" />
                            </a>
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" disabled>
                            <Mail className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/product/${enquiry.product_id}`}>
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
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
      </div>
    </DashboardLayout>
  );
};

export default SellerEnquiries;
