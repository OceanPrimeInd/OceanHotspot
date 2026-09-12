"use client";

import { supabase } from "@/lib/supabase/client";
import { hasAnalyticsConsent } from "@/lib/cookieConsent";

const SESSION_KEY = "oh_session_id";

export type AnalyticsEventType =
  | "search"
  | "checkout_view"
  | "checkout_start"
  | "checkout_complete"
  | "checkout_abandon";

export function getAnalyticsSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function trackAnalyticsEvent(
  eventType: AnalyticsEventType,
  options?: {
    path?: string;
    userId?: string | null;
    metadata?: Record<string, unknown>;
  },
): void {
  if (!hasAnalyticsConsent()) return;

  const path =
    options?.path ??
    (typeof window !== "undefined" ? window.location.pathname : null);

  void supabase.from("analytics_events" as never).insert({
    event_type: eventType,
    path,
    session_id: getAnalyticsSessionId(),
    user_id: options?.userId ?? null,
    metadata: options?.metadata ?? {},
  } as never).then(({ error }) => {
    if (error) console.warn("Analytics event error:", error.message);
  });
}

export function trackSiteSearch(query: string, userId?: string | null): void {
  const q = query.trim();
  if (q.length < 2) return;
  trackAnalyticsEvent("search", {
    path: "/browse",
    userId,
    metadata: { query: q.slice(0, 200) },
  });
}
