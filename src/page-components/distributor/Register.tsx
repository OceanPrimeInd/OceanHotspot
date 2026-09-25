// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DistributorLayout } from "@/components/layout/DistributorLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Truck,
  CheckCircle2,
  ChevronRight,
  Check,
  DollarSign,
  Package,
  Globe,
  Users,
} from "lucide-react";
import {
  PLATFORM_COMMISSION_MARKETING_LABEL,
  PLATFORM_COMMISSION_RATE,
} from "@/config/platform";

const COVERAGE_AREAS = [
  "United Kingdom", "Ireland", "France", "Spain", "Portugal",
  "Netherlands", "Belgium", "Germany", "Scandinavia", "Mediterranean",
  "Middle East", "North America", "Caribbean", "Asia Pacific", "Global",
];

const SPECIALIZATIONS = [
  "Navigation & Electronics", "Safety Equipment", "Propulsion & Engineering",
  "Deck Hardware", "Anchoring & Mooring", "Marine Clothing & PPE",
  "Electrical Systems", "Plumbing & Sanitation", "Interior & Comfort",
  "Commercial Vessels", "Superyachts", "Offshore & Industrial",
  "Fishing Equipment", "Watersports",
];

const STEPS = [
  { number: 1, label: "Company Info" },
  { number: 2, label: "Coverage & Skills" },
  { number: 3, label: "Commission" },
];

export default function Register() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [existingStatus, setExistingStatus] = useState<string | null>(null);
  const [checkingExisting, setCheckingExisting] = useState(false);

  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [yearsInBusiness, setYearsInBusiness] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [commissionRate, setCommissionRate] = useState("10");

  // Check on page load if user already has a distributor record
  useEffect(() => {
    if (!user) return;
    setCheckingExisting(true);
    supabase
      .from("distributors")
      .select("id, status")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setExistingStatus(data.status);
        setCheckingExisting(false);
      });
  }, [user]);

  const toggleArea = (area: string) =>
    setSelectedAreas(prev => prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]);
  const toggleSpec = (spec: string) =>
    setSelectedSpecs(prev => prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]);

  const handleSubmit = async () => {
    if (!companyName || !contactName || !email || selectedAreas.length === 0) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      // Check if already applied
      const { data: existing } = await supabase
        .from("distributors")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        router.push("/distributor/dashboard");
        return;
      }

      const { error } = await supabase.from("distributors").insert({
        user_id: user.id,
        company_name: companyName,
        contact_name: contactName,
        email,
        phone: phone || null,
        location: location || null,
        years_in_business: yearsInBusiness ? parseInt(yearsInBusiness) : null,
        website_url: websiteUrl || null,
        linkedin_url: linkedinUrl || null,
        description: description || null,
        coverage_areas: selectedAreas,
        specializations: selectedSpecs,
        commission_rate: parseFloat(commissionRate) || 10,
        status: "pending",
        // Auto-generate showroom defaults so their public page is ready immediately
        about_text: description || null,
        contact_email: email,
        contact_phone: phone || null,
        showroom_color: "#1a3560",
        showroom_tagline: description
          ? description.split(".")[0].slice(0, 100)
          : `Marine equipment distributor covering ${selectedAreas.slice(0, 2).join(" & ")}`,
        joined_date: new Date().toISOString().split("T")[0],
      });

      if (error) {
        console.error("Distributor insert error:", error);
        throw new Error(error.message);
      }

      setSubmitted(true);
    } catch (err: any) {
      toast({ title: "Error submitting application", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || checkingExisting) {
    return (
      <DistributorLayout>
        <div className="container flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DistributorLayout>
    );
  }

  // ── Already applied: show status screen ──
  if (existingStatus === "pending") {
    return (
      <DistributorLayout>
        <div className="container max-w-lg py-20 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <Truck className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold mb-3">Application Under Review</h1>
          <p className="text-muted-foreground mb-2">
            Your distributor application has been submitted and is awaiting admin approval.
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            We'll notify you once your account is approved. This typically takes 2–3 business days.
          </p>
          <Button asChild variant="outline">
            <Link href="/">Return to Marketplace</Link>
          </Button>
        </div>
      </DistributorLayout>
    );
  }

  if (existingStatus === "approved") {
    router.replace("/distributor/dashboard");
    return null;
  }

  if (existingStatus === "suspended") {
    return (
      <DistributorLayout>
        <div className="container max-w-lg py-20 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <Truck className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold mb-3">Account Suspended</h1>
          <p className="text-muted-foreground mb-8">
            Your distributor account has been suspended. Please contact support for assistance.
          </p>
          <Button asChild variant="outline">
            <Link href="/">Return to Marketplace</Link>
          </Button>
        </div>
      </DistributorLayout>
    );
  }

  // ── Auth gate: must be logged in before filling the form ──
  if (!user) {
    return (
      <DistributorLayout>
        <div className="container max-w-md py-20 text-center">
          <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-5">
            <Truck className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Join Our Distributor Network</h1>
          <p className="text-muted-foreground text-sm mb-8">
            Sign in to your Ocean Hotspot account to start your distributor application. It only takes a few minutes.
          </p>
          <div className="space-y-3">
            <Button asChild variant="o42Primary" className="w-full">
              <Link href="/distributor/login">Sign In to Distributor Centre</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/distributor/signup">Create a Distributor Account</Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-6">
            No stock required · Earn 5–20% commission · Exclusive territory rights
          </p>
        </div>
      </DistributorLayout>
    );
  }

  if (submitted) {
    return (
      <DistributorLayout>
        <div className="container max-w-lg py-20 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold mb-3">Application Submitted!</h1>
          <p className="text-muted-foreground mb-6">
            Our team will review your application and get back to you within 2–3 business days.
          </p>
          <Button asChild variant="o42Primary">
            <Link href="/">Return to Marketplace</Link>
          </Button>
        </div>
      </DistributorLayout>
    );
  }

  return (
    <DistributorLayout>
      <div className="container max-w-3xl py-8">

        {/* Page heading */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-3">
            <Truck className="w-4 h-4" />
            Virtual Distributor Network
          </div>
          <h1 className="text-2xl font-bold">Become a Distributor</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Represent world-class marine brands in your region. No stock required — earn commission on every sale.
          </p>
        </div>

        {/* Benefits row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { icon: DollarSign, label: "Earn 5–20% commission" },
            { icon: Package, label: "No stock required" },
            { icon: Globe, label: "Exclusive territory rights" },
            { icon: Users, label: "500+ marine brands" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="bg-white border border-border rounded-lg p-3 flex items-center gap-2 text-sm font-medium shadow-sm">
              <Icon className="w-4 h-4 text-primary shrink-0" />
              {label}
            </div>
          ))}
        </div>

        {/* Step indicator — matches seller onboarding */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {STEPS.map((s, index) => (
              <div key={s.number} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold text-sm transition-all ${
                    step > s.number
                      ? "border-primary bg-primary text-primary-foreground"
                      : step === s.number
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/30 bg-background text-muted-foreground"
                  }`}>
                    {step > s.number ? <Check className="h-5 w-5" /> : s.number}
                  </div>
                  <span className={`mt-2 text-xs font-medium whitespace-nowrap ${
                    step >= s.number ? "text-primary" : "text-muted-foreground"
                  }`}>
                    {s.label}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`h-0.5 w-16 md:w-24 mx-2 mb-5 transition-colors ${
                    step > s.number ? "bg-primary" : "bg-muted-foreground/20"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form card */}
        <div className="bg-white border border-border rounded-xl shadow-sm p-6 md:p-8">

          {/* Step 1: Company Info */}
          {step === 1 && (
            <div>
              <h2 className="text-lg font-semibold mb-1">Company Information</h2>
              <p className="text-sm text-muted-foreground mb-6">Tell us about your business.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label>Company Name *</Label>
                  <Input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Marine Solutions Ltd" className="mt-1" />
                </div>
                <div>
                  <Label>Contact Name *</Label>
                  <Input value={contactName} onChange={e => setContactName(e.target.value)} placeholder="John Smith" className="mt-1" />
                </div>
                <div>
                  <Label>Email Address *</Label>
                  <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john@marinesolutions.com" className="mt-1" />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+44 7700 900000" className="mt-1" />
                </div>
                <div>
                  <Label>Location / HQ</Label>
                  <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="Southampton, UK" className="mt-1" />
                </div>
                <div>
                  <Label>Years in Business</Label>
                  <Input type="number" min="0" value={yearsInBusiness} onChange={e => setYearsInBusiness(e.target.value)} placeholder="10" className="mt-1" />
                </div>
                <div>
                  <Label>Website</Label>
                  <Input value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} placeholder="https://marinesolutions.com" className="mt-1" />
                </div>
                <div>
                  <Label>LinkedIn</Label>
                  <Input value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/company/..." className="mt-1" />
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button
                  variant="o42Primary"
                  onClick={() => {
                    if (!companyName || !contactName || !email) {
                      toast({ title: "Company name, contact name and email are required", variant: "destructive" });
                      return;
                    }
                    setStep(2);
                    window.scrollTo(0, 0);
                  }}
                >
                  Next: Coverage & Skills
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Coverage & Specializations */}
          {step === 2 && (
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-1">Coverage Areas *</h2>
                <p className="text-sm text-muted-foreground mb-4">Select all regions where you have established contacts or sales channels.</p>
                <div className="flex flex-wrap gap-2">
                  {COVERAGE_AREAS.map(area => (
                    <button key={area} type="button" onClick={() => toggleArea(area)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                        selectedAreas.includes(area)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border hover:border-primary bg-background"
                      }`}>
                      {area}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-1">Specializations</h2>
                <p className="text-sm text-muted-foreground mb-4">Which product categories do you specialise in?</p>
                <div className="flex flex-wrap gap-2">
                  {SPECIALIZATIONS.map(spec => (
                    <button key={spec} type="button" onClick={() => toggleSpec(spec)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                        selectedSpecs.includes(spec)
                          ? "bg-amber-500 text-white border-amber-500"
                          : "border-border hover:border-amber-400 bg-background"
                      }`}>
                      {spec}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <Label>About Your Business</Label>
                <Textarea value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="Describe your sales channels, customer base, industry experience..." rows={4} className="mt-1" />
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => { setStep(1); window.scrollTo(0, 0); }}>Back</Button>
                <Button variant="o42Primary" onClick={() => {
                  if (selectedAreas.length === 0) {
                    toast({ title: "Please select at least one coverage area", variant: "destructive" });
                    return;
                  }
                  setStep(3);
                  window.scrollTo(0, 0);
                }}>
                  Next: Commission <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Commission */}
          {step === 3 && (
            <div>
              <h2 className="text-lg font-semibold mb-1">Commission Rate</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Set your default commission rate. Individual vendor agreements can be negotiated separately. The platform fee is{" "}
                {PLATFORM_COMMISSION_MARKETING_LABEL} on top.
              </p>
              <div className="mb-6">
                <Label>Your Commission (%)</Label>
                <Input type="number" min="1" max="30" value={commissionRate}
                  onChange={e => setCommissionRate(e.target.value)} className="mt-1 w-32 text-xl font-bold" />
              </div>
              <div className="border border-border rounded-lg overflow-hidden mb-6">
                <div className="bg-muted px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Example: £1,000 order
                </div>
                <div className="divide-y divide-border bg-white">
                  {(() => {
                    const exampleOrderTotal = 1000;
                    const platformFee = exampleOrderTotal * PLATFORM_COMMISSION_RATE;
                    const distRate = parseFloat(commissionRate || "0");
                    const distCommission = (exampleOrderTotal * distRate) / 100;
                    return [
                      { label: "Order Total", value: "£1,000.00" },
                      {
                        label: `Your Commission (${commissionRate}%)`,
                        value: `£${distCommission.toFixed(2)}`,
                        color: "text-green-600",
                      },
                      {
                        label: "Platform fee (low commission)",
                        value: `£${platformFee.toFixed(2)}`,
                        color: "text-muted-foreground",
                      },
                      {
                        label: "Vendor Payout",
                        value: `£${(exampleOrderTotal - distCommission - platformFee).toFixed(2)}`,
                        bold: true,
                      },
                    ];
                  })().map(({ label, value, bold, color }) => (
                    <div key={label} className="flex justify-between px-4 py-2.5 text-sm">
                      <span className={bold ? "font-semibold" : ""}>{label}</span>
                      <span className={`font-medium ${color || ""} ${bold ? "font-bold" : ""}`}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800 mb-6">
                <strong>Typical rates:</strong> Standard products 8–12% · High-value equipment 5–8% · Consumables 12–20%
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => { setStep(2); window.scrollTo(0, 0); }}>Back</Button>
                <Button variant="o42Primary" onClick={handleSubmit} disabled={submitting}>
                  {submitting
                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</>
                    : <><Truck className="w-4 h-4 mr-2" />Submit Application</>
                  }
                </Button>
              </div>
            </div>
          )}
        </div>

      </div>
    </DistributorLayout>
  );
}
