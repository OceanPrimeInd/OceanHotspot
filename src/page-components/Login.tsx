// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase/client";


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // Redirect if already logged in
  useEffect(() => {
    if (authLoading || !user) return;
    
    const checkRoleAndRedirect = async () => {
      // Check for checkout return URL first (guest trying to buy)
      const checkoutReturn = sessionStorage.getItem("checkout_return");
      if (checkoutReturn) {
        sessionStorage.removeItem("checkout_return");
        router.replace(checkoutReturn);
        return;
      }

      // Check if user is admin first - this takes priority
      const { data: adminRole, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      console.log("Admin role check:", { adminRole, error, userId: user.id });

      if (adminRole) {
        console.log("Redirecting to admin dashboard");
        router.replace("/admin");
        return;
      }

      // Only check profile-based redirect after confirming not admin
      if (profile) {
        if (profile.is_seller && profile.company_name) {
          router.replace("/seller/dashboard");
        } else if (profile.is_seller && !profile.company_name) {
          router.replace("/seller/onboarding");
        } else {
          router.replace("/");
        }
      }
    };

    checkRoleAndRedirect();
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
    <Layout>
      <div className="container flex min-h-[calc(100vh-12rem)] items-center justify-center py-12">
        <div className="mx-auto w-full max-w-md animate-slide-up">
          <div className="rounded-xl border border-border bg-card p-8 shadow-lg">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 items-center justify-center">
                <img src="/logo.png" alt="Ocean Hotspot" className="h-12 w-auto" />
              </div>
              <h1 className="text-2xl font-bold text-headline">Welcome Back</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Sign in to your Ocean Hotspot account
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
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Link
                href="/forgot-password"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                Forgot your password?
              </Link>
            </div>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                href="/join"
                className="font-medium text-primary hover:underline"
              >
                Sign Up
              </Link>
            </p>

            <p className="mt-2 text-center text-sm text-muted-foreground">
              Want to sell on Ocean Hotspot?{" "}
              <a
                href="/sell"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:underline"
              >
                Become a Seller
              </a>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
