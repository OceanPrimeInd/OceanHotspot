"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  COOKIE_CONSENT_KEY,
  getCookieConsent,
  setCookieConsent,
} from "@/lib/cookieConsent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!getCookieConsent()) {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    setCookieConsent("accepted");
    setVisible(false);
  };

  const reject = () => {
    setCookieConsent("rejected");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-[60] md:bottom-4 md:left-auto md:right-6 md:max-w-md">
      <div className="rounded-xl border border-border bg-card p-4 shadow-lg">
        <p className="text-sm text-foreground">
          We use essential cookies to run the site and optional analytics cookies to improve
          Ocean Hotspot. See our{" "}
          <Link href="/cookies" className="text-primary underline">
            Cookie Policy
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-primary underline">
            Privacy Policy
          </Link>
          .
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" onClick={accept}>
            Accept analytics
          </Button>
          <Button size="sm" variant="outline" onClick={reject}>
            Essential only
          </Button>
          <Button size="sm" variant="ghost" asChild>
            <Link href="/privacy/erasure">Data erasure</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
