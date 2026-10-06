"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase/client";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import {
  buildRequestWhatsAppMessage,
  needsDeliveryAddress,
  readRequestDraft,
  requestThankYou,
  type RequestDraft,
} from "@/lib/purchaseRequest";

export default function PurchaseRequest() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [draft, setDraft] = useState<RequestDraft | null>(null);
  const [ready, setReady] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const stored = readRequestDraft();
    setDraft(stored);
    const storedName = stored?.customerName?.trim();
    if (storedName && storedName !== "A customer") setName(storedName);
    setReady(true);
  }, []);

  useEffect(() => {
    if (profile?.full_name && !name) setName(profile.full_name);
    if (profile?.email && !email) setEmail(profile.email);
    if (profile?.phone && !phone) setPhone(profile.phone);
  }, [profile, name, email, phone]);

  if (!ready) {
    return (
      <Layout>
        <div className="container max-w-xl py-16 text-sm text-muted-foreground">Loading…</div>
      </Layout>
    );
  }

  if (!draft) {
    return (
      <Layout>
        <div className="container max-w-xl py-16">
          <h1 className="text-2xl font-bold text-headline">Nothing to send yet</h1>
          <p className="mt-3 text-muted-foreground">Choose a product, then press Buy now or More information.</p>
          <Button variant="o42Primary" className="mt-6" asChild>
            <Link href="/browse">Browse products</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const whatsappHref = buildWhatsAppUrl(buildRequestWhatsAppMessage(draft));
  const askForAddress = needsDeliveryAddress(draft.kind);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast({ title: "Add your name and email", variant: "destructive" });
      return;
    }
    if (askForAddress && !address.trim()) {
      toast({ title: "Add where the product should be sent", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const savedMessage = buildRequestWhatsAppMessage({ ...draft, customerName: name.trim() });
    const itemRows = draft.lines.map((line) => ({
      product_id: line.productId || null,
      title: line.title,
      part_number: line.partNumber || null,
      supplier_name: line.supplierName || null,
      currency: line.currency,
      unit_price: line.unitPrice,
      quantity: line.quantity,
      total_price: line.unitPrice * line.quantity,
      product_url: line.productUrl,
    }));

    const requestId = crypto.randomUUID();
    const { error: saveError } = await supabase.from("customer_requests").insert({
      id: requestId,
      kind: draft.kind,
      customer_name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim() || null,
      delivery_address: address.trim() || null,
      whatsapp_message: savedMessage,
      items: itemRows,
    });

    if (saveError) {
      setSubmitting(false);
      toast({
        title: "Could not save this request",
        description: saveError.message,
        variant: "destructive",
      });
      return;
    }

    await supabase.from("customer_request_items").insert(
      itemRows.map((item) => ({ ...item, request_id: requestId })),
    );

    const details = [
      `${name.trim()} has sent these contact details.`,
      `Email: ${email.trim()}`,
      phone.trim() ? `Phone: ${phone.trim()}` : null,
      address.trim() ? `Delivery address: ${address.trim()}` : null,
      "",
      buildRequestWhatsAppMessage({ ...draft, customerName: name.trim() }),
    ]
      .filter((line) => line !== null)
      .join("\n");
    const href = buildWhatsAppUrl(details);
    if (href) window.open(href, "_blank", "noopener,noreferrer");

    const { data, error } = await supabase.functions.invoke("notify-ocean-hotspot", {
      body: {
        type: "customer_followup",
        requestId,
        kind: draft.kind,
        customerName: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        deliveryAddress: address.trim(),
        items: draft.lines.map((line) => ({
          title: line.title,
          part_number: line.partNumber,
          supplier_name: line.supplierName,
          price: line.unitPrice,
          currency: line.currency,
          quantity: line.quantity,
          product_url: line.productUrl,
        })),
      },
    });
    setSubmitting(false);

    if (error || data?.error) {
      toast({
        title: "Details are in WhatsApp",
        description: "Press send there. The email copy could not be sent as well.",
      });
    }
    setSent(true);
  };

  return (
    <Layout>
      <div className="container max-w-xl py-12">
        <h1 className="text-2xl font-bold text-headline">
          {draft.kind === "question" ? "We have your question" : "We have your request"}
        </h1>
        <p className="mt-4 leading-relaxed text-muted-foreground">{requestThankYou(draft)}</p>
        {whatsappHref && (
          <p className="mt-4 text-sm text-muted-foreground">
            WhatsApp should be open with this product already written in. Press send there.{" "}
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">
              Open the message again
            </a>
          </p>
        )}

        {sent ? (
          <p className="mt-8 rounded-xl border border-border bg-muted/30 p-5 text-sm">
            Thank you, {name.trim()}. We have your contact details
            {askForAddress ? " and delivery address" : ""} and will come back to you by email, message, or phone.
          </p>
        ) : (
          <form onSubmit={submit} className="mt-8 space-y-4 rounded-xl border border-border bg-card p-5">
            <div>
              <Label htmlFor="request-name">Your name</Label>
              <Input id="request-name" className="mt-1" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="request-email">Email</Label>
              <Input
                id="request-email"
                type="email"
                className="mt-1"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="request-phone">Phone</Label>
              <Input id="request-phone" className="mt-1" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            {askForAddress && (
              <div>
                <Label htmlFor="request-address">Where should we send it?</Label>
                <Textarea
                  id="request-address"
                  className="mt-1"
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
            )}
            <Button type="submit" variant="o42Primary" className="h-12 w-full" disabled={submitting}>
              {submitting ? "Sending…" : "Send my details"}
            </Button>
          </form>
        )}
      </div>
    </Layout>
  );
}
