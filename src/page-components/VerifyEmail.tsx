// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, RefreshCw } from "lucide-react";

import { SellerLayout } from "@/components/layout/SellerLayout";
import { Layout } from "@/components/layout/Layout";
import { DistributorLayout } from "@/components/layout/DistributorLayout";

const VerifyEmail = () => {
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const email = searchParams.get("email") || "";
  const flow = searchParams.get("flow") || "seller";

  // Cooldown timer for resend
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Start with a 60-second cooldown on page load
  useEffect(() => {
    setCooldown(60);
  }, []);

  // Redirect if no email in params
  useEffect(() => {
    if (!email) {
      router.push("/signup");
    }
  }, [email, router]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Incomplete Code",
        description: "Please enter all 6 digits.",
        variant: "destructive",
      });
      return;
    }

    setVerifying(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "signup",
      });

      if (error) {
        toast({
          title: "Verification Failed",
          description:
            error.message === "Token has expired or is invalid"
              ? "The code has expired or is incorrect. Please try again or request a new code."
              : error.message,
          variant: "destructive",
        });
        setVerifying(false);
        return;
      }

      toast({
        title: "Email Verified!",
        description: "Your email has been verified successfully.",
      });

      // Redirect based on flow
      if (flow === "seller") {
        router.push("/seller/onboarding");
      } else if (flow === "distributor") {
        router.push("/distributor/register");
      } else {
        router.push("/");
      }
    } catch (err) {
      toast({
        title: "Verification Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;

    setResending(true);

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });

      if (error) {
        toast({
          title: "Resend Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Code Resent",
          description: `A new verification code has been sent to ${email}`,
        });
        setCooldown(60);
        setOtp("");
      }
    } catch {
      toast({
        title: "Error",
        description: "Could not resend the code. Please try again.",
        variant: "destructive",
      });
    }

    setResending(false);
  };

  const Wrapper = flow === "seller" ? SellerLayout : flow === "distributor" ? DistributorLayout : Layout;

  return (
    <Wrapper>
      <div className="container flex min-h-[calc(100vh-12rem)] items-center justify-center py-12">
        <div className="mx-auto w-full max-w-md animate-slide-up">
          <div className="rounded-xl border border-border bg-card p-8 shadow-lg">
            {/* Header */}
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 items-center justify-center">
                <img
                  src="/logo.png"
                  alt="Ocean Hotspot"
                  className="h-12 w-auto"
                />
              </div>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-7 w-7 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-headline">
                Verify Your Email
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                We've sent an 6-digit verification code to
              </p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {email}
              </p>
            </div>

            {/* OTP Input */}
            <div className="flex flex-col items-center gap-6">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={setOtp}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>

              <Button
                variant="o42Primary"
                className="w-full h-11"
                onClick={handleVerify}
                disabled={verifying || otp.length !== 6}
              >
                {verifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Email"
                )}
              </Button>
            </div>

            {/* Resend */}
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Didn't receive the code?
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResend}
                disabled={resending || cooldown > 0}
                className="gap-2"
              >
                <RefreshCw
                  className={`h-4 w-4 ${resending ? "animate-spin" : ""}`}
                />
                {cooldown > 0
                  ? `Resend in ${cooldown}s`
                  : "Resend Code"}
              </Button>
            </div>

            {/* Help text */}
            <p className="mt-6 text-center text-xs text-muted-foreground">
              Check your spam folder if you don't see the email. The code
              expires after 60 minutes.
            </p>
          </div>
        </div>
      </div>
    </Wrapper>
  );
};

export default VerifyEmail;
