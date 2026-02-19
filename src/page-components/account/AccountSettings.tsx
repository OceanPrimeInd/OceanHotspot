// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Loader2, Save, UserCircle, Upload, X } from "lucide-react";

const MARITIME_ROLES = [
  { value: "boat_owner", label: "Boat Owner" },
  { value: "crew", label: "Crew" },
  { value: "fleet_manager", label: "Fleet Manager" },
  { value: "marine_professional", label: "Marine Professional" },
  { value: "enthusiast", label: "Enthusiast" },
];

const AccountSettings = () => {
  const [fullName, setFullName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [maritimeRole, setMaritimeRole] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user, loading: authLoading, refreshProfile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/login");
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

      setFullName(data.full_name || "");
      setFirstName(data.first_name || "");
      setLastName(data.last_name || "");
      setPhone(data.phone || "");
      setCountry(data.country || "");
      setMaritimeRole(data.main_category || "");
      setAvatarUrl(data.logo_url || null);
      setLoading(false);
    };

    fetchProfile();
  }, [user, authLoading, router, toast]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setUploadingAvatar(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/avatar_${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(fileName, file);

    if (uploadError) {
      toast({
        title: "Upload Failed",
        description: "Could not upload your photo. Please try again.",
        variant: "destructive",
      });
      setUploadingAvatar(false);
      return;
    }

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);

    setAvatarUrl(data.publicUrl);
    setUploadingAvatar(false);
    toast({ title: "Photo Uploaded", description: "Your profile photo has been updated." });
  };

  const handleSave = async () => {
    if (!user) return;

    if (!fullName.trim()) {
      toast({ title: "Required", description: "Full name is required.", variant: "destructive" });
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim(),
        first_name: firstName.trim() || null,
        last_name: lastName.trim() || null,
        phone: phone.trim() || null,
        country: country.trim() || null,
        main_category: maritimeRole || null,
        logo_url: avatarUrl,
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

    await refreshProfile();
    toast({ title: "Profile Saved", description: "Your profile has been updated successfully." });
    setSaving(false);
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-6 py-12 md:px-10 lg:px-16">
        <div className="max-w-3xl mx-auto">
          <div className="animate-slide-up">
            {/* Header */}
            <header className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-muted/40 via-background to-muted/20 p-8 md:p-10 shadow-card mb-8">
              <div className="absolute -top-24 right-0 h-56 w-56 rounded-full bg-o42-blue/10 blur-3xl" />
              <div className="relative">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-semibold">
                  Your Account
                </p>
                <h1 className="text-3xl md:text-4xl font-bold text-headline mt-3">Account Settings</h1>
                <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed">
                  Manage your personal information and preferences.
                </p>
              </div>
            </header>

            {/* Profile Photo */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm mb-6">
              <h2 className="text-lg font-semibold mb-4">Profile Photo</h2>
              <div className="flex items-start gap-4">
                {avatarUrl ? (
                  <div className="relative">
                    <img
                      src={avatarUrl}
                      alt="Profile"
                      className="w-24 h-24 object-cover rounded-full border border-border"
                    />
                    <button
                      type="button"
                      onClick={() => setAvatarUrl(null)}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full border-2 border-dashed border-border flex items-center justify-center bg-muted/30">
                    <UserCircle className="h-10 w-10 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      disabled={uploadingAvatar}
                    />
                    <div className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted/50 transition-colors text-sm">
                      {uploadingAvatar ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      {uploadingAvatar ? "Uploading..." : "Upload Photo"}
                    </div>
                  </label>
                  <p className="text-xs text-muted-foreground mt-2">JPG or PNG, recommended 400x400px</p>
                </div>
              </div>
            </div>

            {/* Personal Details */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm mb-6">
              <h2 className="text-lg font-semibold mb-4">Personal Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    placeholder="Your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
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

            {/* Maritime Profile */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm mb-6">
              <h2 className="text-lg font-semibold mb-2">Maritime Profile</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Help us understand how you use the water so we can personalise your experience.
              </p>
              <div className="space-y-2">
                <Label>Your Role</Label>
                <Select value={maritimeRole} onValueChange={setMaritimeRole}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select your maritime role" />
                  </SelectTrigger>
                  <SelectContent>
                    {MARITIME_ROLES.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
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
      </div>
    </Layout>
  );
};

export default AccountSettings;
