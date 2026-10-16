import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const TARGET = (process.env.GRC_BACKEND_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

function isPublic(path: string[]) {
  return path[0] === "codes" || path[0] === "demo";
}

async function oceanUserId(authorization: string | null) {
  if (!authorization?.startsWith("Bearer ")) return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  const supabase = createClient(url, key);
  const { data, error } = await supabase.auth.getUser(authorization.slice("Bearer ".length));
  if (error || !data.user) return null;
  return data.user.id;
}

async function forward(request: Request, path: string[]) {
  const incoming = new URL(request.url);
  const url = `${TARGET}/${path.join("/")}${incoming.search}`;
  const userId = await oceanUserId(request.headers.get("authorization"));
  if (!isPublic(path) && !userId) {
    return NextResponse.json(
      { detail: "Sign in to Ocean Hotspot to use Regulations." },
      { status: 401 },
    );
  }

  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  if (userId) headers.set("x-ocean-user", userId);

  let response: Response;
  try {
    response = await fetch(url, {
      method: request.method,
      headers,
      body: request.method === "GET" || request.method === "HEAD" ? undefined : await request.text(),
    });
  } catch {
    return NextResponse.json(
      { detail: "The Regulations engine is not running. Start it with services/ocean-grc on port 8000." },
      { status: 503 },
    );
  }

  const body = await response.text();
  return new NextResponse(body, {
    status: response.status,
    headers: { "content-type": response.headers.get("content-type") || "application/json" },
  });
}

type Context = { params: Promise<{ path: string[] }> };

export async function GET(request: Request, context: Context) {
  const { path } = await context.params;
  return forward(request, path);
}

export async function POST(request: Request, context: Context) {
  const { path } = await context.params;
  return forward(request, path);
}

export async function PUT(request: Request, context: Context) {
  const { path } = await context.params;
  return forward(request, path);
}

export async function DELETE(request: Request, context: Context) {
  const { path } = await context.params;
  return forward(request, path);
}
