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
import { Loader2, Store, Eye, EyeOff } from "lucide-react";


const SellerLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (authLoading || !user) return;
    if (profile) {
      if (profile.is_seller && profile.company_name) {
        router.replace("/seller/dashboard");
      } else if (profile.is_seller && !profile.company_name) {
        router.replace("/seller/onboarding");
      } else {
        router.replace("/seller/onboarding");
      }
    }
  }, [user, profile, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    toast({
      title: "Welcome Back!",
      description: "You have successfully logged in.",
    });

    setLoading(false);
  };

  return (
    <SellerLayout>
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center py-12 px-4">
        <div className="w-full max-w-md animate-slide-up">
          <div className="rounded-2xl border border-border bg-white p-8 shadow-xl">
            {/* Header */}
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 items-center justify-center">
                <img src="/logo.png" alt="Ocean Hotspot" className="h-12 w-auto" />
              </div>
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Store className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-headline">Seller Login</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Sign in to your Seller Center account
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-muted-foreground hover:text-primary"
                  >
                    Forgot password?
                  </Link>
                </div>
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
                    Signing in...
                  </>
                ) : (
                  "Sign In to Seller Center"
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border text-center">
              <p className="text-sm text-muted-foreground">
                Don't have a seller account?{" "}
                <Link
                  href="/signup"
                  className="font-medium text-primary hover:underline"
                >
                  Register as a Seller
                </Link>
              </p>
            </div>

            <p className="mt-3 text-center text-xs text-muted-foreground">
              Looking to buy?{" "}
              <Link
                href="/login"
                className="font-medium text-primary hover:underline"
              >
                Buyer Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </SellerLayout>
  );
};

export default SellerLogin;
