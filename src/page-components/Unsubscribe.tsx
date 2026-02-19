// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function Unsubscribe() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!email) {
      setStatus("error");
      return;
    }

    const unsubscribe = async () => {
      try {
        const { error } = await supabase.functions.invoke("newsletter-unsubscribe", {
          body: { email },
        });
        if (error) throw error;
        setStatus("success");
      } catch (err) {
        console.error("Unsubscribe error:", err);
        setStatus("error");
      }
    };

    unsubscribe();
  }, [email]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-sm border p-10 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-[#1e40af] mb-1">Ocean Hotspot</h1>
        <p className="text-sm text-gray-500 mb-8">B2B Maritime Marketplace</p>

        {status === "loading" && (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-[#1e40af] mx-auto mb-4" />
            <p className="text-gray-600">Unsubscribing...</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-green-700 mb-2">Successfully Unsubscribed</h2>
            <p className="text-gray-600 mb-6">
              You have been unsubscribed from the Ocean Hotspot newsletter. We are sorry to see you go.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              You can re-subscribe anytime from our website.
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-red-700 mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-6">
              {!email
                ? "No email address was provided."
                : "We couldn't process your request. Please try again later."}
            </p>
          </>
        )}

        <Link
          href="/"
          className="inline-block bg-[#1e40af] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#1e3a8a] transition-colors"
        >
          Back to Ocean Hotspot
        </Link>
      </div>
    </div>
  );
}
