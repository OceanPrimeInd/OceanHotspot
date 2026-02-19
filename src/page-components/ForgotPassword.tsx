// @ts-nocheck
"use client";

import { useState } from "react";
import Link from "next/link";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Mail, CheckCircle } from "lucide-react";


const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Use Supabase built-in password reset which sends via SMTP configured in dashboard
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (error) {
        throw error;
      }

      setSent(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send reset email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container flex min-h-[calc(100vh-12rem)] items-center justify-center py-12">
        <div className="mx-auto w-full max-w-md animate-slide-up">
          <div className="rounded-xl border border-border bg-card p-8 shadow-lg">
            {sent ? (
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-headline mb-2">
                  Check Your Email
                </h1>
                <p className="text-muted-foreground mb-6">
                  We've sent a password reset link to <strong>{email}</strong>.
                  Please check your inbox and spam folder.
                </p>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setSent(false);
                      setEmail("");
                    }}
                  >
                    Try a different email
                  </Button>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/login">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Sign In
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-8 text-center">
                  <div className="mx-auto mb-4 flex h-16 items-center justify-center">
                    <img src="/logo.png" alt="Ocean Hotspot" className="h-12 w-auto" />
                  </div>
                  <h1 className="text-2xl font-bold text-headline">
                    Forgot Password?
                  </h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Enter your email and we'll send you a reset link
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

                  <Button
                    type="submit"
                    variant="o42Primary"
                    className="w-full h-11"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Send Reset Link
                      </>
                    )}
                  </Button>
                </form>

                <p className="mt-6 text-center text-sm text-muted-foreground">
                  <Link
                    href="/login"
                    className="font-medium text-primary hover:underline inline-flex items-center"
                  >
                    <ArrowLeft className="mr-1 h-3 w-3" />
                    Back to Sign In
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ForgotPassword;
