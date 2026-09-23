// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SellerLayout } from "@/components/layout/SellerLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import { isShopOpen } from "@/config/shop";
import {
  Loader2,
  Upload,
  X,
  Check,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  CreditCard,
  CheckCircle2,
} from "lucide-react";

const MAIN_CATEGORIES = [
  { value: "vessels_floating_assets", label: "Vessels & Floating Assets" },
  { value: "propulsion_power", label: "Propulsion & Power" },
  { value: "safety_response", label: "Safety & Response" },
  { value: "maintenance_consumables", label: "Maintenance & Consumables" },
  { value: "fishing_aquaculture", label: "Fishing & Aquaculture" },
  { value: "eco_compliance", label: "Eco & Compliance" },
  { value: "other", label: "Other" },
];

const COUNTRIES = [
  "United Kingdom",
  "United States",
  "France",
  "Germany",
  "Netherlands",
  "Norway",
  "Denmark",
  "Sweden",
  "Spain",
  "Italy",
  "Greece",
  "Portugal",
  "Ireland",
  "Belgium",
  "Canada",
  "Australia",
  "New Zealand",
  "Singapore",
  "Japan",
  "South Korea",
  "China",
  "India",
  "Brazil",
  "South Africa",
  "United Arab Emirates",
  "Saudi Arabia",
  "Turkey",
  "Indonesia",
  "Philippines",
  "Thailand",
  "Vietnam",
  "Malaysia",
  "Mexico",
  "Argentina",
  "Chile",
  "Colombia",
  "Egypt",
  "Nigeria",
  "Kenya",
  "Other",
];

const STEPS = [
  { number: 1, label: "Shop Setup" },
  { number: 2, label: "Payments" },
];

const SellerOnboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const searchParams = useSearchParams();

  // Step 1 - Shop Setup
  const [shopName, setShopName] = useState("");
  const [mainCategory, setMainCategory] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [country, setCountry] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [companyRegistrationNumber, setCompanyRegistrationNumber] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // UI State
  const [loading, setLoading] = useState(false);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [step1Errors, setStep1Errors] = useState<Record<string, string>>({});

  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // Check Stripe account status directly via API (works without webhooks)
  const checkStripeStatus = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const response = await supabase.functions.invoke("check-connect-status", {
        headers: {
          Authorization: `Bearer ${sessionData.session?.access_token}`,
        },
      });

      if (response.error) {
        console.error("Status check error:", response.error);
        return;
      }

      const { charges_enabled, payouts_enabled, details_submitted } = response.data;

      // Refresh profile to pick up the updated fields from the edge function
      await refreshProfile();

      if (charges_enabled && payouts_enabled) {
        toast({
          title: "Stripe Verified!",
          description: "Your payment account is fully set up. You can start selling!",
        });
        router.push("/seller/dashboard");
        return;
      } else if (details_submitted) {
        toast({
          title: "Details Submitted",
          description: "Stripe is reviewing your information. Check back shortly.",
        });
      }
    } catch (err) {
      console.error("Failed to check Stripe status:", err);
    }
  };

  // Handle Stripe Connect return
  useEffect(() => {
    const stripeStatus = searchParams.get("stripe");
    if (stripeStatus === "complete") {
      setCurrentStep(2);
      // Immediately check status via Stripe API (no webhook needed)
      checkStripeStatus();
    } else if (stripeStatus === "refresh") {
      setCurrentStep(2);
      toast({
        title: "Stripe Setup Incomplete",
        description: "Please complete your Stripe account setup to start selling.",
        variant: "destructive",
      });
    }
  }, [searchParams]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/seller/login");
      return;
    }
    if (profile?.is_seller && profile?.company_name) {
      // If Stripe is fully verified (webhook confirmed), go to dashboard
      if (profile.stripe_charges_enabled && profile.stripe_payouts_enabled) {
        router.push("/seller/dashboard");
        return;
      }
      // Otherwise, go to step 2 (payments)
      setCurrentStep(2);
    }
  }, [user, profile, authLoading, router]);

  // --- File Handlers ---
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.match(/^image\/(png|jpeg|jpg|svg\+xml)$/)) {
        toast({ title: "Invalid File", description: "Please upload a PNG, JPG, or SVG file.", variant: "destructive" });
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      setStep1Errors((prev) => ({ ...prev, logoFile: "" }));
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
  };

  // --- Validation ---
  const validateStep1 = (): boolean => {
    const errors: Record<string, string> = {};
    if (!shopName.trim()) errors.shopName = "Shop name is required";
    if (!mainCategory) errors.mainCategory = "Category is required";
    if (!shortDescription.trim()) errors.shortDescription = "Description is required";
    if (shortDescription.length > 200) errors.shortDescription = "Description must be 200 characters or less";
    if (!country) errors.country = "Country is required";
    if (!businessType) errors.businessType = "Business type is required";
    if (businessType === "company" && !companyRegistrationNumber.trim()) errors.companyRegistrationNumber = "Company registration number is required";
    if (!logoFile && !profile?.logo_url) errors.logoFile = "Logo is required";
    if (!termsAccepted) errors.termsAccepted = "You must accept the terms";
    setStep1Errors(errors);
    return Object.keys(errors).length === 0;
  };

  // --- Upload & Submit Step 1 ---
  const uploadFile = async (file: File, path: string): Promise<string | null> => {
    const { error } = await supabase.storage
      .from("product-images")
      .upload(path, file, { upsert: true });
    if (error) {
      console.error("Upload error:", error);
      return null;
    }
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleStep1Submit = async () => {
    if (!validateStep1()) return;
    if (!user) { router.push("/seller/login"); return; }

    setLoading(true);

    let logoUrl = profile?.logo_url || null;
    if (logoFile) {
      const logoExt = logoFile.name.split(".").pop();
      logoUrl = await uploadFile(logoFile, `${user.id}/logo.${logoExt}`);
      if (!logoUrl) {
        toast({ title: "Upload Failed", description: "Could not upload logo.", variant: "destructive" });
        setLoading(false);
        return;
      }
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        is_seller: true,
        company_name: shopName.trim(),
        business_type: businessType,
        business_registration_number: businessType === "company" ? companyRegistrationNumber.trim() : null,
        country: country,
        main_category: mainCategory,
        short_description: shortDescription.trim(),
        logo_url: logoUrl,
      })
      .eq("id", user.id);

    if (error) {
      toast({ title: "Save Failed", description: "Something went wrong. Please try again.", variant: "destructive" });
      setLoading(false);
      return;
    }

    await refreshProfile();
    setLoading(false);
    setCurrentStep(2);
    window.scrollTo(0, 0);
  };

  // --- Stripe Connect ---
  const handleStripeConnect = async () => {
    if (!user) return;

    setStripeLoading(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const response = await supabase.functions.invoke("create-connect-account", {
        body: {
          refreshUrl: `${window.location.origin}/seller/onboarding?stripe=refresh`,
          returnUrl: `${window.location.origin}/seller/onboarding?stripe=complete`,
        },
        headers: {
          Authorization: `Bearer ${sessionData.session?.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to create Stripe account");
      }

      // Check for error in response body (edge function returns 200 with error field)
      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      const { url } = response.data;
      if (url) {
        window.location.href = url;
      } else {
        throw new Error("No onboarding URL returned");
      }
    } catch (err: any) {
      console.error("Stripe Connect error:", err);
      toast({
        title: "Stripe Setup Failed",
        description: err.message || "Could not start Stripe onboarding. Please try again.",
        variant: "destructive",
      });
      setStripeLoading(false);
    }
  };

  const handleSkipStripe = async () => {
    if (!user) return;
    // Mark stripe_ready as false and go to dashboard
    await supabase
      .from("profiles")
      .update({ stripe_ready: false })
      .eq("id", user.id);

    await refreshProfile();
    toast({
      title: "Welcome Aboard!",
      description: "You can connect Stripe later from your dashboard.",
    });
    router.push("/seller/dashboard");
  };

  if (authLoading) {
    return (
      <SellerLayout>
        <div className="container flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </SellerLayout>
    );
  }

  const stripeAccountCreated = !!profile?.stripe_account_id;
  const stripeOnboardingDone = !!profile?.stripe_onboarding_complete;
  const stripeFullyVerified = !!profile?.stripe_charges_enabled && !!profile?.stripe_payouts_enabled;

  const ErrorText = ({ error }: { error?: string }) =>
    error ? <p className="text-xs text-destructive mt-1">{error}</p> : null;

  return (
    <SellerLayout>
      <div className="container max-w-3xl py-8">
        {/* Stepper */}
        <div className="mb-10">
          <div className="flex items-center justify-center">
            {STEPS.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold text-sm transition-all ${
                      currentStep > step.number
                        ? "border-primary bg-primary text-white"
                        : currentStep === step.number
                        ? "border-primary bg-primary text-white"
                        : "border-muted-foreground/30 bg-background text-muted-foreground"
                    }`}
                  >
                    {currentStep > step.number ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <span
                    className={`mt-2 text-xs font-medium whitespace-nowrap ${
                      currentStep >= step.number
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`mx-4 mt-[-20px] h-0.5 w-24 sm:w-40 ${
                      currentStep > step.number
                        ? "bg-primary"
                        : "bg-muted-foreground/20"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Shop Setup */}
        {currentStep === 1 && (
          <div className="animate-slide-up space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-headline">Set Up Your Shop</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Tell us about your business and set up your storefront.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5">
              <div className="space-y-2">
                <Label htmlFor="shopName">Shop name *</Label>
                <Input
                  id="shopName"
                  placeholder="Your store name on Ocean Hotspot"
                  value={shopName}
                  onChange={(e) => { setShopName(e.target.value); setStep1Errors((p) => ({ ...p, shopName: "" })); }}
                  className={`h-12 ${step1Errors.shopName ? "border-destructive" : ""}`}
                />
                <p className="text-xs text-muted-foreground">This is the public name buyers will see</p>
                <ErrorText error={step1Errors.shopName} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Business type *</Label>
                  <Select value={businessType} onValueChange={(v) => { setBusinessType(v); setStep1Errors((p) => ({ ...p, businessType: "" })); }}>
                    <SelectTrigger className={`h-12 ${step1Errors.businessType ? "border-destructive" : ""}`}>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="company">Company</SelectItem>
                    </SelectContent>
                  </Select>
                  <ErrorText error={step1Errors.businessType} />
                </div>
                <div className="space-y-2">
                  <Label>Country *</Label>
                  <Select value={country} onValueChange={(v) => { setCountry(v); setStep1Errors((p) => ({ ...p, country: "" })); }}>
                    <SelectTrigger className={`h-12 ${step1Errors.country ? "border-destructive" : ""}`}>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <ErrorText error={step1Errors.country} />
                </div>
              </div>

              {businessType === "company" && (
                <div className="space-y-2">
                  <Label htmlFor="companyRegistrationNumber">Company Registration Number *</Label>
                  <Input
                    id="companyRegistrationNumber"
                    placeholder="e.g. CIN, CRN, or equivalent"
                    value={companyRegistrationNumber}
                    onChange={(e) => { setCompanyRegistrationNumber(e.target.value); setStep1Errors((p) => ({ ...p, companyRegistrationNumber: "" })); }}
                    className={`h-12 ${step1Errors.companyRegistrationNumber ? "border-destructive" : ""}`}
                  />
                  <p className="text-xs text-muted-foreground">
                    Corporate Identification Number (CIN) in India, or Company Registration Number (CRN) in UK/elsewhere
                  </p>
                  <ErrorText error={step1Errors.companyRegistrationNumber} />
                </div>
              )}

              <div className="space-y-2">
                <Label>What do you sell? *</Label>
                <Select value={mainCategory} onValueChange={(v) => { setMainCategory(v); setStep1Errors((p) => ({ ...p, mainCategory: "" })); }}>
                  <SelectTrigger className={`h-12 ${step1Errors.mainCategory ? "border-destructive" : ""}`}>
                    <SelectValue placeholder="Select your primary category" />
                  </SelectTrigger>
                  <SelectContent>
                    {MAIN_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <ErrorText error={step1Errors.mainCategory} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortDescription">Shop description *</Label>
                <Textarea
                  id="shortDescription"
                  placeholder="Family-run chandlery supplying commercial vessels across Scotland since 1985."
                  value={shortDescription}
                  onChange={(e) => { setShortDescription(e.target.value); setStep1Errors((p) => ({ ...p, shortDescription: "" })); }}
                  maxLength={200}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">{shortDescription.length}/200 characters</p>
                <ErrorText error={step1Errors.shortDescription} />
              </div>

              <div className="space-y-2">
                <Label>Shop logo *</Label>
                {logoPreview ? (
                  <div className="relative w-32 h-32">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-full h-full object-contain rounded-lg border border-border"
                    />
                    <button
                      type="button"
                      onClick={removeLogo}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/50 transition-colors ${step1Errors.logoFile ? "border-destructive" : "border-border"}`}>
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">Click to upload logo</span>
                    <span className="text-xs text-muted-foreground">PNG, JPG, or SVG</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                  </label>
                )}
                <ErrorText error={step1Errors.logoFile} />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => { setTermsAccepted(checked as boolean); setStep1Errors((p) => ({ ...p, termsAccepted: "" })); }}
                />
                <label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                  I confirm the information provided is accurate and I agree to Ocean Hotspot's Seller Terms & Conditions.
                </label>
              </div>
              <ErrorText error={step1Errors.termsAccepted} />
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                variant="o42Primary"
                className="h-12 px-8"
                onClick={handleStep1Submit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    {isShopOpen() ? "Next: Connect Payments" : "Next: Getting paid"}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Stripe Connect (or pre-opening placeholder) */}
        {currentStep === 2 && (
          <div className="animate-slide-up space-y-6">
            {!isShopOpen() ? (
              <>
                <div>
                  <h1 className="text-2xl font-bold text-headline">Getting paid</h1>
                  <p className="mt-1 text-sm text-muted-foreground">Coming soon</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-8 shadow-sm space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Payments open when the shop opens. We will set up your payout details with you before your first
                    sale. You pay nothing until something sells.
                  </p>
                  <p className="text-sm text-foreground">
                    I agree to the supplier terms and privacy policy (confirmed at sign-up).
                  </p>
                  <Button variant="o42Primary" className="h-12" onClick={() => router.push("/seller/dashboard")}>
                    Load your products
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <>
            <div>
              <h1 className="text-2xl font-bold text-headline">Connect Payments</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Connect your Stripe account to receive payments. Stripe handles all identity verification and compliance.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
              {stripeFullyVerified ? (
                // STATE 3: Fully verified by Stripe webhook
                <div className="text-center space-y-4">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-headline">Stripe Verified</h2>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Your payment account is fully verified and ready to receive payments from buyers.
                  </p>
                  <Button
                    variant="o42Primary"
                    className="h-12 px-8"
                    onClick={() => router.push("/seller/dashboard")}
                  >
                    Go to Seller Dashboard
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ) : stripeOnboardingDone ? (
                // STATE 2: Submitted details to Stripe, waiting for webhook confirmation
                <div className="text-center space-y-4">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                    <Loader2 className="h-8 w-8 text-amber-600 animate-spin" />
                  </div>
                  <h2 className="text-xl font-semibold text-headline">Verification In Progress</h2>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Stripe is reviewing your details. This usually takes a few minutes but can take up to 24 hours. You'll be notified once verified.
                  </p>
                  <div className="bg-muted/50 rounded-lg p-4 text-left space-y-2 max-w-sm mx-auto">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-muted-foreground">Details submitted to Stripe</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Loader2 className="h-4 w-4 text-amber-500 animate-spin flex-shrink-0" />
                      <span className="text-muted-foreground">Identity verification pending</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30 flex-shrink-0" />
                      <span className="text-muted-foreground">Payments & payouts activation</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 pt-2">
                    <Button
                      variant="outline"
                      className="h-11"
                      onClick={checkStripeStatus}
                    >
                      Check Status
                    </Button>
                    <Button
                      variant="ghost"
                      className="h-10 text-muted-foreground"
                      onClick={handleSkipStripe}
                    >
                      Continue to Dashboard — I'll check back later
                    </Button>
                  </div>
                </div>
              ) : (
                // STATE 1: Not started yet
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      <CreditCard className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold text-headline mb-2">
                      Set Up Stripe Payments
                    </h2>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      You'll be redirected to Stripe to complete your account setup. Stripe handles all identity verification and compliance securely.
                    </p>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                    <h3 className="text-sm font-medium">What Stripe will handle:</h3>
                    <div className="space-y-2">
                      {[
                        "Identity verification (KYC)",
                        "Bank account or debit card for payouts",
                        "Tax information collection",
                        "Compliance with local regulations",
                      ].map((item) => (
                        <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <Button
                      variant="o42Primary"
                      className="h-12 gap-2"
                      onClick={handleStripeConnect}
                      disabled={stripeLoading}
                    >
                      {stripeLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Connecting to Stripe...
                        </>
                      ) : (
                        <>
                          <ExternalLink className="h-4 w-4" />
                          Connect with Stripe
                        </>
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      className="h-10 text-muted-foreground"
                      onClick={handleSkipStripe}
                    >
                      Skip for now — I'll set this up later
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {!stripeOnboardingDone && !stripeFullyVerified && (
              <div className="flex justify-start">
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 px-8"
                  onClick={() => { setCurrentStep(1); window.scrollTo(0, 0); }}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </div>
            )}
              </>
            )}
          </div>
        )}

        <p className="mt-6 text-center text-xs text-muted-foreground">
          You can update this information later from your dashboard.
        </p>
      </div>
    </SellerLayout>
  );
};

export default SellerOnboarding;
