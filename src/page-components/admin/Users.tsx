// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { getAdminNavItems } from "@/config/adminNavItems";
import {
  Loader2,
  Users,
  Search,
  Store,
  User,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  company_name: string | null;
  trading_name: string | null;
  is_seller: boolean | null;
  is_buyer: boolean | null;
  country: string | null;
  phone: string | null;
  verification_status: string | null;
  stripe_account_id: string | null;
  stripe_charges_enabled: boolean | null;
  stripe_onboarding_complete: boolean | null;
  created_at: string | null;
}

const AdminUsers = () => {
  const { isAdmin, loading } = useAdminCheck();
  const router = useRouter();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!isAdmin) {
      router.push("/admin/login");
      return;
    }

    fetchUsers();
  }, [isAdmin, loading, router]);

  const fetchUsers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    setUsers(data || []);
    setLoadingData(false);
  };

  const filteredUsers = users.filter((user) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.email?.toLowerCase().includes(query) ||
      user.full_name?.toLowerCase().includes(query) ||
      user.company_name?.toLowerCase().includes(query) ||
      user.trading_name?.toLowerCase().includes(query)
    );
  });

  const {
    paginatedItems,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    goToPage,
  } = usePagination(filteredUsers, { pageSize: 15 });

  if (loading || loadingData) {
    return (
      <DashboardLayout sidebarItems={getAdminNavItems()} sidebarTitle="Ocean Hotspot Admin">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={getAdminNavItems()} sidebarTitle="Ocean Hotspot Admin">
      <div className="p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">User Management</h1>
          <p className="text-base text-muted-foreground">
            View and manage all platform users
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="rounded-lg border border-border bg-card p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{users.length}</p>
            <p className="text-sm text-muted-foreground">Total Users</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{users.filter(u => u.is_seller).length}</p>
            <p className="text-sm text-muted-foreground">Sellers</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{users.filter(u => u.is_buyer && !u.is_seller).length}</p>
            <p className="text-sm text-muted-foreground">Buyers Only</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by email, name, or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 text-base"
          />
        </div>

        {/* Users Table */}
        {filteredUsers.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center">
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-foreground text-lg mb-2">No users found</h3>
            <p className="text-base text-muted-foreground">
              {searchQuery ? "Try a different search term" : "No users registered yet"}
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold text-foreground">Name</TableHead>
                  <TableHead className="font-semibold text-foreground">Email</TableHead>
                  <TableHead className="font-semibold text-foreground">Type</TableHead>
                  <TableHead className="font-semibold text-foreground">Stripe</TableHead>
                  <TableHead className="font-semibold text-foreground">Country</TableHead>
                  <TableHead className="font-semibold text-foreground">Registered</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedItems.map((user) => (
                  <TableRow key={user.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium text-foreground">
                      {user.full_name || user.company_name || user.trading_name || "—"}
                    </TableCell>
                    <TableCell className="text-foreground">{user.email || "—"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {user.is_seller && (
                          <Badge variant="default" className="gap-1 text-xs">
                            <Store className="h-3 w-3" />
                            Seller
                          </Badge>
                        )}
                        {user.is_buyer && !user.is_seller && (
                          <Badge variant="secondary" className="gap-1 text-xs">
                            <User className="h-3 w-3" />
                            Buyer
                          </Badge>
                        )}
                        {user.verification_status === "approved" && (
                          <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                            Verified
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.is_seller ? (
                        user.stripe_charges_enabled ? (
                          <Badge variant="outline" className="gap-1 text-xs text-green-600 border-green-200 bg-green-50">
                            <CheckCircle className="h-3 w-3" />
                            Connected
                          </Badge>
                        ) : user.stripe_onboarding_complete ? (
                          <Badge variant="outline" className="gap-1 text-xs text-amber-600 border-amber-200 bg-amber-50">
                            <Clock className="h-3 w-3" />
                            Pending
                          </Badge>
                        ) : user.stripe_account_id ? (
                          <Badge variant="outline" className="gap-1 text-xs text-amber-600 border-amber-200 bg-amber-50">
                            <Clock className="h-3 w-3" />
                            Incomplete
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1 text-xs text-red-600 border-red-200 bg-red-50">
                            <XCircle className="h-3 w-3" />
                            Not Connected
                          </Badge>
                        )
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-foreground">{user.country || "—"}</TableCell>
                    <TableCell className="text-foreground">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString("en-GB") : "—"}
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

export default AdminUsers;
