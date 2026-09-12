"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { hasAnalyticsConsent } from "@/lib/cookieConsent";
import { getAnalyticsSessionId } from "@/lib/analytics";

const SKIP_PATHS = ["/admin", "/seller/dashboard", "/seller/products", "/seller/orders"];

function trackPageView(pathname: string, userId: string | undefined) {
  if (!hasAnalyticsConsent()) return;

  const sessionId = getAnalyticsSessionId();
  let referrerHost: string | null = null;
  try {
    if (typeof document !== "undefined" && document.referrer) {
      referrerHost = new URL(document.referrer).hostname;
    }
  } catch {
    referrerHost = null;
  }

  const userAgent =
    typeof navigator !== "undefined"
      ? navigator.userAgent.slice(0, 500)
      : null;

  void supabase.from("page_views" as never).insert({
    path: pathname,
    session_id: sessionId,
    user_id: userId || null,
    referrer: referrerHost,
    user_agent: userAgent,
  } as never).then(({ error }: { error?: { message?: string } | null } = {}) => {
    if (error) console.warn("Page tracking error:", error.message);
  });
}

export function usePageTracking() {
  const pathname = usePathname();
  const { user } = useAuth();
  const lastTracked = useRef<{ path: string; time: number } | null>(null);

  useEffect(() => {
    if (!pathname) return;
    if (SKIP_PATHS.some((p) => pathname.startsWith(p))) return;

    const runTracking = () => {
      const now = Date.now();
      if (lastTracked.current?.path === pathname && now - lastTracked.current.time < 3000) return;
      lastTracked.current = { path: pathname, time: now };
      trackPageView(pathname, user?.id);
    };

    runTracking();

    const onConsentChange = () => runTracking();
    window.addEventListener("oh-cookie-consent", onConsentChange);
    return () => window.removeEventListener("oh-cookie-consent", onConsentChange);
  }, [pathname, user?.id]);
}
