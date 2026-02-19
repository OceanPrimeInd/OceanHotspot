// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getAdminNavItems } from "@/config/adminNavItems";
import {
  Loader2,
  Award,
  Plus,
  Ticket,
  Percent,
  Globe,
  Mail,
} from "lucide-react";

interface Club {
  id: string;
  name: string;
  description: string | null;
  slug: string | null;
  logo_url: string | null;
  website_url: string | null;
  contact_email: string | null;
  discount_percentage: number | null;
  is_active: boolean;
  created_at: string;
}

interface ReferralCode {
  id: string;
  code: string;
  club_id: string;
  discount_percentage: number | null;
  max_uses: number | null;
  current_uses: number | null;
  is_active: boolean;
  valid_until: string | null;
}

const AdminClubs = () => {
  const { isAdmin, loading } = useAdminCheck();
  const router = useRouter();
  const { toast } = useToast();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [referralCodes, setReferralCodes] = useState<ReferralCode[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [showAddClub, setShowAddClub] = useState(false);
  const [showAddCode, setShowAddCode] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Form state for new club
  const [newClub, setNewClub] = useState({
    name: "",
    description: "",
    slug: "",
    website_url: "",
    contact_email: "",
    discount_percentage: 10,
  });

  // Form state for new referral code
  const [newCode, setNewCode] = useState({
    code: "",
    discount_percentage: 10,
    max_uses: 100,
    valid_until: "",
  });

  useEffect(() => {
    if (loading) return;
    if (!isAdmin) {
      router.push("/");
      return;
    }

    fetchData();
  }, [isAdmin, loading, router]);

  const fetchData = async () => {
    const [clubsRes, codesRes] = await Promise.all([
      supabase.from("clubs").select("*").order("name"),
      supabase.from("club_referral_codes").select("*").order("created_at", { ascending: false }),
    ]);

    setClubs(clubsRes.data || []);
    setReferralCodes(codesRes.data || []);
    setLoadingData(false);
  };

  const createClub = async () => {
    setProcessing(true);
    const { error } = await supabase.from("clubs").insert({
      name: newClub.name,
      description: newClub.description || null,
      slug: newClub.slug || newClub.name.toLowerCase().replace(/\s+/g, "-"),
      website_url: newClub.website_url || null,
      contact_email: newClub.contact_email || null,
      discount_percentage: newClub.discount_percentage,
      is_active: true,
    });

    setProcessing(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create club",
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Success", description: "Club created successfully" });
    setShowAddClub(false);
    setNewClub({ name: "", description: "", slug: "", website_url: "", contact_email: "", discount_percentage: 10 });
    fetchData();
  };

  const createReferralCode = async () => {
    if (!selectedClub) return;
    setProcessing(true);

    const { error } = await supabase.from("club_referral_codes").insert({
      club_id: selectedClub.id,
      code: newCode.code.toUpperCase(),
      discount_percentage: newCode.discount_percentage,
      max_uses: newCode.max_uses || null,
      valid_until: newCode.valid_until || null,
      is_active: true,
    });

    setProcessing(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message.includes("duplicate") ? "Code already exists" : "Failed to create code",
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Success", description: "Referral code created" });
    setShowAddCode(false);
    setNewCode({ code: "", discount_percentage: 10, max_uses: 100, valid_until: "" });
    fetchData();
  };

  const toggleClubStatus = async (club: Club) => {
    const { error } = await supabase
      .from("clubs")
      .update({ is_active: !club.is_active })
      .eq("id", club.id);

    if (error) {
      toast({ title: "Error", description: "Failed to update club status", variant: "destructive" });
      return;
    }

    fetchData();
  };

  const toggleCodeStatus = async (code: ReferralCode) => {
    const { error } = await supabase
      .from("club_referral_codes")
      .update({ is_active: !code.is_active })
      .eq("id", code.id);

    if (error) {
      toast({ title: "Error", description: "Failed to update code status", variant: "destructive" });
      return;
    }

    fetchData();
  };

  if (loading || loadingData) {
    return (
      <DashboardLayout 
        sidebarItems={getAdminNavItems()} 
        sidebarTitle="Ocean Hotspot Admin"
      >
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      sidebarItems={getAdminNavItems()} 
      sidebarTitle="Ocean Hotspot Admin"
    >
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Club Partnerships</h1>
            <p className="text-base text-muted-foreground">
              Manage partner clubs and referral codes
            </p>
          </div>
          <Dialog open={showAddClub} onOpenChange={setShowAddClub}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Club
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Club</DialogTitle>
                <DialogDescription>
                  Create a new partner club with discount benefits.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-base">Club Name *</Label>
                  <Input
                    value={newClub.name}
                    onChange={(e) => setNewClub({ ...newClub, name: e.target.value })}
                    placeholder="Royal Yacht Club"
                    className="text-base"
                  />
                </div>
                <div>
                  <Label className="text-base">Description</Label>
                  <Textarea
                    value={newClub.description}
                    onChange={(e) => setNewClub({ ...newClub, description: e.target.value })}
                    placeholder="Brief description of the club..."
                    className="text-base"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-base">Slug</Label>
                    <Input
                      value={newClub.slug}
                      onChange={(e) => setNewClub({ ...newClub, slug: e.target.value })}
                      placeholder="royal-yacht-club"
                      className="text-base"
                    />
                  </div>
                  <div>
                    <Label className="text-base">Default Discount %</Label>
                    <Input
                      type="number"
                      value={newClub.discount_percentage}
                      onChange={(e) => setNewClub({ ...newClub, discount_percentage: parseInt(e.target.value) })}
                      className="text-base"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-base">Website URL</Label>
                  <Input
                    value={newClub.website_url}
                    onChange={(e) => setNewClub({ ...newClub, website_url: e.target.value })}
                    placeholder="https://example.com"
                    className="text-base"
                  />
                </div>
                <div>
                  <Label className="text-base">Contact Email</Label>
                  <Input
                    type="email"
                    value={newClub.contact_email}
                    onChange={(e) => setNewClub({ ...newClub, contact_email: e.target.value })}
                    placeholder="contact@club.com"
                    className="text-base"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={createClub} disabled={processing || !newClub.name}>
                  Create Club
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Clubs List */}
        <div className="mb-12">
          <h2 className="text-lg font-semibold text-foreground mb-4">Partner Clubs</h2>
          {clubs.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center">
              <Award className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-foreground text-lg mb-2">No clubs yet</h3>
              <p className="text-base text-muted-foreground">
                Create your first partner club to get started.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {clubs.map((club) => (
                <div
                  key={club.id}
                  className="rounded-lg border border-border bg-card p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground text-lg">{club.name}</h3>
                      <Badge variant={club.is_active ? "default" : "secondary"}>
                        {club.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <Switch
                      checked={club.is_active}
                      onCheckedChange={() => toggleClubStatus(club)}
                    />
                  </div>

                  {club.description && (
                    <p className="text-base text-muted-foreground mb-3 line-clamp-2">
                      {club.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 text-sm text-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Percent className="h-3 w-3" />
                      {club.discount_percentage}% off
                    </span>
                    {club.website_url && (
                      <span className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        Website
                      </span>
                    )}
                    {club.contact_email && (
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        Email
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Dialog open={showAddCode && selectedClub?.id === club.id} onOpenChange={(open) => {
                      setShowAddCode(open);
                      if (open) setSelectedClub(club);
                    }}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" onClick={() => setSelectedClub(club)}>
                          <Ticket className="mr-1 h-4 w-4" />
                          Add Code
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create Referral Code</DialogTitle>
                          <DialogDescription>
                            Add a new referral code for {club.name}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label className="text-base">Code *</Label>
                            <Input
                              value={newCode.code}
                              onChange={(e) => setNewCode({ ...newCode, code: e.target.value.toUpperCase() })}
                              placeholder="SUMMER2024"
                              className="text-base"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-base">Discount %</Label>
                              <Input
                                type="number"
                                value={newCode.discount_percentage}
                                onChange={(e) => setNewCode({ ...newCode, discount_percentage: parseInt(e.target.value) })}
                                className="text-base"
                              />
                            </div>
                            <div>
                              <Label className="text-base">Max Uses</Label>
                              <Input
                                type="number"
                                value={newCode.max_uses}
                                onChange={(e) => setNewCode({ ...newCode, max_uses: parseInt(e.target.value) })}
                                className="text-base"
                              />
                            </div>
                          </div>
                          <div>
                            <Label className="text-base">Valid Until</Label>
                            <Input
                              type="date"
                              value={newCode.valid_until}
                              onChange={(e) => setNewCode({ ...newCode, valid_until: e.target.value })}
                              className="text-base"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={createReferralCode} disabled={processing || !newCode.code}>
                            Create Code
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Club's Referral Codes */}
                  {referralCodes.filter(c => c.club_id === club.id).length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-sm font-medium text-foreground mb-2">Referral Codes:</p>
                      <div className="space-y-2">
                        {referralCodes
                          .filter(c => c.club_id === club.id)
                          .slice(0, 3)
                          .map((code) => (
                            <div key={code.id} className="flex items-center justify-between text-sm">
                              <span className="font-mono font-medium text-foreground">{code.code}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-foreground">
                                  {code.current_uses}/{code.max_uses || "∞"} uses
                                </span>
                                <Switch
                                  checked={code.is_active}
                                  onCheckedChange={() => toggleCodeStatus(code)}
                                />
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminClubs;
