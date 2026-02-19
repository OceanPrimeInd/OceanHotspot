// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Lock, CheckCircle, Eye, EyeOff } from "lucide-react";


const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [validSession, setValidSession] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Listen for PASSWORD_RECOVERY event from Supabase
    // When user clicks the reset link, Supabase redirects with tokens in the URL hash
    // The Supabase client processes them and fires this event
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "PASSWORD_RECOVERY" && session) {
          setValidSession(true);
          setChecking(false);
        } else if (event === "SIGNED_IN" && session) {
          // Also accept SIGNED_IN as the recovery flow may trigger this
          setValidSession(true);
          setChecking(false);
        }
      }
    );

    // Also check if there's already a valid session (e.g. page refresh after recovery)
    const checkExistingSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setValidSession(true);
      }
      // Give auth state change listener a moment to fire for hash-based tokens
      setTimeout(() => {
        setChecking(false);
      }, 1500);
    };

    checkExistingSession();

    return () => subscription.unsubscribe();
  }, []);

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

    if (password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);

    // Sign out and redirect to login after showing success
    setTimeout(async () => {
      await supabase.auth.signOut();
      router.push("/login");
    }, 2000);
  };

  if (checking) {
    return (
      <Layout>
        <div className="container flex min-h-[calc(100vh-12rem)] items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Verifying your reset link...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!validSession) {
    return (
      <Layout>
        <div className="container flex min-h-[calc(100vh-12rem)] items-center justify-center py-12">
          <div className="mx-auto w-full max-w-md text-center">
            <div className="rounded-xl border border-border bg-card p-8 shadow-lg">
              <h1 className="text-2xl font-bold text-headline mb-4">
                Invalid or Expired Link
              </h1>
              <p className="text-muted-foreground mb-6">
                This password reset link is invalid or has expired. Please
                request a new one.
              </p>
              <Button variant="o42Primary" onClick={() => router.push("/forgot-password")}>
                Request New Link
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container flex min-h-[calc(100vh-12rem)] items-center justify-center py-12">
        <div className="mx-auto w-full max-w-md animate-slide-up">
          <div className="rounded-xl border border-border bg-card p-8 shadow-lg">
            {success ? (
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-headline mb-2">
                  Password Updated!
                </h1>
                <p className="text-muted-foreground">
                  Your password has been successfully reset. Redirecting to
                  login...
                </p>
              </div>
            ) : (
              <>
                <div className="mb-8 text-center">
                  <div className="mx-auto mb-4 flex h-16 items-center justify-center">
                    <img src="/logo.png" alt="Ocean Hotspot" className="h-12 w-auto" />
                  </div>
                  <h1 className="text-2xl font-bold text-headline">
                    Reset Password
                  </h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Enter your new password below
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
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

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
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
                        Updating...
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        Update Password
                      </>
                    )}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ResetPassword;
