// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { Loader2, Package, Upload, X, FileEdit, Send } from "lucide-react";
import { PRODUCT_DOMAIN_CATEGORIES } from "@/config/productCategories";

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

const CreateProduct = () => {
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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
  const [accuracyConfirmed, setAccuracyConfirmed] = useState(false);

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
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
    }
  }, [user, profile, authLoading, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.match(/^image\/(png|jpeg|jpg)$/)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a JPG or PNG file.",
          variant: "destructive",
        });
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile || !user) return null;

    setUploadingImage(true);
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(fileName, imageFile);

    if (uploadError) {
      console.error("Image upload error:", uploadError);
      setUploadingImage(false);
      return null;
    }

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);

    setUploadingImage(false);
    return data.publicUrl;
  };

  const validateForSubmission = (): boolean => {
    if (!title.trim()) { toast({ title: "Required", description: "Product Title is required.", variant: "destructive" }); return false; }
    if (!brand.trim()) { toast({ title: "Required", description: "Brand / Manufacturer is required.", variant: "destructive" }); return false; }
    if (!condition) { toast({ title: "Required", description: "Condition is required.", variant: "destructive" }); return false; }
    if (!entityType) { toast({ title: "Required", description: "Listing type is required.", variant: "destructive" }); return false; }
    if (!domainCategory) { toast({ title: "Required", description: "Category is required.", variant: "destructive" }); return false; }
    if (!shortDescription.trim()) { toast({ title: "Required", description: "Short description is required.", variant: "destructive" }); return false; }
    if (shortDescription.length > 300) { toast({ title: "Too Long", description: "Description must be 300 characters or less.", variant: "destructive" }); return false; }
    if (!imageFile) { toast({ title: "Required", description: "Main product image is required.", variant: "destructive" }); return false; }
    if (!vatTreatment) { toast({ title: "Required", description: "VAT treatment is required.", variant: "destructive" }); return false; }
    if (!availabilityStatus) { toast({ title: "Required", description: "Availability status is required.", variant: "destructive" }); return false; }
    if (!shipsFrom.trim()) { toast({ title: "Required", description: "Ship-from location is required.", variant: "destructive" }); return false; }
    if (!shippingCostRule) { toast({ title: "Required", description: "Shipping cost rule is required.", variant: "destructive" }); return false; }
    if (!accuracyConfirmed) { toast({ title: "Required", description: "You must confirm product accuracy.", variant: "destructive" }); return false; }
    return true;
  };

  const handleSave = async (submitForReview: boolean) => {
    if (!user) { router.push("/login"); return; }

    // Draft only requires title
    if (!submitForReview && !title.trim()) {
      toast({ title: "Required", description: "Product title is required to save.", variant: "destructive" });
      return;
    }

    // Submit for review requires all fields
    if (submitForReview && !validateForSubmission()) return;

    setLoading(true);

    // Upload image if present
    let imageUrl: string | null = null;
    if (imageFile) {
      imageUrl = await uploadImage();
      if (!imageUrl) {
        toast({ title: "Image Upload Failed", description: "Could not upload your image. Please try again.", variant: "destructive" });
        setLoading(false);
        return;
      }
    }

    const productData: Record<string, any> = {
      seller_id: user.id,
      title: title.trim(),
      brand: brand.trim() || null,
      condition: condition || null,
      entity_type: entityType || null,
      domain_category: domainCategory || null,
      description: shortDescription.trim() || null,
      image_url: imageUrl,
      images: imageUrl ? [imageUrl] : null,
      pricing_type: pricingType,
      price: pricingType === "fixed_price" && price ? parseFloat(price) : 0,
      currency: "GBP",
      vat_treatment: pricingType === "fixed_price" ? (vatTreatment || null) : null,
      vat_rate: vatTreatment === "vat_exempt" ? 0 : parseFloat(vatRate),
      availability_status: availabilityStatus || null,
      lead_time_text: leadTimeText.trim() || null,
      ships_from: shipsFrom.trim() || null,
      shipping_cost_rule: shippingCostRule || null,
      status: submitForReview ? "pending_review" : "draft",
      is_published: false,
      submitted_at: submitForReview ? new Date().toISOString() : null,
    };

    const { error } = await supabase.from("products").insert(productData);

    if (error) {
      toast({ title: "Failed to Create", description: "Something went wrong. Please try again.", variant: "destructive" });
      setLoading(false);
      return;
    }

    toast({
      title: submitForReview ? "Submitted for Review" : "Draft Saved",
      description: submitForReview
        ? "Your product has been submitted for review. We'll notify you once approved."
        : "Product saved as draft. You can submit it for review when ready.",
    });

    router.push("/seller/products");
  };

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
              <h1 className="text-2xl font-bold text-headline">New Product</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge className="bg-gray-100 text-gray-800 border border-gray-200 text-xs">Draft</Badge>
                <p className="text-sm text-muted-foreground">Fill in the details below to list your product</p>
              </div>
            </div>
          </div>

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
                <div className="space-y-2">
                  <Label>Main Product Image *</Label>
                  {imagePreview ? (
                    <div className="relative w-48 h-48">
                      <img
                        src={imagePreview}
                        alt="Product preview"
                        className="w-full h-full object-cover rounded-lg border border-border"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">Click to upload</span>
                      <span className="text-xs text-muted-foreground">JPG or PNG (min 1200x1200)</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
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

                  {pricingType === "fixed_price" && (
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
                  )}

                  {pricingType === "fixed_price" && (<>
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
              disabled={loading || uploadingImage}
            >
              {loading && !uploadingImage ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileEdit className="h-4 w-4" />
              )}
              Save as Draft
            </Button>
            <Button
              type="button"
              variant="o42Primary"
              className="h-12 px-6 gap-2 sm:ml-auto"
              onClick={() => handleSave(true)}
              disabled={loading || uploadingImage}
            >
              {loading || uploadingImage ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {uploadingImage ? "Uploading..." : "Submitting..."}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit for Review
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateProduct;
