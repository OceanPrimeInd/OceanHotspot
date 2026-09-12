// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getSellerNavItems } from "@/config/sellerNavItems";
import { Loader2, Upload, X, Eye, Save, Store, ExternalLink } from "lucide-react";

interface Showroom {
  id: string;
  seller_id: string;
  slug: string | null;
  brand_name: string;
  tagline: string | null;
  about_text: string | null;
  logo_url: string | null;
  banner_url: string | null;
  primary_color: string;
  secondary_color: string;
  contact_email: string | null;
  contact_phone: string | null;
  website_url: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  facebook_url: string | null;
  years_in_business: number | null;
  location: string | null;
  is_published: boolean;
}

const SellerShowroom = () => {
  const [showroom, setShowroom] = useState<Showroom | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [brandName, setBrandName] = useState("");
  const [slug, setSlug] = useState("");
  const [tagline, setTagline] = useState("");
  const [aboutText, setAboutText] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#1a3560");
  const [secondaryColor, setSecondaryColor] = useState("#FF6B14");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [yearsInBusiness, setYearsInBusiness] = useState("");
  const [location, setLocation] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  // Image uploads
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  // Track the saved slug separately so Preview always links to the correct live URL
  const [savedSlug, setSavedSlug] = useState<string | null>(null);

  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const populateForm = (data: Showroom) => {
    setShowroom(data);
    setBrandName(data.brand_name || "");
    setSlug(data.slug || "");
    setSavedSlug(data.slug || null);
    setTagline(data.tagline || "");
    setAboutText(data.about_text || "");
    setPrimaryColor(data.primary_color || "#1a3560");
    setSecondaryColor(data.secondary_color || "#FF6B14");
    setContactEmail(data.contact_email || "");
    setContactPhone(data.contact_phone || "");
    setWebsiteUrl(data.website_url || "");
    setInstagramUrl(data.instagram_url || "");
    setLinkedinUrl(data.linkedin_url || "");
    setTwitterUrl(data.twitter_url || "");
    setFacebookUrl(data.facebook_url || "");
    setYearsInBusiness(data.years_in_business ? String(data.years_in_business) : "");
    setLocation(data.location || "");
    setIsPublished(data.is_published || false);
    setLogoPreview(data.logo_url || null);
    setBannerPreview(data.banner_url || null);
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/login"); return; }
    if (profile && !profile.is_seller) { router.push("/seller/onboarding"); return; }

    const fetchShowroom = async () => {
      const { data, error } = await supabase
        .from("showrooms").select("*").eq("seller_id", user.id).maybeSingle();

      if (data && !error) {
        populateForm(data);
      } else if (profile) {
        // Pre-fill from seller profile for new showrooms
        setBrandName(profile.trading_name || profile.company_name || "");
        setContactEmail(profile.email || "");
        setContactPhone(profile.phone || "");
        setLogoPreview(profile.logo_url || null);
      }
      setLoading(false);
    };

    if (profile?.is_seller) fetchShowroom();
  }, [user, profile, authLoading, router]);

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleBrandNameChange = (value: string) => {
    setBrandName(value);
    // Auto-generate slug only for new showrooms (no existing DB record)
    if (!showroom) setSlug(generateSlug(value));
  };

  const uploadImage = async (file: File, path: string): Promise<string | null> => {
    const { error } = await supabase.storage
      .from("product-images").upload(path, file, { upsert: true });
    if (error) { console.error("Upload error:", error); return null; }
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSave = async () => {
    if (!user) return;
    if (!brandName.trim()) {
      toast({ title: "Required", description: "Brand name is required.", variant: "destructive" });
      return;
    }

    setSaving(true);

    let logoUrl = showroom?.logo_url ?? logoPreview;
    let bannerUrl = showroom?.banner_url ?? bannerPreview;

    if (logoFile) {
      const ext = logoFile.name.split(".").pop();
      const url = await uploadImage(logoFile, `${user.id}/showroom-logo.${ext}`);
      if (url) logoUrl = url;
    }
    if (bannerFile) {
      const ext = bannerFile.name.split(".").pop();
      const url = await uploadImage(bannerFile, `${user.id}/showroom-banner.${ext}`);
      if (url) bannerUrl = url;
    }

    const finalSlug = slug.trim() || generateSlug(brandName);

    const payload = {
      seller_id: user.id,
      brand_name: brandName.trim(),
      slug: finalSlug,
      tagline: tagline.trim() || null,
      about_text: aboutText.trim() || null,
      logo_url: logoUrl || null,
      banner_url: bannerUrl || null,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      contact_email: contactEmail.trim() || null,
      contact_phone: contactPhone.trim() || null,
      website_url: websiteUrl.trim() || null,
      instagram_url: instagramUrl.trim() || null,
      linkedin_url: linkedinUrl.trim() || null,
      twitter_url: twitterUrl.trim() || null,
      facebook_url: facebookUrl.trim() || null,
      years_in_business: yearsInBusiness ? parseInt(yearsInBusiness, 10) : null,
      location: location.trim() || null,
      is_published: isPublished,
    };

    let savedData: Showroom | null = null;
    let error = null;

    if (showroom?.id) {
      // UPDATE existing record
      const result = await supabase
        .from("showrooms").update(payload).eq("id", showroom.id).select().single();
      error = result.error;
      savedData = result.data;
    } else {
      // INSERT new record and get back the full row (including id)
      const result = await supabase
        .from("showrooms").insert(payload).select().single();
      error = result.error;
      savedData = result.data;
    }

    setSaving(false);

    if (error) {
      toast({ title: "Save Failed", description: error.message || "Failed to save showroom.", variant: "destructive" });
      return;
    }

    // Update local state so Preview link, future saves, and slug are all correct
    if (savedData) {
      setShowroom(savedData);
      setSavedSlug(savedData.slug);
      setSlug(savedData.slug || finalSlug);
      setLogoPreview(savedData.logo_url);
      setBannerPreview(savedData.banner_url);
      setLogoFile(null);
      setBannerFile(null);
    }

    toast({
      title: "Saved!",
      description: isPublished
        ? `Your showroom is live at /showroom/${finalSlug}`
        : "Showroom saved as draft.",
    });
  };

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: (f: File | null) => void,
    setPreview: (p: string | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.match(/^image\/(png|jpeg|jpg|webp)$/)) {
      toast({ title: "Invalid File", description: "Please upload a PNG, JPG, or WebP image.", variant: "destructive" });
      return;
    }
    setFile(file);
    setPreview(URL.createObjectURL(file));
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout sidebarItems={getSellerNavItems()} sidebarTitle="Seller Dashboard">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={getSellerNavItems()} sidebarTitle="Seller Dashboard">
      <div className="p-6 lg:p-8 max-w-4xl">
        <div className="animate-slide-up">

          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Store className="h-6 w-6" /> Your Showroom
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Customize your branded showroom page — visible to all customers
              </p>
            </div>
            <div className="flex gap-2">
              {/* Preview — uses savedSlug (last DB-saved value) so the link is always live */}
              {savedSlug && (
                <Button variant="outline" asChild>
                  <a href={`/showroom/${savedSlug}`} target="_blank" rel="noopener noreferrer">
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                    <ExternalLink className="ml-1 h-3 w-3 opacity-60" />
                  </a>
                </Button>
              )}
              <Button onClick={handleSave} disabled={saving} variant="o42Primary">
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Changes
              </Button>
            </div>
          </div>

          {/* Live URL banner — shown once showroom has been saved */}
          {savedSlug && isPublished && (
            <div className="mb-6 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <p className="text-sm text-green-800">
                <span className="font-semibold">Live: </span>
                <a href={`/showroom/${savedSlug}`} target="_blank" rel="noopener noreferrer"
                  className="underline hover:text-green-900">
                  /showroom/{savedSlug}
                </a>
                {" "}· Customers can find your showroom at this link
              </p>
            </div>
          )}

          {savedSlug && !isPublished && (
            <div className="mb-6 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
              <div className="h-2 w-2 rounded-full bg-amber-500" />
              <p className="text-sm text-amber-800">
                <span className="font-semibold">Draft — </span>
                Your showroom is saved but not visible to customers. Toggle "Publish" below to make it live.
              </p>
            </div>
          )}

          <div className="space-y-8">

            {/* ── Brand Identity */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-foreground mb-4">Brand Identity</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="brandName">Brand Name *</Label>
                  <Input id="brandName" value={brandName}
                    onChange={(e) => handleBrandNameChange(e.target.value)}
                    placeholder="Your brand name" className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug</Label>
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">/showroom/</span>
                    <Input id="slug" value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                      placeholder="your-brand" className="h-11" />
                  </div>
                  <p className="text-xs text-muted-foreground">This will be your showroom URL after saving.</p>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input id="tagline" value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="A short phrase describing your brand" className="h-11" />
                </div>
              </div>
            </div>

            {/* ── About */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-foreground mb-4">About Your Brand</h2>
              <Textarea value={aboutText} onChange={(e) => setAboutText(e.target.value)}
                placeholder="Tell customers about your company, history, values, and what makes you unique..."
                rows={6} />
            </div>

            {/* ── Key Stats */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-foreground mb-4">Key Stats</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="yearsInBusiness">Years in Business</Label>
                  <Input id="yearsInBusiness" type="number" min="0" max="200"
                    value={yearsInBusiness}
                    onChange={(e) => setYearsInBusiness(e.target.value)}
                    placeholder="e.g. 24" className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Portsmouth, United Kingdom" className="h-11" />
                </div>
              </div>
            </div>

            {/* ── Visual Branding */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-foreground mb-4">Visual Branding</h2>
              <div className="grid gap-6 md:grid-cols-2">
                {/* Logo */}
                <div className="space-y-2">
                  <Label>Logo</Label>
                  {logoPreview ? (
                    <div className="relative w-32 h-32">
                      <img src={logoPreview} alt="Logo"
                        className="w-full h-full object-contain rounded-lg border border-border bg-white p-2" />
                      <button type="button"
                        onClick={() => { setLogoFile(null); setLogoPreview(null); }}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground mt-1 text-center">Upload logo</span>
                      <input type="file" accept="image/png,image/jpeg,image/webp"
                        onChange={(e) => handleImageChange(e, setLogoFile, setLogoPreview)}
                        className="hidden" />
                    </label>
                  )}
                </div>

                {/* Banner */}
                <div className="space-y-2">
                  <Label>Banner Image <span className="text-xs text-muted-foreground">(1200×400px recommended)</span></Label>
                  {bannerPreview ? (
                    <div className="relative h-32">
                      <img src={bannerPreview} alt="Banner"
                        className="w-full h-full object-cover rounded-lg border border-border" />
                      <button type="button"
                        onClick={() => { setBannerFile(null); setBannerPreview(null); }}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground mt-1">Upload banner</span>
                      <input type="file" accept="image/png,image/jpeg,image/webp"
                        onChange={(e) => handleImageChange(e, setBannerFile, setBannerPreview)}
                        className="hidden" />
                    </label>
                  )}
                </div>

                {/* Colors */}
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <div className="flex gap-2 items-center">
                    <input type="color" value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-10 h-10 rounded border border-border cursor-pointer" />
                    <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)}
                      className="h-10 w-28" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Secondary / Accent Color</Label>
                  <div className="flex gap-2 items-center">
                    <input type="color" value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-10 h-10 rounded border border-border cursor-pointer" />
                    <Input value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)}
                      className="h-10 w-28" />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Contact */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-foreground mb-4">Contact Information</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input id="contactEmail" type="email" value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="contact@yourbrand.com" className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input id="contactPhone" type="tel" value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+44 1234 567890" className="h-11" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="websiteUrl">Website URL</Label>
                  <Input id="websiteUrl" type="url" value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://www.yourbrand.com" className="h-11" />
                </div>
              </div>
            </div>

            {/* ── Social Links */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-foreground mb-4">Social Media Links</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="instagramUrl">Instagram</Label>
                  <Input id="instagramUrl" type="url" value={instagramUrl}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                    placeholder="https://instagram.com/yourbrand" className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedinUrl">LinkedIn</Label>
                  <Input id="linkedinUrl" type="url" value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/company/yourbrand" className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitterUrl">X / Twitter</Label>
                  <Input id="twitterUrl" type="url" value={twitterUrl}
                    onChange={(e) => setTwitterUrl(e.target.value)}
                    placeholder="https://twitter.com/yourbrand" className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebookUrl">Facebook</Label>
                  <Input id="facebookUrl" type="url" value={facebookUrl}
                    onChange={(e) => setFacebookUrl(e.target.value)}
                    placeholder="https://facebook.com/yourbrand" className="h-11" />
                </div>
              </div>
            </div>

            {/* ── Publish */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-foreground mb-4">Publish Settings</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Publish Showroom</p>
                  <p className="text-sm text-muted-foreground">Make your showroom visible to customers at /showroom/{slug || "your-slug"}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="sr-only peer" />
                  <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                </label>
              </div>
              {isPublished && slug && (
                <p className="mt-3 text-sm text-muted-foreground">
                  After saving, customers can find your showroom at:{" "}
                  <span className="font-mono text-primary">/showroom/{slug}</span>
                </p>
              )}
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SellerShowroom;
