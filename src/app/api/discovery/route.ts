import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { runDiscoverySearch } from "@/lib/runDiscoverySearch";

export async function POST(req: Request) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!url || !key) {
      return NextResponse.json(
        { error: "Supabase is not configured", reply: "Assistant unavailable.", products: [] },
        { status: 503 },
      );
    }

    const { messages } = await req.json();
    const lastUser = [...(messages || [])]
      .reverse()
      .find((m: { role: string }) => m.role === "user");
    const query = lastUser?.content?.trim() || "";

    const supabase = createClient(url, key);
    const result = await runDiscoverySearch(supabase, query);

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: message, reply: "Something went wrong. Please try again.", products: [] },
      { status: 500 },
    );
  }
}
