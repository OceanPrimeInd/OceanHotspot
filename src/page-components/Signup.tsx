// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SellerLayout } from "@/components/layout/SellerLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, X, Eye, EyeOff } from "lucide-react";


const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp, user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // Redirect if already logged in
  useEffect(() => {
    if (authLoading) return;
    if (user && profile) {
      if (profile.is_seller && profile.company_name) {
        router.push("/seller/dashboard");
      } else if (profile.is_seller && !profile.company_name) {
        router.push("/seller/onboarding");
      } else {
        router.push("/");
      }
    }
  }, [user, profile, authLoading, router]);

  const passwordRules = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(password) },
    { label: "One lowercase letter", met: /[a-z]/.test(password) },
    { label: "One number", met: /[0-9]/.test(password) },
    { label: "One special character (!@#$%^&*)", met: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password) },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please ensure both passwords are the same.",
        variant: "destructive",
      });
      return;
    }

    if (!passwordRules.every((r) => r.met)) {
      toast({
        title: "Weak Password",
        description: "Please meet all password requirements.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const { error } = await signUp(email, password);

    if (error) {
      let message = error.message;
      if (error.message.includes("already registered")) {
        message = "This email is already registered. Please sign in instead.";
      }
      toast({
        title: "Sign Up Failed",
        description: message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    toast({
      title: "Verification Code Sent!",
      description: "Please check your email for the 8-digit verification code.",
    });

    setLoading(false);
    // Navigate to email verification page — Supabase sends the OTP email automatically via SMTP
    router.push(`/verify-email?email=${encodeURIComponent(email)}&flow=seller`);
  };

  return (
    <SellerLayout>
      <div className="container flex min-h-[calc(100vh-12rem)] items-center justify-center py-12">
        <div className="mx-auto w-full max-w-md animate-slide-up">
          <div className="rounded-xl border border-border bg-card p-8 shadow-lg">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 items-center justify-center">
                <img src="/logo.png" alt="Ocean Hotspot" className="h-12 w-auto" />
              </div>
              <h1 className="text-2xl font-bold text-headline">Become a Seller</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Create your seller account on Ocean Hotspot
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
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
                {password.length > 0 && (
                  <div className="space-y-1 pt-1">
                    {passwordRules.map((rule) => (
                      <div key={rule.label} className="flex items-center gap-2 text-xs">
                        {rule.met ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <X className="h-3 w-3 text-muted-foreground" />
                        )}
                        <span className={rule.met ? "text-green-600" : "text-muted-foreground"}>
                          {rule.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="h-11 pr-10"
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
              </div>

              <Button
                type="submit"
                variant="o42Primary"
                className="w-full h-11"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-primary hover:underline"
              >
                Sign In
              </Link>
            </p>

            <p className="mt-2 text-center text-sm text-muted-foreground">
              Looking to buy instead?{" "}
              <Link
                href="/join"
                className="font-medium text-primary hover:underline"
              >
                Create a Buyer Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </SellerLayout>
  );
};

export default Signup;
