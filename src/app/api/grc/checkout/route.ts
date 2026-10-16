import { NextResponse } from "next/server";
import { grcPlanById } from "@/lib/oceanGrc";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secret) {
    return NextResponse.json(
      { error: "Stripe is not connected on this server yet. Email oceanhotspotservices@gmail.com to start a subscription." },
      { status: 503 },
    );
  }

  let tier = "";
  try {
    const body = (await request.json()) as { tier?: string };
    tier = body.tier?.trim() || "";
  } catch {
    tier = "";
  }

  const plan = grcPlanById(tier);
  if (!plan || plan.contact) {
    return NextResponse.json({ error: "Choose a Practitioner or Practice subscription." }, { status: 400 });
  }

  const origin = request.headers.get("origin") || "http://localhost:3000";
  const params = new URLSearchParams({
    mode: "subscription",
    success_url: `${origin}/regulations?subscribed=1`,
    cancel_url: `${origin}/regulations?cancelled=1`,
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "gbp",
    "line_items[0][price_data][unit_amount]": String(plan.amountPence),
    "line_items[0][price_data][recurring][interval]": "year",
    "line_items[0][price_data][product_data][name]": `Regulations ${plan.name}`,
    "line_items[0][price_data][product_data][description]": plan.tagline,
    "metadata[product]": "ocean_grc",
    "metadata[tier]": plan.id,
  });

  const stripe = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });

  const payload = (await stripe.json()) as { url?: string; error?: { message?: string } };
  if (!stripe.ok || !payload.url) {
    return NextResponse.json(
      { error: payload.error?.message || "Stripe could not start this subscription." },
      { status: 502 },
    );
  }

  return NextResponse.json({ url: payload.url });
}
