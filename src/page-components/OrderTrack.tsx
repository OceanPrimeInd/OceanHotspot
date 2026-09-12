"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase/client";
import { Loader2, Package } from "lucide-react";

export default function OrderTrack() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: fnError } = await supabase.functions.invoke("guest-order", {
      body: {
        order_number: orderNumber.trim(),
        email: email.trim(),
      },
    });

    setLoading(false);

    if (fnError || data?.error || !data?.order) {
      setError(data?.error || fnError?.message || "Order not found. Check email and order number.");
      return;
    }

    const token = data.guestToken;
    if (token) {
      router.push(`/orders/${data.order.id}?token=${encodeURIComponent(token)}`);
    } else {
      router.push(`/orders/${data.order.id}`);
    }
  };

  return (
    <Layout>
      <div className="container max-w-md py-16">
        <div className="text-center mb-8">
          <Package className="mx-auto h-12 w-12 text-primary mb-4" />
          <h1 className="text-2xl font-bold text-headline">Track your order</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Guest checkout? Use the email and order number from your confirmation — no password needed.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="orderNumber">Order number</Label>
            <Input
              id="orderNumber"
              placeholder="OH-001029"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email used at checkout</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-lg p-3">{error}</p>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Find my order"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Have an account?{" "}
          <Link href="/login" className="text-primary underline">
            Log in
          </Link>{" "}
          to see all orders.
        </p>
      </div>
    </Layout>
  );
}
