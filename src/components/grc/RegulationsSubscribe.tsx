"use client";

import { useState, type ReactNode } from "react";
import { GRC_PLANS } from "@/lib/oceanGrc";

export function RegulationsSubscribe({
  subscribed = false,
  cancelled = false,
}: {
  subscribed?: boolean;
  cancelled?: boolean;
}) {
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function subscribe(tier: string) {
    setError(null);
    setPending(tier);
    try {
      const response = await fetch("/api/grc/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const body = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !body.url) {
        setError(body.error || "Could not start this subscription.");
        return;
      }
      window.location.href = body.url;
    } catch {
      setError("Could not start this subscription.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="bg-[#eaeded] py-6 md:py-8">
      <div className="page-container">
        <article className="bg-white p-6 shadow-sm md:p-10">
          <p className="text-sm font-semibold text-primary">Regulations</p>
          <h1 className="mt-2 max-w-3xl text-3xl font-bold text-[#0f1111] md:text-4xl">
            Which subscription do you need?
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#333]">
            Pick a plan, then ask a question about your boat. Answers come from SPVC 2025 and
            Workboat Code Edition 3, with the clause and page.
          </p>

          {subscribed && (
            <p className="mt-4 border border-[#9ed9b0] bg-[#d9f5e3] px-4 py-3 text-sm text-[#166534]">
              Subscription started. You can ask a question now.
            </p>
          )}
          {cancelled && (
            <p className="mt-4 border border-[#e3e6e6] bg-[#f7f8f8] px-4 py-3 text-sm text-[#333]">
              Subscription was not started.
            </p>
          )}
          {error && (
            <p className="mt-4 border border-[#f3cdc6] bg-[#fdf1ef] px-4 py-3 text-sm text-[#8a2318]">
              {error}
            </p>
          )}

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {GRC_PLANS.map((plan) => (
              <Plan
                key={plan.id}
                name={plan.name}
                price={plan.priceLabel}
                period={plan.period}
                tagline={plan.tagline}
                features={plan.features}
                action={
                  plan.contact ? (
                    <a
                      href="mailto:oceanhotspotservices@gmail.com?subject=Regulations%20Enterprise"
                      className="inline-flex h-10 w-full items-center justify-center rounded-md border border-[#c5ced6] text-sm font-semibold text-[#0f1111]"
                    >
                      Talk to us
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled={pending === plan.id}
                      onClick={() => subscribe(plan.id)}
                      className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary text-sm font-semibold text-white disabled:opacity-60"
                    >
                      {pending === plan.id ? "Opening checkout…" : plan.buttonLabel}
                    </button>
                  )
                }
              />
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}

function Plan({
  name,
  price,
  period,
  tagline,
  features,
  highlight = false,
  action,
}: {
  name: string;
  price: string;
  period: string;
  tagline: string;
  features: string[];
  highlight?: boolean;
  action: ReactNode;
}) {
  return (
    <section className={`flex flex-col border p-4 ${highlight ? "border-primary" : "border-[#e3e6e6]"} bg-[#f7f8f8]`}>
      <h2 className="text-lg font-bold text-[#0f1111]">{name}</h2>
      <p className="mt-2 text-2xl font-bold text-[#0f1111]">
        {price}
        <span className="text-sm font-semibold text-[#555]">{period}</span>
      </p>
      <p className="mt-2 text-sm leading-6 text-[#333]">{tagline}</p>
      <ul className="mt-3 flex-1 space-y-1 text-sm leading-6 text-[#333]">
        {features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>
      <div className="mt-4">{action}</div>
    </section>
  );
}
