/** Returns true when customer checkout / payments are allowed. */
export function isShopCheckoutOpen(): boolean {
  return (
    Deno.env.get("SHOP_OPEN") === "true" ||
    Deno.env.get("CUSTOMER_CHECKOUT_ENABLED") === "true"
  );
}

export function shopClosedResponse(req: Request, cors: Record<string, string>): Response {
  return new Response(
    JSON.stringify({
      error:
        "Online checkout is not open yet. Build your wish list or contact Ocean Hotspot to order.",
    }),
    {
      status: 403,
      headers: { ...cors, "Content-Type": "application/json" },
    },
  );
}
