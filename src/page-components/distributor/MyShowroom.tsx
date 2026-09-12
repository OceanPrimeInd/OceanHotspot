// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getDistributorNavItems } from "@/config/distributorNavItems";
import {
  Loader2,
  Store,
  ExternalLink,
  Save,
  Eye,
  Globe,
  Image as ImageIcon,
  Palette,
  CheckCircle2,
} from "lucide-react";

export default function DistributorMyShowroom() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [distributorId, setDistributorId] = useState<string | null>(null);
  const [form, setForm] = useState({
    showroom_tagline: "",
    showroom_banner_url: "",
    showroom_logo_url: "",
    showroom_color: "#1a3560",
    website_url: "",
    contact_email: "",
    contact_phone: "",
    instagram_url: "",
    linkedin_url: "",
    about_text: "",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/distributor/showroom");
      return;
    }
    if (!authLoading && user) loadData();
  }, [user, authLoading]);

  const loadData = async () => {
    setLoading(true);
    const { data: dist } = await supabase
      .from("distributors")
      .select("id, company_name, showroom_tagline, showroom_banner_url, showroom_logo_url, showroom_color, website_url, contact_email, contact_phone, instagram_url, linkedin_url, about_text")
      .eq("user_id", user!.id)
      .maybeSingle();

    if (!dist) { router.push("/distributor/register"); return; }

    setDistributorId(dist.id);
    setForm({
      showroom_tagline: dist.showroom_tagline || "",
      showroom_banner_url: dist.showroom_banner_url || "",
      showroom_logo_url: dist.showroom_logo_url || "",
      showroom_color: dist.showroom_color || "#1a3560",
      website_url: dist.website_url || "",
      contact_email: dist.contact_email || "",
      contact_phone: dist.contact_phone || "",
      instagram_url: dist.instagram_url || "",
      linkedin_url: dist.linkedin_url || "",
      about_text: dist.about_text || "",
    });
    setLoading(false);
  };

  const handleSave = async () => {
    if (!distributorId) return;
    setSaving(true);
    const { error } = await supabase
      .from("distributors")
      .update(form)
      .eq("id", distributorId);

    setSaving(false);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const f = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

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
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Store className="w-6 h-6 text-primary" />
              My Shop Page
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              This is your public page on Ocean Hotspot. Customers and vendors can find you here and get in touch.
            </p>
          </div>
          {distributorId && (
            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link href={`/distributor/showrooms/${distributorId}`} target="_blank">
                <Eye className="w-4 h-4" /> See My Page
              </Link>
            </Button>
          )}
        </div>

        {/* Live link */}
        {distributorId && (
          <div className="mb-6 flex items-center gap-3 bg-[#0B1F3B]/5 border border-[#0B1F3B]/20 rounded-xl px-4 py-3">
            <Globe className="w-4 h-4 text-[#0B1F3B] shrink-0" />
            <span className="text-sm text-muted-foreground">Your public page link:</span>
            <Link
              href={`/distributor/showrooms/${distributorId}`}
              target="_blank"
              className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
            >
              View my page <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        )}

        <div className="space-y-6">
          {/* Branding */}
          <section className="bg-card border rounded-xl p-5">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Palette className="w-4 h-4" /> How Your Page Looks
            </h2>
            <div className="grid gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">One-line description</label>
                <Input
                  value={form.showroom_tagline}
                  onChange={f("showroom_tagline")}
                  placeholder="e.g. Marine Equipment Specialists for Southeast Asia"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">About Your Business</label>
                <textarea
                  value={form.about_text}
                  onChange={f("about_text")}
                  rows={4}
                  placeholder="Tell people what you do, where you operate, and what products you specialise in..."
                  className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Main Colour</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.showroom_color}
                    onChange={f("showroom_color")}
                    className="w-12 h-12 rounded border cursor-pointer"
                  />
                  <span className="text-sm text-muted-foreground">Click to pick your brand colour — this will appear on your page.</span>
                </div>
              </div>
            </div>
          </section>

          {/* Media */}
          <section className="bg-card border rounded-xl p-5">
            <h2 className="font-semibold mb-1 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" /> Your Photos
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              Paste a link to an image already online (e.g. from your website or a shared Google Drive photo).
            </p>
            <div className="grid gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Your Logo</label>
                <Input
                  value={form.showroom_logo_url}
                  onChange={f("showroom_logo_url")}
                  placeholder="Paste the link to your logo here"
                />
                {form.showroom_logo_url && (
                  <img src={form.showroom_logo_url} alt="Logo preview" className="mt-2 h-16 object-contain rounded border" />
                )}
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Cover Photo</label>
                <Input
                  value={form.showroom_banner_url}
                  onChange={f("showroom_banner_url")}
                  placeholder="Paste the link to your cover photo here (wide landscape photo works best)"
                />
                {form.showroom_banner_url && (
                  <img src={form.showroom_banner_url} alt="Cover preview" className="mt-2 h-24 w-full object-cover rounded border" />
                )}
              </div>
            </div>
          </section>

          {/* Contact & Social */}
          <section className="bg-card border rounded-xl p-5">
            <h2 className="font-semibold mb-4">How People Can Reach You</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Email Address</label>
                <Input value={form.contact_email} onChange={f("contact_email")} type="email" placeholder="sales@yourcompany.com" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Phone Number</label>
                <Input value={form.contact_phone} onChange={f("contact_phone")} placeholder="+1 234 567 8900" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Your Website</label>
                <Input value={form.website_url} onChange={f("website_url")} placeholder="https://yourcompany.com" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Instagram</label>
                <Input value={form.instagram_url} onChange={f("instagram_url")} placeholder="https://instagram.com/yourpage" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">LinkedIn</label>
                <Input value={form.linkedin_url} onChange={f("linkedin_url")} placeholder="https://linkedin.com/company/yourcompany" />
              </div>
            </div>
          </section>

          {/* Save */}
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full h-11 gap-2 bg-[#0B1F3B] hover:bg-[#0B1F3B]/90 text-white"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
            ) : saved ? (
              <><CheckCircle2 className="w-4 h-4" /> Saved!</>
            ) : (
              <><Save className="w-4 h-4" /> Save Changes</>
            )}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
