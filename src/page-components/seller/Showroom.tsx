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
import { Loader2, Upload, X, Eye, Save, Store } from "lucide-react";

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
  is_published: boolean;
}

const SellerShowroom = () => {
  const [showroom, setShowroom] = useState<Showroom | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form fields
  const [brandName, setBrandName] = useState("");
  const [slug, setSlug] = useState("");
  const [tagline, setTagline] = useState("");
  const [aboutText, setAboutText] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#0ea5e9");
  const [secondaryColor, setSecondaryColor] = useState("#0369a1");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  
  // Image uploads
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

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

    const fetchShowroom = async () => {
      const { data, error } = await supabase
        .from("showrooms")
        .select("*")
        .eq("seller_id", user.id)
        .single();

      if (data && !error) {
        setShowroom(data);
        setBrandName(data.brand_name || "");
        setSlug(data.slug || "");
        setTagline(data.tagline || "");
        setAboutText(data.about_text || "");
        setPrimaryColor(data.primary_color || "#0ea5e9");
        setSecondaryColor(data.secondary_color || "#0369a1");
        setContactEmail(data.contact_email || "");
        setContactPhone(data.contact_phone || "");
        setWebsiteUrl(data.website_url || "");
        setIsPublished(data.is_published || false);
        setLogoPreview(data.logo_url);
        setBannerPreview(data.banner_url);
      } else if (profile) {
        // Pre-fill from profile
        setBrandName(profile.trading_name || profile.company_name || "");
        setContactEmail(profile.email || "");
        setContactPhone(profile.phone || "");
        setLogoPreview(profile.logo_url || null);
      }
      
      setLoading(false);
    };

    if (profile?.is_seller) {
      fetchShowroom();
    }
  }, [user, profile, authLoading, router]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleBrandNameChange = (value: string) => {
    setBrandName(value);
    if (!showroom) {
      setSlug(generateSlug(value));
    }
  };

  const uploadImage = async (file: File, path: string): Promise<string | null> => {
    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return null;
    }

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

    let logoUrl = logoPreview;
    let bannerUrl = bannerPreview;

    // Upload new logo if selected
    if (logoFile) {
      const ext = logoFile.name.split(".").pop();
      logoUrl = await uploadImage(logoFile, `${user.id}/showroom-logo.${ext}`);
    }

    // Upload new banner if selected
    if (bannerFile) {
      const ext = bannerFile.name.split(".").pop();
      bannerUrl = await uploadImage(bannerFile, `${user.id}/showroom-banner.${ext}`);
    }

    const showroomData = {
      seller_id: user.id,
      brand_name: brandName.trim(),
      slug: slug.trim() || generateSlug(brandName),
      tagline: tagline.trim() || null,
      about_text: aboutText.trim() || null,
      logo_url: logoUrl,
      banner_url: bannerUrl,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      contact_email: contactEmail.trim() || null,
      contact_phone: contactPhone.trim() || null,
      website_url: websiteUrl.trim() || null,
      is_published: isPublished,
    };

    let error;
    if (showroom) {
      const result = await supabase
        .from("showrooms")
        .update(showroomData)
        .eq("id", showroom.id);
      error = result.error;
    } else {
      const result = await supabase
        .from("showrooms")
        .insert(showroomData);
      error = result.error;
    }

    setSaving(false);

    if (error) {
      toast({ title: "Error", description: "Failed to save showroom.", variant: "destructive" });
      return;
    }

    toast({ title: "Saved!", description: "Your showroom has been updated." });
  };

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: (f: File | null) => void,
    setPreview: (p: string | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.match(/^image\/(png|jpeg|jpg|webp)$/)) {
        toast({ title: "Invalid File", description: "Please upload a PNG, JPG, or WebP image.", variant: "destructive" });
        return;
      }
      setFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout 
        sidebarItems={getSellerNavItems()} 
        sidebarTitle="Seller Dashboard"
      >
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      sidebarItems={getSellerNavItems()} 
      sidebarTitle="Seller Dashboard"
    >
      <div className="p-6 lg:p-8 max-w-4xl">
        <div className="animate-slide-up">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Store className="h-6 w-6" />
                Your Showroom
              </h1>
              <p className="mt-1 text-base text-muted-foreground">
                Customize your branded showroom page
              </p>
            </div>
            <div className="flex gap-2">
              {showroom?.is_published && showroom?.slug && (
                <Button variant="outline" asChild>
                  <a href={`/showroom/${showroom.slug}`} target="_blank">
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </a>
                </Button>
              )}
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Changes
              </Button>
            </div>
          </div>

          <div className="space-y-8">
            {/* Brand Identity */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-foreground mb-4">Brand Identity</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="brandName" className="text-base">Brand Name *</Label>
                  <Input
                    id="brandName"
                    value={brandName}
                    onChange={(e) => handleBrandNameChange(e.target.value)}
                    placeholder="Your brand name"
                    className="h-11 text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug" className="text-base">URL Slug</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-base text-muted-foreground">/showroom/</span>
                    <Input
                      id="slug"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="your-brand"
                      className="h-11 text-base"
                    />
                  </div>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="tagline" className="text-base">Tagline</Label>
                  <Input
                    id="tagline"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="A short phrase describing your brand"
                    className="h-11 text-base"
                  />
                </div>
              </div>
            </div>

            {/* About Section */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-foreground mb-4">About Your Brand</h2>
              <Textarea
                value={aboutText}
                onChange={(e) => setAboutText(e.target.value)}
                placeholder="Tell customers about your company, history, values, and what makes you unique..."
                rows={6}
                className="text-base"
              />
            </div>

            {/* Visual Branding */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-foreground mb-4">Visual Branding</h2>
              <div className="grid gap-6 md:grid-cols-2">
                {/* Logo */}
                <div className="space-y-2">
                  <Label className="text-base">Logo</Label>
                  {logoPreview ? (
                    <div className="relative w-32 h-32">
                      <img
                        src={logoPreview}
                        alt="Logo"
                        className="w-full h-full object-contain rounded-lg border border-border bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => { setLogoFile(null); setLogoPreview(null); }}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground mt-1">Upload logo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, setLogoFile, setLogoPreview)}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Banner */}
                <div className="space-y-2">
                  <Label className="text-base">Banner Image</Label>
                  {bannerPreview ? (
                    <div className="relative h-32">
                      <img
                        src={bannerPreview}
                        alt="Banner"
                        className="w-full h-full object-cover rounded-lg border border-border"
                      />
                      <button
                        type="button"
                        onClick={() => { setBannerFile(null); setBannerPreview(null); }}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground mt-1">Upload banner (1200x400px)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, setBannerFile, setBannerPreview)}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Colors */}
                <div className="space-y-2">
                  <Label className="text-base">Primary Color</Label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-10 h-10 rounded border border-border cursor-pointer"
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="h-10 w-28 text-base"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-base">Secondary Color</Label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-10 h-10 rounded border border-border cursor-pointer"
                    />
                    <Input
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="h-10 w-28 text-base"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-foreground mb-4">Contact Information</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail" className="text-base">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="contact@yourbrand.com"
                    className="h-11 text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone" className="text-base">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+44 1234 567890"
                    className="h-11 text-base"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="websiteUrl" className="text-base">Website URL</Label>
                  <Input
                    id="websiteUrl"
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://www.yourbrand.com"
                    className="h-11 text-base"
                  />
                </div>
              </div>
            </div>

            {/* Publish Settings */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-foreground mb-4">Publish Settings</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground text-base">Publish Showroom</p>
                  <p className="text-base text-muted-foreground">
                    Make your showroom visible to customers
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SellerShowroom;
