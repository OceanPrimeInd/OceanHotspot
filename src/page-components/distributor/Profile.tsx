// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getDistributorNavItems } from "@/config/distributorNavItems";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";

const COVERAGE_AREAS = [
  "United Kingdom","Ireland","France","Spain","Portugal","Netherlands",
  "Belgium","Germany","Scandinavia","Mediterranean","Middle East",
  "North America","Caribbean","Asia Pacific","Global",
];
const SPECIALIZATIONS = [
  "Navigation & Electronics","Safety Equipment","Propulsion & Engineering",
  "Deck Hardware","Anchoring & Mooring","Marine Clothing & PPE",
  "Electrical Systems","Plumbing & Sanitation","Interior & Comfort",
  "Commercial Vessels","Superyachts","Offshore & Industrial",
  "Fishing Equipment","Watersports",
];

export default function DistributorProfile() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [distributorId, setDistributorId] = useState<string | null>(null);

  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [yearsInBusiness, setYearsInBusiness] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [description, setDescription] = useState("");
  const [commissionRate, setCommissionRate] = useState("10");
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/distributor/profile");
      return;
    }
    if (!authLoading && user) loadProfile();
  }, [user, authLoading]);

  const loadProfile = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("distributors")
      .select("*")
      .eq("user_id", user!.id)
      .maybeSingle();

    if (!data) { router.push("/distributor/register"); return; }

    setDistributorId(data.id);
    setCompanyName(data.company_name || "");
    setContactName(data.contact_name || "");
    setEmail(data.email || "");
    setPhone(data.phone || "");
    setLocation(data.location || "");
    setYearsInBusiness(data.years_in_business?.toString() || "");
    setWebsiteUrl(data.website_url || "");
    setLinkedinUrl(data.linkedin_url || "");
    setInstagramUrl(data.instagram_url || "");
    setDescription(data.description || "");
    setCommissionRate(data.commission_rate?.toString() || "10");
    setSelectedAreas(data.coverage_areas || []);
    setSelectedSpecs(data.specializations || []);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!distributorId) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("distributors")
        .update({
          company_name: companyName,
          contact_name: contactName,
          email,
          phone: phone || null,
          location: location || null,
          years_in_business: yearsInBusiness ? parseInt(yearsInBusiness) : null,
          website_url: websiteUrl || null,
          linkedin_url: linkedinUrl || null,
          instagram_url: instagramUrl || null,
          description: description || null,
          commission_rate: parseFloat(commissionRate) || 10,
          coverage_areas: selectedAreas,
          specializations: selectedSpecs,
          updated_at: new Date().toISOString(),
        })
        .eq("id", distributorId);

      if (error) throw error;
      toast({ title: "Profile updated successfully" });
    } catch (err: any) {
      toast({ title: "Error saving profile", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const toggleArea = (a: string) =>
    setSelectedAreas(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  const toggleSpec = (s: string) =>
    setSelectedSpecs(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  if (authLoading || loading) {
    return (
      <DashboardLayout sidebarItems={getDistributorNavItems()} sidebarTitle="Distributor">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={getDistributorNavItems()} sidebarTitle="Distributor">
      <div className="p-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Distributor Profile</h1>
            <p className="text-muted-foreground text-sm mt-1">Update your company details and coverage areas.</p>
          </div>
          <Button onClick={handleSave} disabled={saving} className="bg-[#0B1F3B] hover:bg-[#0B1F3B]/90 text-white">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </div>

        <div className="space-y-8">
          {/* Company Info */}
          <div className="bg-card border rounded-xl p-6 space-y-5">
            <h2 className="font-semibold text-base">Company Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label>Company Name *</Label>
                <Input value={companyName} onChange={e => setCompanyName(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Contact Name *</Label>
                <Input value={contactName} onChange={e => setContactName(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Email *</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={phone} onChange={e => setPhone(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Location / HQ</Label>
                <Input value={location} onChange={e => setLocation(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Years in Business</Label>
                <Input type="number" min="0" value={yearsInBusiness} onChange={e => setYearsInBusiness(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Website</Label>
                <Input value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>LinkedIn</Label>
                <Input value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Instagram</Label>
                <Input value={instagramUrl} onChange={e => setInstagramUrl(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Default Commission Rate (%)</Label>
                <Input type="number" min="1" max="30" value={commissionRate} onChange={e => setCommissionRate(e.target.value)} className="mt-1" />
              </div>
            </div>
            <div>
              <Label>About Your Business</Label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className="mt-1" />
            </div>
          </div>

          {/* Coverage Areas */}
          <div className="bg-card border rounded-xl p-6">
            <h2 className="font-semibold text-base mb-3">Coverage Areas</h2>
            <div className="flex flex-wrap gap-2">
              {COVERAGE_AREAS.map(area => (
                <button
                  key={area}
                  onClick={() => toggleArea(area)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    selectedAreas.includes(area)
                      ? "bg-[#0B1F3B] text-white border-[#0B1F3B]"
                      : "border-border hover:border-[#0B1F3B]"
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>

          {/* Specializations */}
          <div className="bg-card border rounded-xl p-6">
            <h2 className="font-semibold text-base mb-3">Specializations</h2>
            <div className="flex flex-wrap gap-2">
              {SPECIALIZATIONS.map(spec => (
                <button
                  key={spec}
                  onClick={() => toggleSpec(spec)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    selectedSpecs.includes(spec)
                      ? "bg-amber-500 text-white border-amber-500"
                      : "border-border hover:border-amber-500"
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="bg-[#0B1F3B] hover:bg-[#0B1F3B]/90 text-white">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
