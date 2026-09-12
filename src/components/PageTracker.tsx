"use client";

import { usePageTracking } from "@/hooks/usePageTracking";

/** Drop this anywhere inside a client boundary to track page views silently. */
export function PageTracker() {
  usePageTracking();
  return null;
}
