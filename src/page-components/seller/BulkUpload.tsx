// @ts-nocheck
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BulkUpload as BulkUploadComponent } from "@/components/seller/BulkUpload";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { getSellerNavItems } from "@/config/sellerNavItems";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const sellerNavItems = getSellerNavItems();

const BulkUploadPage = () => {
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
  }, [user, profile, authLoading, router]);

  if (authLoading || !profile?.is_seller) {
    return (
      <DashboardLayout sidebarItems={sellerNavItems} sidebarTitle="Seller Portal">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={sellerNavItems} sidebarTitle="Seller Portal">
      <div className="p-6 md:p-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/seller/dashboard">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Bulk Upload</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-headline mb-2">
            Bulk Product Upload
          </h1>
          <p className="text-base text-muted-foreground">
            Save time by uploading multiple products at once using a CSV file.
          </p>
        </div>

        {/* Upload Component */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <BulkUploadComponent />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BulkUploadPage;
