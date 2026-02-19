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
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff } from "lucide-react";


const MemberSignup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (authLoading) return;
    if (user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast({ title: "Error", description: "Full name is required.", variant: "destructive" });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "Error", description: "Passwords don't match.", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      // Create buyer account via edge function (auto-confirmed, welcome email sent)
      const { data, error: fnError } = await supabase.functions.invoke("buyer-signup", {
        body: {
          email: email.trim(),
          password,
          fullName: fullName.trim(),
        },
      });

      if (fnError || data?.error) {
        toast({
          title: "Sign Up Failed",
          description: data?.error || fnError?.message || "Could not create your account.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Sign in immediately (account is auto-confirmed)
      const { error: signInError } = await signIn(email.trim(), password);

      if (signInError) {
        toast({
          title: "Account Created",
          description: "Your account was created. Please sign in.",
        });
        router.push("/login");
        setLoading(false);
        return;
      }

      toast({
        title: "Welcome to Ocean Hotspot!",
        description: "Your account has been created. Check your email for a welcome message.",
      });

      router.push("/");
    } catch (err) {
      toast({
        title: "Sign Up Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }

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
              <h1 className="text-2xl font-bold text-headline">Create Your Account</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Sign up to browse and buy marine products
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Smith"
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
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
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
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
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Sign In
              </Link>
            </p>

            <p className="mt-2 text-center text-sm text-muted-foreground">
              Want to sell on Ocean Hotspot?{" "}
              <Link href="/signup" className="font-medium text-primary hover:underline">
                Become a Seller
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MemberSignup;
