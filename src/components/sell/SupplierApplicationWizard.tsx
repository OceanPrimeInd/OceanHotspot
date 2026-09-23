// @ts-nocheck — supplier_applications types after migration + typegen
"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { PRODUCT_DOMAIN_CATEGORIES } from "@/config/productCategories";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ChevronRight, ChevronLeft, Download } from "lucide-react";
import { isShopOpen } from "@/config/shop";

const BOAT_TYPES = [
  "Workboats",
  "Fishing boats",
  "RIBs",
  "Motor cruisers",
  "Sailing yachts",
  "All boats up to 24m",
];

const PRODUCT_COUNT_BANDS = ["1–10", "11–50", "51–200", "200+"];

const LOAD_ROUTES = [
  { value: "one_by_one", label: "Enter them one by one" },
  { value: "spreadsheet", label: "Upload a spreadsheet" },
  { value: "ocean_hotspot_loads", label: "Ocean Hotspot loads them for me" },
];

const SUPPLIER_TYPES = ["Manufacturer", "Distributor", "Retailer"];

export function SupplierApplicationWizard() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const [boatTypes, setBoatTypes] = useState<string[]>([]);
  const [makesModels, setMakesModels] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState("");
  const [productCount, setProductCount] = useState("");
  const [loadRoute, setLoadRoute] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [showroomName, setShowroomName] = useState("");
  const [companyReg, setCompanyReg] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [contactName, setContactName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [postcode, setPostcode] = useState("");
  const [supplierType, setSupplierType] = useState("");
  const [consentTerms, setConsentTerms] = useState(false);
  const [consentUpdates, setConsentUpdates] = useState(false);
  const [honeypot, setHoneypot] = useState("");

  const toggleInList = (list: string[], value: string, set: (v: string[]) => void) => {
    set(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);
  };

  const submitApplication = async () => {
    if (honeypot) return;
    if (!consentTerms) {
      toast({ title: "Terms required", description: "Please agree to the supplier terms.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { data, error } = await supabase
      .from("supplier_applications")
      .insert({
        boat_types: boatTypes,
        makes_models: makesModels.trim() || null,
        categories,
        brands: brands.trim() || null,
        product_count: productCount,
        load_route: loadRoute,
        company_name: companyName.trim(),
        showroom_name: showroomName.trim() || null,
        company_reg: companyReg.trim() || null,
        vat_number: vatNumber.trim() || null,
        contact_name: contactName.trim(),
        role: role.trim() || null,
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        website: website.trim() || null,
        postcode: postcode.trim() || null,
        supplier_type: supplierType,
        terms_agreed_at: new Date().toISOString(),
        consent_updates: consentUpdates,
      })
      .select("id")
      .single();

    if (error) {
      setSubmitting(false);
      toast({
        title: "Could not submit",
        description: error.message.includes("supplier_applications")
          ? "Run the supplier_applications migration in Supabase, then try again."
          : error.message,
        variant: "destructive",
      });
      return;
    }

    await supabase.functions.invoke("notify-ocean-hotspot", {
      body: {
        type: "supplier_application",
        applicationId: data.id,
        companyName: companyName.trim(),
        email: email.trim().toLowerCase(),
        contactName: contactName.trim(),
        loadRoute,
        phone: phone.trim(),
        supplierType,
        boatTypes,
        categories,
      },
    });

    setSubmitting(false);
    setDone(true);
  };

  if (done) {
    return (
      <div className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 p-6 space-y-4">
        <h3 className="text-xl font-bold text-headline">Welcome to Ocean Hotspot</h3>
        <p className="text-sm text-muted-foreground">
          Your supplier application is with us. Next, load your products — create your account and showroom, then add
          products or upload a spreadsheet.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" asChild>
            <a href="/ocean-hotspot-product-template.csv" download>
              <Download className="mr-2 h-4 w-4" />
              Download product template (CSV)
            </a>
          </Button>
          <Button variant="o42Primary" asChild>
            <Link href="/signup">Create supplier account</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-2xl border border-border bg-muted/20 p-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">Start</p>
      <h3 className="text-lg font-bold text-headline mb-4">What boat? — tell us about your range</h3>

      {step === 1 && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Which boats do your products fit? Customers search by their boat, so this is how they find you.
          </p>
          <div className="flex flex-wrap gap-2">
            {BOAT_TYPES.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => toggleInList(boatTypes, b, setBoatTypes)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                  boatTypes.includes(b) ? "border-primary bg-primary/10 text-primary" : "border-border bg-white"
                }`}
              >
                {b}
              </button>
            ))}
          </div>
          <div>
            <Label htmlFor="makes">Makes and models your products fit (optional)</Label>
            <Textarea id="makes" rows={2} value={makesModels} onChange={(e) => setMakesModels(e.target.value)} />
          </div>
          <Button
            type="button"
            variant="o42Primary"
            disabled={boatTypes.length === 0 && !makesModels.trim()}
            onClick={() => setStep(2)}
          >
            Next <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <p className="text-sm font-medium">What do you have to sell?</p>
          <div className="flex flex-wrap gap-2">
            {PRODUCT_DOMAIN_CATEGORIES.filter((c) => c.value !== "services").map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => toggleInList(categories, cat.label, setCategories)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                  categories.includes(cat.label) ? "border-primary bg-primary/10 text-primary" : "border-border bg-white"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <div>
            <Label htmlFor="brands">Brands you make or sell</Label>
            <Input id="brands" value={brands} onChange={(e) => setBrands(e.target.value)} />
          </div>
          <div>
            <Label>Roughly how many products?</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {PRODUCT_COUNT_BANDS.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setProductCount(b)}
                  className={`rounded-full border px-3 py-1.5 text-xs ${
                    productCount === b ? "border-primary bg-primary/10 text-primary" : "border-border"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label>How would you like to load your products?</Label>
            <div className="mt-2 space-y-2">
              {LOAD_ROUTES.map((r) => (
                <label key={r.value} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="loadRoute"
                    checked={loadRoute === r.value}
                    onChange={() => setLoadRoute(r.value)}
                  />
                  {r.label}
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setStep(1)}>
              <ChevronLeft className="mr-1 h-4 w-4" /> Back
            </Button>
            <Button
              type="button"
              variant="o42Primary"
              disabled={!categories.length || !productCount || !loadRoute}
              onClick={() => setStep(3)}
            >
              Next <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <p className="text-sm font-medium">Your business</p>
          <input
            type="text"
            name="company_website_confirm"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Company name *</Label>
              <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
            </div>
            <div>
              <Label>Showroom name (if different)</Label>
              <Input value={showroomName} onChange={(e) => setShowroomName(e.target.value)} />
            </div>
            <div>
              <Label>Company registration number</Label>
              <Input value={companyReg} onChange={(e) => setCompanyReg(e.target.value)} />
            </div>
            <div>
              <Label>VAT number (if registered)</Label>
              <Input value={vatNumber} onChange={(e) => setVatNumber(e.target.value)} />
            </div>
            <div>
              <Label>Contact name *</Label>
              <Input value={contactName} onChange={(e) => setContactName(e.target.value)} required />
            </div>
            <div>
              <Label>Role</Label>
              <Input value={role} onChange={(e) => setRole(e.target.value)} />
            </div>
            <div>
              <Label>Email *</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label>Phone *</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </div>
            <div>
              <Label>Website (optional)</Label>
              <Input value={website} onChange={(e) => setWebsite(e.target.value)} />
            </div>
            <div>
              <Label>Business postcode</Label>
              <Input value={postcode} onChange={(e) => setPostcode(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Who are you? *</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {SUPPLIER_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSupplierType(t)}
                  className={`rounded-full border px-3 py-1.5 text-xs ${
                    supplierType === t ? "border-primary bg-primary/10 text-primary" : "border-border"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setStep(2)}>
              <ChevronLeft className="mr-1 h-4 w-4" /> Back
            </Button>
            <Button
              type="button"
              variant="o42Primary"
              disabled={
                !companyName.trim() ||
                !contactName.trim() ||
                !email.trim() ||
                !phone.trim() ||
                !supplierType
              }
              onClick={() => setStep(4)}
            >
              Next <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <h4 className="font-semibold">Getting paid</h4>
          <p className="text-sm text-muted-foreground">
            {isShopOpen()
              ? "Payments open when the shop opens. We will set up your payout details with you before your first sale."
              : "Coming soon. Payments open when the shop opens. We will set up your payout details with you before your first sale."}{" "}
            You pay nothing until something sells.
          </p>
          <div className="flex items-start gap-2">
            <Checkbox id="sup-terms" checked={consentTerms} onCheckedChange={(c) => setConsentTerms(!!c)} />
            <label htmlFor="sup-terms" className="text-sm leading-snug cursor-pointer">
              I agree to the{" "}
              <Link href="/terms/supplier" className="text-primary underline" target="_blank">
                supplier terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-primary underline" target="_blank">
                privacy policy
              </Link>
            </label>
          </div>
          <div className="flex items-start gap-2">
            <Checkbox id="sup-updates" checked={consentUpdates} onCheckedChange={(c) => setConsentUpdates(!!c)} />
            <label htmlFor="sup-updates" className="text-sm leading-snug cursor-pointer">
              Keep me up to date on opening day and new features (optional)
            </label>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setStep(3)}>
              <ChevronLeft className="mr-1 h-4 w-4" /> Back
            </Button>
            <Button type="button" variant="o42Primary" onClick={submitApplication} disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit application"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
