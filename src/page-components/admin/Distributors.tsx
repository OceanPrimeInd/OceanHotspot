// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase/client";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useToast } from "@/hooks/use-toast";
import { getAdminNavItems } from "@/config/adminNavItems";
import {
  Loader2,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Globe,
  Mail,
  Phone,
  ChevronDown,
  ChevronUp,
  Users,
} from "lucide-react";

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  pending: { label: "Pending Review", cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  approved: { label: "Approved", cls: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  suspended: { label: "Suspended", cls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

export default function AdminDistributors() {
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [distributors, setDistributors] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [actioning, setActioning] = useState<string | null>(null);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      router.push("/admin");
      return;
    }
    if (!adminLoading && isAdmin) loadData();
  }, [isAdmin, adminLoading]);

  const loadData = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("distributors")
      .select("*")
      .order("created_at", { ascending: false });
    setDistributors(data || []);
    setFiltered(data || []);
    setLoading(false);
  };

  useEffect(() => {
    let list = distributors;
    if (statusFilter !== "all") list = list.filter(d => d.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(d =>
        d.company_name?.toLowerCase().includes(q) ||
        d.contact_name?.toLowerCase().includes(q) ||
        d.email?.toLowerCase().includes(q) ||
        d.location?.toLowerCase().includes(q)
      );
    }
    setFiltered(list);
  }, [search, statusFilter, distributors]);

  const updateStatus = async (id: string, status: string) => {
    setActioning(id);
    const { error } = await supabase
      .from("distributors")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      toast({ title: "Error updating status", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Distributor ${status}` });
      loadData();
    }
    setActioning(null);
  };

  const counts = {
    all: distributors.length,
    pending: distributors.filter(d => d.status === "pending").length,
    approved: distributors.filter(d => d.status === "approved").length,
    suspended: distributors.filter(d => d.status === "suspended").length,
  };

  const navItems = getAdminNavItems({ distributors: counts.pending });

  if (adminLoading || loading) {
    return (
      <DashboardLayout sidebarItems={getAdminNavItems({ distributors: counts.pending })} sidebarTitle="Admin">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={navItems} sidebarTitle="Admin">
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold">Distributors</h1>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Users className="w-4 h-4" />
            {counts.approved} active · {counts.pending} pending
          </div>
        </div>
        <p className="text-muted-foreground text-sm mb-6">
          Review and manage distributor applications and accounts.
        </p>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by company, contact, email..."
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            {(["all", "pending", "approved", "suspended"] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  statusFilter === s
                    ? "bg-[#0B1F3B] text-white border-[#0B1F3B]"
                    : "border-border hover:border-[#0B1F3B]"
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)} ({counts[s]})
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-card border rounded-xl py-16 text-center">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-medium">No distributors found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(dist => {
              const statusInfo = STATUS_LABELS[dist.status] || STATUS_LABELS.pending;
              const isExpanded = expanded === dist.id;

              return (
                <div key={dist.id} className="bg-card border rounded-xl overflow-hidden">
                  <div
                    className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => setExpanded(isExpanded ? null : dist.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold">{dist.company_name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusInfo.cls}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {dist.contact_name} · {dist.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {dist.location && (
                        <span className="text-xs text-muted-foreground hidden md:flex items-center gap-1">
                          <MapPin className="w-3 h-3" />{dist.location}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground hidden sm:block">
                        {dist.commission_rate}% commission
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t px-5 py-4 bg-muted/20">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
                        <div className="space-y-2 text-sm">
                          {dist.phone && (
                            <p className="flex items-center gap-2 text-muted-foreground">
                              <Phone className="w-3.5 h-3.5" />{dist.phone}
                            </p>
                          )}
                          {dist.email && (
                            <p className="flex items-center gap-2 text-muted-foreground">
                              <Mail className="w-3.5 h-3.5" />{dist.email}
                            </p>
                          )}
                          {dist.website_url && (
                            <p className="flex items-center gap-2 text-muted-foreground">
                              <Globe className="w-3.5 h-3.5" />
                              <a href={dist.website_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline" onClick={e => e.stopPropagation()}>
                                {dist.website_url}
                              </a>
                            </p>
                          )}
                          {dist.years_in_business && (
                            <p className="text-muted-foreground">{dist.years_in_business} years in business</p>
                          )}
                          {dist.description && (
                            <p className="text-foreground mt-2">{dist.description}</p>
                          )}
                        </div>

                        <div className="space-y-3">
                          <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase mb-1.5">Coverage Areas</p>
                            <div className="flex flex-wrap gap-1">
                              {(dist.coverage_areas || []).map((area: string) => (
                                <span key={area} className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                                  {area}
                                </span>
                              ))}
                            </div>
                          </div>
                          {(dist.specializations || []).length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground uppercase mb-1.5">Specializations</p>
                              <div className="flex flex-wrap gap-1">
                                {dist.specializations.map((s: string) => (
                                  <span key={s} className="text-xs bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 pt-3 border-t">
                        {dist.status !== "approved" && (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => updateStatus(dist.id, "approved")}
                            disabled={actioning === dist.id}
                          >
                            {actioning === dist.id ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />}
                            Approve
                          </Button>
                        )}
                        {dist.status !== "suspended" && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateStatus(dist.id, "suspended")}
                            disabled={actioning === dist.id}
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1.5" />
                            Suspend
                          </Button>
                        )}
                        {dist.status === "suspended" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatus(dist.id, "pending")}
                            disabled={actioning === dist.id}
                          >
                            <Clock className="w-3.5 h-3.5 mr-1.5" />
                            Reset to Pending
                          </Button>
                        )}
                        <span className="text-xs text-muted-foreground ml-2">
                          Applied {new Date(dist.created_at).toLocaleDateString("en-GB")}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
