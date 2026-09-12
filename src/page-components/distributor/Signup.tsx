// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DistributorLayout } from "@/components/layout/DistributorLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase/client";
import { Loader2, Truck, Eye, EyeOff, Check, X } from "lucide-react";

const passwordRules = (password: string) => [
  { label: "At least 8 characters", met: password.length >= 8 },
  { label: "One uppercase letter", met: /[A-Z]/.test(password) },
  { label: "One lowercase letter", met: /[a-z]/.test(password) },
  { label: "One number", met: /[0-9]/.test(password) },
  { label: "One special character (!@#$%^&*)", met: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password) },
];

const DistributorSignup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/distributor/register");
    }
  }, [user, authLoading, router]);

  const rules = passwordRules(password);
  const allRulesMet = rules.every(r => r.met);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }

    if (!allRulesMet) {
      toast({ title: "Password doesn't meet requirements", variant: "destructive" });
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/distributor/login`,
      },
    });

    if (error) {
      let message = error.message;
      if (error.message.includes("already registered")) {
        message = "This email is already registered. Please sign in instead.";
      }
      toast({ title: "Sign Up Failed", description: message, variant: "destructive" });
      setLoading(false);
      return;
    }

    // If Supabase auto-confirmed (email confirmation disabled in project),
    // session is immediately available — go straight to the register form
    if (data?.session) {
      router.replace("/distributor/register");
      return;
    }

    toast({
      title: "Verification Code Sent!",
      description: "Please check your email for the 6-digit verification code.",
    });

    setLoading(false);
    router.push(`/verify-email?email=${encodeURIComponent(email)}&flow=distributor`);
  };

  if (authLoading) {
    return (
      <DistributorLayout>
        <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DistributorLayout>
    );
  }

  return (
    <DistributorLayout>
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-border bg-white p-8 shadow-xl">

            {/* Header */}
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 items-center justify-center">
                <img src="/logo.png" alt="Ocean Hotspot" className="h-12 w-auto" />
              </div>
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">Create Distributor Account</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Join the OceanHotspot Distributor Network
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Password rules */}
                {password.length > 0 && (
                  <div className="grid grid-cols-1 gap-1 mt-2">
                    {rules.map(rule => (
                      <div key={rule.label} className={`flex items-center gap-2 text-xs ${rule.met ? "text-green-600" : "text-muted-foreground"}`}>
                        {rule.met
                          ? <Check className="h-3.5 w-3.5 shrink-0" />
                          : <X className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />}
                        {rule.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirm"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className={`h-11 pr-10 ${
                      confirmPassword && confirmPassword !== password
                        ? "border-destructive focus-visible:ring-destructive"
                        : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirmPassword && confirmPassword !== password && (
                  <p className="text-xs text-destructive">Passwords do not match</p>
                )}
              </div>

              <Button
                type="submit"
                variant="o42Primary"
                className="w-full h-11"
                disabled={loading || !allRulesMet || password !== confirmPassword}
              >
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating account...</>
                ) : (
                  "Create Distributor Account"
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/distributor/login" className="font-medium text-primary hover:underline">
                  Sign In
                </Link>
              </p>
              <p className="text-xs text-muted-foreground">
                Looking to buy?{" "}
                <Link href="/login" className="font-medium text-primary hover:underline">Buyer Login</Link>
                {" · "}
                <Link href="/seller/login" className="font-medium text-primary hover:underline">Seller Login</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </DistributorLayout>
  );
};

export default DistributorSignup;
