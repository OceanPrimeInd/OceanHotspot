const DEFAULT_ORIGINS = [
  "https://www.oceanhotspot.com",
  "https://oceanhotspot.com",
  "http://localhost:5173",
  "http://localhost:3000",
];

function allowedOrigins(): string[] {
  const extra = (Deno.env.get("ALLOWED_ORIGINS") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return [...DEFAULT_ORIGINS, ...extra];
}

export function getCorsHeaders(req?: Request): Record<string, string> {
  const origins = allowedOrigins();
  const origin = req?.headers.get("origin") || "";
  const allowedOrigin = origins.includes(origin) ? origin : origins[0];

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}
