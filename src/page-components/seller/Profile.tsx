// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getSellerNavItems } from "@/config/sellerNavItems";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  UserCircle,
  Upload,
  X,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Save,
} from "lucide-react";

const BUSINESS_TYPES = [
  { value: "sole_trader", label: "Sole Trader" },
  { value: "limited_company", label: "Limited Company" },
  { value: "partnership", label: "Partnership" },
  { value: "llp", label: "LLP" },
  { value: "other", label: "Other" },
];

const SellerProfile = () => {
  // Business Details
  const [companyName, setCompanyName] = useState("");
  const [tradingName, setTradingName] = useState("");
  const [legalName, setLegalName] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Contact & Address
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [businessRegNumber, setBusinessRegNumber] = useState("");
  const [businessType, setBusinessType] = useState("");

  // Stripe status
  const [stripeConnected, setStripeConnected] = useState(false);
  const [stripeOnboardingComplete, setStripeOnboardingComplete] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openingStripeDashboard, setOpeningStripeDashboard] = useState(false);
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

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

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error || !data) {
        toast({
          title: "Error",
          description: "Could not load your profile.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      setCompanyName(data.company_name || "");
      setTradingName(data.trading_name || "");
      setLegalName(data.legal_name || "");
      setShortDescription(data.short_description || "");
      setLogoUrl(data.logo_url || null);
      setFullName(data.full_name || "");
      setPhone(data.phone || "");
      setCountry(data.country || "");
      setBusinessAddress(data.business_address || "");
      setBusinessRegNumber(data.business_registration_number || "");
      setBusinessType(data.business_type || "");
      setStripeConnected(!!data.stripe_charges_enabled);
      setStripeOnboardingComplete(!!data.stripe_onboarding_complete);
      setLoading(false);
    };

    if (profile?.is_seller) {
      fetchProfile();
    }
  }, [user, profile, authLoading, router, toast]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.match(/^image\/(png|jpeg|jpg)$/)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a JPG or PNG file.",
        variant: "destructive",
      });
      return;
    }

    setUploadingLogo(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/logo_${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(fileName, file);

    if (uploadError) {
      toast({
        title: "Upload Failed",
        description: "Could not upload your logo. Please try again.",
        variant: "destructive",
      });
      setUploadingLogo(false);
      return;
    }

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);

    setLogoUrl(data.publicUrl);
    setUploadingLogo(false);
    toast({ title: "Logo Uploaded", description: "Your company logo has been updated." });
  };

  const handleOpenStripeDashboard = async () => {
    if (!user) return;

    setOpeningStripeDashboard(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const response = await supabase.functions.invoke("create-stripe-login-link", {
        headers: {
          Authorization: `Bearer ${sessionData.session?.access_token}`,
        },
      });

      if (response.error || response.data?.error) {
        toast({
          title: "Could not open Stripe",
          description: response.data?.error || "Please try again later.",
          variant: "destructive",
        });
        setOpeningStripeDashboard(false);
        return;
      }

      if (response.data?.url) {
        window.open(response.data.url, "_blank");
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Could not connect to Stripe. Please try again.",
        variant: "destructive",
      });
    }
    setOpeningStripeDashboard(false);
  };

  const handleSave = async () => {
    if (!user) return;

    if (!companyName.trim()) {
      toast({ title: "Required", description: "Company name is required.", variant: "destructive" });
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        company_name: companyName.trim(),
        trading_name: tradingName.trim() || null,
        legal_name: legalName.trim() || null,
        short_description: shortDescription.trim() || null,
        logo_url: logoUrl,
        full_name: fullName.trim() || null,
        phone: phone.trim() || null,
        country: country.trim() || null,
        business_address: businessAddress.trim() || null,
        business_registration_number: businessRegNumber.trim() || null,
        business_type: businessType || null,
      })
      .eq("id", user.id);

    if (error) {
      toast({
        title: "Save Failed",
        description: "Could not save your profile. Please try again.",
        variant: "destructive",
      });
      setSaving(false);
      return;
    }

    toast({ title: "Profile Saved", description: "Your business details have been updated." });
    setSaving(false);
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout sidebarItems={getSellerNavItems()} sidebarTitle="Seller Center">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={getSellerNavItems()} sidebarTitle="Seller Center">
      <div className="p-6 md:p-8 max-w-5xl">
        <div className="animate-slide-up">
          {/* Header */}
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <UserCircle className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-headline">My Profile</h1>
              <p className="text-sm text-muted-foreground">Manage your business details and contact information</p>
            </div>
          </div>

          {/* Two-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT COLUMN — Business Details */}
            <div className="space-y-6">
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Business Details</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input
                      id="companyName"
                      placeholder="Your company name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tradingName">Trading Name</Label>
                    <Input
                      id="tradingName"
                      placeholder="Trading as (if different)"
                      value={tradingName}
                      onChange={(e) => setTradingName(e.target.value)}
                      className="h-12"
                    />
                    <p className="text-xs text-muted-foreground">If your business trades under a different name</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="legalName">Legal Name</Label>
                    <Input
                      id="legalName"
                      placeholder="Registered legal entity name"
                      value={legalName}
                      onChange={(e) => setLegalName(e.target.value)}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shortDescription">Business Description</Label>
                    <Textarea
                      id="shortDescription"
                      placeholder="Tell buyers about your business, what you sell, and your expertise..."
                      value={shortDescription}
                      onChange={(e) => setShortDescription(e.target.value)}
                      maxLength={500}
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground">{shortDescription.length}/500 characters</p>
                  </div>
                </div>
              </div>

              {/* Logo */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Company Logo</h2>
                <div className="flex items-start gap-4">
                  {logoUrl ? (
                    <div className="relative">
                      <img
                        src={logoUrl}
                        alt="Company logo"
                        className="w-24 h-24 object-cover rounded-lg border border-border"
                      />
                      <button
                        type="button"
                        onClick={() => setLogoUrl(null)}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted/30">
                      <UserCircle className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg"
                        onChange={handleLogoUpload}
                        className="hidden"
                        disabled={uploadingLogo}
                      />
                      <div className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted/50 transition-colors text-sm">
                        {uploadingLogo ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                        {uploadingLogo ? "Uploading..." : "Upload Logo"}
                      </div>
                    </label>
                    <p className="text-xs text-muted-foreground mt-2">JPG or PNG, recommended 400x400px</p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN — Contact & Address */}
            <div className="space-y-6">
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      placeholder="Your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      value={user?.email || ""}
                      disabled
                      className="h-12 bg-muted/50"
                    />
                    <p className="text-xs text-muted-foreground">Email cannot be changed here</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="+44 7700 900000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      placeholder="United Kingdom"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="h-12"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Business Registration</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Business Type</Label>
                    <Select value={businessType} onValueChange={setBusinessType}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                      <SelectContent>
                        {BUSINESS_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessAddress">Business Address</Label>
                    <Textarea
                      id="businessAddress"
                      placeholder="Full registered business address"
                      value={businessAddress}
                      onChange={(e) => setBusinessAddress(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessRegNumber">Registration Number</Label>
                    <Input
                      id="businessRegNumber"
                      placeholder="Company registration number"
                      value={businessRegNumber}
                      onChange={(e) => setBusinessRegNumber(e.target.value)}
                      className="h-12"
                    />
                    <p className="text-xs text-muted-foreground">Companies House number or equivalent</p>
                  </div>
                </div>
              </div>

              {/* Stripe Status */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Payment Account</h2>
                <div className="flex items-center gap-3">
                  {stripeConnected ? (
                    <>
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">Stripe Connected</p>
                        <p className="text-sm text-muted-foreground">Your payment account is active and ready to receive payments.</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3 gap-1"
                          onClick={handleOpenStripeDashboard}
                          disabled={openingStripeDashboard}
                        >
                          {openingStripeDashboard ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <ExternalLink className="h-4 w-4" />
                          )}
                          {openingStripeDashboard ? "Opening..." : "Open Stripe Dashboard"}
                        </Button>
                      </div>
                      <Badge className="bg-green-100 text-green-800 border border-green-200">Active</Badge>
                    </>
                  ) : (
                    <>
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-100">
                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">
                          {stripeOnboardingComplete ? "Verification Pending" : "Not Connected"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {stripeOnboardingComplete
                            ? "Stripe is reviewing your account details."
                            : "Connect Stripe to receive payments from buyers."}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/seller/onboarding?step=2">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          {stripeOnboardingComplete ? "Check Status" : "Connect"}
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end mt-8">
            <Button
              variant="o42Primary"
              className="h-12 px-8 gap-2"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Profile
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SellerProfile;
