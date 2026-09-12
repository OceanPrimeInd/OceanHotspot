// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getSellerNavItems } from "@/config/sellerNavItems";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import { getStatusInfo } from "@/config/productStatus";
import { Loader2, Package, Upload, X, Image as ImageIcon, FileEdit, Send, AlertTriangle } from "lucide-react";
import {
  PRODUCT_DOMAIN_CATEGORIES,
  normalizeDomainCategory,
} from "@/config/productCategories";

// Phase 1 Entity Types
const ENTITY_TYPES = [
  { value: "physical_product", label: "Physical Product" },
  { value: "service", label: "Service" },
  { value: "asset_facility", label: "Asset / Facility" },
  { value: "software_data", label: "Software / Data" },
  { value: "membership_subscription", label: "Membership / Subscription" },
  { value: "document_standard", label: "Document / Standard" },
];

// Condition options
const CONDITIONS = [
  { value: "new", label: "New" },
  { value: "refurbished", label: "Refurbished" },
  { value: "used_excellent", label: "Used — Excellent" },
  { value: "used_good", label: "Used — Good" },
  { value: "used_fair", label: "Used — Fair" },
];

// VAT treatment options
const VAT_TREATMENTS = [
  { value: "plus_vat", label: "Plus VAT" },
  { value: "vat_included", label: "VAT Included" },
  { value: "vat_exempt", label: "VAT Exempt" },
];

// VAT rate options
const VAT_RATES = [
  { value: "20", label: "Standard rate (20%)" },
  { value: "5",  label: "Reduced rate (5%)" },
  { value: "0",  label: "Zero rate (0%)" },
];

// Availability options
const AVAILABILITY_OPTIONS = [
  { value: "in_stock", label: "In Stock" },
  { value: "made_to_order", label: "Made to Order" },
  { value: "pre_order", label: "Pre-Order" },
];

// Shipping cost options
const SHIPPING_COST_OPTIONS = [
  { value: "free", label: "Free Shipping" },
  { value: "included", label: "Included in Price" },
  { value: "calculated_after_order", label: "Calculated After Order" },
  { value: "collection_only", label: "Collection Only" },
];

const EditProduct = () => {
  const { id } = useParams<{ id: string }>();

  // Section 1 - Basic Information
  const [title, setTitle] = useState("");
  const [brand, setBrand] = useState("");
  const [condition, setCondition] = useState("");

  // Section 2 - Category
  const [entityType, setEntityType] = useState("");
  const [domainCategory, setDomainCategory] = useState("");

  // Section 3 - Description
  const [shortDescription, setShortDescription] = useState("");

  // Section 4 - Images
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  // Section 5 - Pricing
  const [pricingType, setPricingType] = useState("fixed_price");
  const [price, setPrice] = useState("");
  const [vatTreatment, setVatTreatment] = useState("");
  const [vatRate, setVatRate] = useState("20");

  // Section 6 - Availability
  const [availabilityStatus, setAvailabilityStatus] = useState("");
  const [leadTimeText, setLeadTimeText] = useState("");

  // Section 7 - Shipping
  const [shipsFrom, setShipsFrom] = useState("");
  const [shippingCostRule, setShippingCostRule] = useState("");

  // Section 8 - Agreement
  const [accuracyConfirmed, setAccuracyConfirmed] = useState(true);

  // Product status
  const [productStatus, setProductStatus] = useState("draft");
  const [adminNotes, setAdminNotes] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

    const fetchProduct = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .eq("seller_id", user.id)
        .maybeSingle();

      if (error || !data) {
        toast({
          title: "Product Not Found",
          description: "Could not find this product or you don't have access.",
          variant: "destructive",
        });
        router.push("/seller/products");
        return;
      }

      setTitle(data.title);
      setBrand(data.brand || "");
      setCondition(data.condition || "");
      setEntityType(data.entity_type || "");
      setDomainCategory(normalizeDomainCategory(data.domain_category));
      setShortDescription(data.description || "");
      setImages(data.images || []);
      setPricingType(data.pricing_type || "fixed_price");
      setPrice(data.price?.toString() || "");
      setVatTreatment(data.vat_treatment || "plus_vat");
      setVatRate((data.vat_rate ?? 20).toString());
      setAvailabilityStatus(data.availability_status || "in_stock");
      setLeadTimeText(data.lead_time_text || "");
      setShipsFrom(data.ships_from || "");
      setShippingCostRule(data.shipping_cost_rule || "calculated_after_order");
      setProductStatus(data.status || "draft");
      setAdminNotes(data.admin_notes || null);
      setLoading(false);
    };

    if (profile?.is_seller) {
      fetchProduct();
    }
  }, [user, profile, authLoading, router, id, toast]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !user) return;

    setUploading(true);
    const newImages: string[] = [];

    for (const file of Array.from(files)) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(fileName, file);

      if (uploadError) {
        toast({
          title: "Upload Failed",
          description: `Failed to upload ${file.name}`,
          variant: "destructive",
        });
        continue;
      }

      const { data: urlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);

      newImages.push(urlData.publicUrl);
    }

    setImages((prev) => [...prev, ...newImages]);
    setUploading(false);

    if (newImages.length > 0) {
      toast({
        title: "Images Uploaded",
        description: `${newImages.length} image(s) uploaded successfully.`,
      });
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForSubmission = (): boolean => {
    if (!title.trim()) { toast({ title: "Required", description: "Product Title is required.", variant: "destructive" }); return false; }
    if (!brand.trim()) { toast({ title: "Required", description: "Brand / Manufacturer is required.", variant: "destructive" }); return false; }
    if (!condition) { toast({ title: "Required", description: "Condition is required.", variant: "destructive" }); return false; }
    if (!entityType) { toast({ title: "Required", description: "Listing type is required.", variant: "destructive" }); return false; }
    if (!domainCategory) { toast({ title: "Required", description: "Category is required.", variant: "destructive" }); return false; }
    if (!shortDescription.trim()) { toast({ title: "Required", description: "Short description is required.", variant: "destructive" }); return false; }
    if (images.length === 0) { toast({ title: "Required", description: "At least one product image is required.", variant: "destructive" }); return false; }
    if (!vatTreatment) { toast({ title: "Required", description: "VAT treatment is required.", variant: "destructive" }); return false; }
    if (!availabilityStatus) { toast({ title: "Required", description: "Availability status is required.", variant: "destructive" }); return false; }
    if (!shipsFrom.trim()) { toast({ title: "Required", description: "Ship-from location is required.", variant: "destructive" }); return false; }
    if (!shippingCostRule) { toast({ title: "Required", description: "Shipping cost rule is required.", variant: "destructive" }); return false; }
    if (!accuracyConfirmed) { toast({ title: "Required", description: "You must confirm product accuracy.", variant: "destructive" }); return false; }
    return true;
  };

  const handleSave = async (submitForReview: boolean) => {
    if (!user || !id) { router.push("/login"); return; }

    // Draft save only requires title
    if (!submitForReview && !title.trim()) {
      toast({ title: "Required", description: "Product title is required to save.", variant: "destructive" });
      return;
    }

    // Submit for review requires all fields
    if (submitForReview && !validateForSubmission()) return;

    setSaving(true);

    const updateData: Record<string, any> = {
      title: title.trim(),
      brand: brand.trim() || null,
      condition: condition || null,
      entity_type: entityType || null,
      domain_category: domainCategory || null,
      description: shortDescription.trim() || null,
      images: images,
      image_url: images[0] || null,
      pricing_type: pricingType,
      price: pricingType === "fixed_price" && price ? parseFloat(price) : 0,
      vat_treatment: pricingType === "fixed_price" ? (vatTreatment || null) : null,
      vat_rate: vatTreatment === "vat_exempt" ? 0 : parseFloat(vatRate),
      availability_status: availabilityStatus || null,
      lead_time_text: leadTimeText.trim() || null,
      ships_from: shipsFrom.trim() || null,
      shipping_cost_rule: shippingCostRule || null,
    };

    if (submitForReview) {
      updateData.status = "pending_review";
      updateData.is_published = false;
      updateData.submitted_at = new Date().toISOString();
      updateData.admin_notes = null;
    }

    const { error } = await supabase
      .from("products")
      .update(updateData)
      .eq("id", id)
      .eq("seller_id", user.id);

    if (error) {
      toast({
        title: "Failed to Update",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setSaving(false);
      return;
    }

    toast({
      title: submitForReview ? "Submitted for Review" : "Changes Saved",
      description: submitForReview
        ? "Your product has been submitted for review. We'll notify you once approved."
        : "Your changes have been saved.",
    });

    router.push("/seller/products");
  };

  // Can this product be submitted/resubmitted for review?
  const canSubmitForReview = productStatus === "draft" || productStatus === "rejected" || productStatus === "inactive";

  const statusInfo = getStatusInfo(productStatus);

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
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-headline">Edit Product</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge className={`${statusInfo.color} border text-xs`}>{statusInfo.label}</Badge>
                <p className="text-sm text-muted-foreground">Update your product details</p>
              </div>
            </div>
          </div>

          {/* Rejection Banner */}
          {productStatus === "rejected" && adminNotes && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-5 flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-red-900">Product Rejected</h3>
                <p className="text-sm text-red-700 mt-0.5">
                  {adminNotes}
                </p>
                <p className="text-xs text-red-500 mt-2">
                  Please address the feedback above and resubmit for review.
                </p>
              </div>
            </div>
          )}

          {/* Pending Review Info */}
          {productStatus === "pending_review" && (
            <div className="mb-6 rounded-xl border border-yellow-200 bg-yellow-50 p-5 flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900">Under Review</h3>
                <p className="text-sm text-yellow-700 mt-0.5">
                  This product is currently being reviewed by Ocean Hotspot team. You can still edit details but it won't change the review status.
                </p>
              </div>
            </div>
          )}

          {/* Two-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT COLUMN */}
            <div className="space-y-6">
              {/* Section 1 - Basic Information */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Product Title *</Label>
                    <Input
                      id="title"
                      type="text"
                      placeholder="Torqeedo Cruise 10.0 Electric Outboard Motor"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      maxLength={100}
                      className="h-12"
                    />
                    <p className="text-xs text-muted-foreground">Clear, descriptive name. Include brand if relevant.</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand / Manufacturer *</Label>
                    <Input
                      id="brand"
                      type="text"
                      placeholder="Torqeedo"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Condition *</Label>
                    <Select value={condition} onValueChange={setCondition}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        {CONDITIONS.map((c) => (
                          <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Section 2 - Category */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Category</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>What type of listing is this? *</Label>
                    <Select value={entityType} onValueChange={setEntityType}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {ENTITY_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Which category best fits this product? *</Label>
                    <Select value={domainCategory} onValueChange={setDomainCategory}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {PRODUCT_DOMAIN_CATEGORIES.map((c) => (
                          <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Section 3 - Description */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Description</h2>
                <div className="space-y-2">
                  <Label htmlFor="shortDescription">Short Description *</Label>
                  <Textarea
                    id="shortDescription"
                    placeholder="Silent, emission-free electric outboard for tenders, dinghies and small sailboats."
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    maxLength={300}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">{shortDescription.length}/300 characters</p>
                </div>
              </div>

              {/* Section 4 - Images */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Images</h2>
                <div className="space-y-4">
                  {images.length > 0 && (
                    <div className="grid grid-cols-3 gap-4">
                      {images.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Product ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-border"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          {index === 0 && (
                            <span className="absolute bottom-1 left-1 text-xs bg-primary text-primary-foreground px-1 rounded">Main</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                      <div className="flex items-center gap-2 px-4 py-2 border border-dashed border-border rounded-lg hover:bg-muted/50 transition-colors">
                        {uploading ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Upload className="h-5 w-5" />
                        )}
                        <span className="text-sm">
                          {uploading ? "Uploading..." : "Upload Images"}
                        </span>
                      </div>
                    </label>

                    {images.length === 0 && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <ImageIcon className="h-5 w-5" />
                        <span className="text-sm">No images uploaded</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-6">
              {/* Section 5 - Pricing */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Pricing</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>How would you like to display the price? *</Label>
                    <Select value={pricingType} onValueChange={setPricingType}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select pricing type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed_price">Fixed Price — show exact price</SelectItem>
                        <SelectItem value="poa">POA — Price on Application</SelectItem>
                        <SelectItem value="contact_us">Contact Us for More Information</SelectItem>
                        <SelectItem value="coming_soon">Coming Soon</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {pricingType === "fixed_price" && (<>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (excluding VAT) *</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">£</span>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="2499.00"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="h-12 pl-7"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>VAT Treatment *</Label>
                    <Select value={vatTreatment} onValueChange={(val) => { setVatTreatment(val); if (val === "vat_exempt") setVatRate("0"); else if (vatRate === "0") setVatRate("20"); }}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select VAT treatment" />
                      </SelectTrigger>
                      <SelectContent>
                        {VAT_TREATMENTS.map((v) => (
                          <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {vatTreatment && vatTreatment !== "vat_exempt" && (
                    <div className="space-y-2">
                      <Label>VAT Rate *</Label>
                      <Select value={vatRate} onValueChange={setVatRate}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select VAT rate" />
                        </SelectTrigger>
                        <SelectContent>
                          {VAT_RATES.map((r) => (
                            <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  </>)}
                </div>
              </div>

              {/* Section 6 - Availability */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Availability</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Availability *</Label>
                    <Select value={availabilityStatus} onValueChange={setAvailabilityStatus}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select availability" />
                      </SelectTrigger>
                      <SelectContent>
                        {AVAILABILITY_OPTIONS.map((a) => (
                          <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="leadTime">Lead Time *</Label>
                    <Input
                      id="leadTime"
                      type="text"
                      placeholder="Ships in 3 days"
                      value={leadTimeText}
                      onChange={(e) => setLeadTimeText(e.target.value)}
                      className="h-12"
                    />
                    <p className="text-xs text-muted-foreground">Example: "Ships in 3 days" or "4-6 weeks"</p>
                  </div>
                </div>
              </div>

              {/* Section 7 - Shipping */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Shipping</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="shipsFrom">Ships From (City + Country) *</Label>
                    <Input
                      id="shipsFrom"
                      type="text"
                      placeholder="Southampton, UK"
                      value={shipsFrom}
                      onChange={(e) => setShipsFrom(e.target.value)}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Shipping Cost *</Label>
                    <Select value={shippingCostRule} onValueChange={setShippingCostRule}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select shipping option" />
                      </SelectTrigger>
                      <SelectContent>
                        {SHIPPING_COST_OPTIONS.map((s) => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Section 8 - Agreement */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Agreement</h2>
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="accuracy"
                    checked={accuracyConfirmed}
                    onCheckedChange={(checked) => setAccuracyConfirmed(checked as boolean)}
                  />
                  <label htmlFor="accuracy" className="text-sm leading-relaxed cursor-pointer">
                    I confirm this product information is accurate and I can supply this product as listed.
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <Button
              type="button"
              variant="outline"
              className="h-12 px-6"
              onClick={() => router.push("/seller/products")}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-12 px-6 gap-2"
              onClick={() => handleSave(false)}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileEdit className="h-4 w-4" />
              )}
              Save Changes
            </Button>
            {canSubmitForReview && (
              <Button
                type="button"
                variant="o42Primary"
                className="h-12 px-6 gap-2 sm:ml-auto"
                onClick={() => handleSave(true)}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    {productStatus === "rejected" ? "Resubmit for Review" : "Submit for Review"}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EditProduct;
