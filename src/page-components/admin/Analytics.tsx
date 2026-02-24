// @ts-nocheck
"use client";

import { BarChart2, ExternalLink } from "lucide-react";

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Google Analytics</h1>
        <p className="text-muted-foreground mt-1">
          View site traffic and performance metrics for Ocean Hotspot.
        </p>
      </div>

      {/* Quick link */}
      <div className="flex gap-3">
        <a
          href="https://analytics.google.com/analytics/web/#/p{propertyId}/reports/intelligenthome"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Open Google Analytics
        </a>
      </div>

      {/* Embedded GA dashboard */}
      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-muted/40">
          <BarChart2 className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-foreground">
            Analytics Dashboard — Measurement ID: G-VFHK2RGBE2
          </span>
        </div>
        <iframe
          src="https://lookerstudio.google.com/embed/reporting/create?c.reportId=&ds.connector=GOOGLE_ANALYTICS&ds.dataSourceId=G-VFHK2RGBE2"
          className="w-full"
          style={{ height: "calc(100vh - 300px)", minHeight: "600px" }}
          frameBorder="0"
          allowFullScreen
        />
      </div>

      {/* Fallback info */}
      <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground mb-1">Access Google Analytics directly</p>
        <p>
          If the embedded view requires sign-in, open Google Analytics in a new tab:{" "}
          <a
            href="https://analytics.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            analytics.google.com
          </a>
          . Select property <strong>G-VFHK2RGBE2</strong> (Ocean Hotspot).
        </p>
      </div>
    </div>
  );
}
