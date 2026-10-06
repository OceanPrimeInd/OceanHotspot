// @ts-nocheck
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { EmptyState } from "@/components/ui/empty-state";
import { formatPrice } from "@/lib/utils";
import { getPlaceholderSvg } from "@/lib/productPlaceholders";
import { isShopOpen } from "@/config/shop";
import { WhatsAppLink } from "@/components/shop/WhatsAppButton";
import { isWhatsAppConfigured } from "@/lib/whatsapp";
import { buildWishlistWhatsAppMessage } from "@/lib/wishlistMessage";
import { supabase } from "@/lib/supabase/client";
import { CONTACT_EMAIL } from "@/config/contact";
import {
  Heart,
  Trash2,
  ShoppingCart,
  Package,
  ArrowRight,
  Loader2,
  Minus,
  Plus,
} from "lucide-react";

const Wishlist = () => {
  const { items, removeItem, clearWishlist, updateItem } = useWishlist();
  const { addItem: addToCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const shopOpen = isShopOpen();

  const [name, setName] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [mobile, setMobile] = useState("");
  const [postcode, setPostcode] = useState("");
  const [boat, setBoat] = useState("");
  const [boatLocation, setBoatLocation] = useState("");
  const [extraNotes, setExtraNotes] = useState("");
  const [consentContact, setConsentContact] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  useEffect(() => {
    if (user?.email && !email) setEmail(user.email);
  }, [user?.email, email]);

  const handleAddToCart = (item: (typeof items)[0]) => {
    addToCart({
      id: item.id,
      title: item.title,
      price: item.price,
      currency: item.currency,
      image_url: item.image_url,
      seller_id: item.seller_id || "",
      quantity: item.quantity || 1,
    });
    toast({ title: "Added to cart", description: item.title });
  };

  const submitWishlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentContact) {
      toast({ title: "Consent required", description: "Please confirm we may contact you about these items.", variant: "destructive" });
      return;
    }

    if (honeypot) return;

    setSubmitting(true);
    const payloadItems = items.map((i) => ({
      id: i.id,
      title: i.title,
      part_number: i.part_number,
      supplier_name: i.supplier_name,
      price: i.price,
      currency: i.currency,
      quantity: i.quantity || 1,
      note: i.note || "",
    }));

    const { data: fnData, error: fnError } = await supabase.functions.invoke("notify-ocean-hotspot", {
      body: {
        type: "wishlist_request",
        customerName: name.trim(),
        email: email.trim().toLowerCase(),
        mobile: mobile.trim(),
        deliveryPostcode: postcode.trim(),
        boatDescription: boat.trim(),
        boatLocation: boatLocation.trim(),
        contactPreference: mobile.trim() ? "both" : "email",
        extraNotes: extraNotes.trim(),
        consentOpeningAnnounce: false,
        items: payloadItems,
      },
    });

    setSubmitting(false);

    if (fnError || fnData?.error) {
      toast({
        title: "Could not send",
        description:
          fnData?.error ||
          fnError?.message ||
          "Something went wrong. Try again or email us from the contact page.",
        variant: "destructive",
      });
      return;
    }

    setSubmitted(true);
    setSubmittedEmail(email.trim());
  };

  const waMessage = buildWishlistWhatsAppMessage(items, {
    name: name.trim() || "Customer",
    boat: boat.trim(),
    postcode: postcode.trim(),
  });

  if (items.length === 0 && !submitted) {
    return (
      <Layout>
        <div className="container py-12">
          <EmptyState
            icon={Heart}
            title="Your wish list is empty"
            description="Save products here, then send the list to us. We confirm price, availability and delivery."
            actionLabel="Browse products"
            actionHref="/browse"
            secondaryActionLabel="Go home"
            secondaryActionHref="/"
          />
        </div>
      </Layout>
    );
  }

  if (submitted) {
    return (
      <Layout>
        <div className="container max-w-2xl py-16 text-center">
          <Heart className="mx-auto mb-4 h-12 w-12 text-red-500 fill-red-500" />
          <h1 className="text-2xl font-bold text-headline mb-4">Thank you</h1>
          <p className="text-muted-foreground leading-relaxed">
            Your wish list is with us. We will confirm price, availability and delivery for each item, and tell you
            the day we open. A copy is on its way to{" "}
            <span className="font-medium text-foreground">{submittedEmail}</span>.
          </p>
          <Button variant="outline" className="mt-8" asChild>
            <Link href="/browse">Keep browsing</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-5xl py-12">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-headline">
              <Heart className="h-6 w-6 fill-red-500 text-red-500" />
              Your wish list ({items.length})
            </h1>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              These are the products you saved. Change the quantity, then send the list and we will confirm price, availability and delivery.
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={clearWishlist}>
            Clear wish list
          </Button>
        </div>

        <div className="grid gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:flex-row"
            >
              <Link href={`/product/${item.id}`} className="shrink-0">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} className="h-28 w-28 rounded-lg border object-cover" />
                ) : getPlaceholderSvg(item.title) ? (
                  <div className="h-28 w-28 overflow-hidden rounded-lg">{getPlaceholderSvg(item.title)}</div>
                ) : (
                  <div className="flex h-28 w-28 items-center justify-center rounded-lg bg-muted">
                    <Package className="h-10 w-10 text-muted-foreground" />
                  </div>
                )}
              </Link>

              <div className="min-w-0 flex-1">
                {item.supplier_name && (
                  <p className="text-xs font-medium text-muted-foreground">{item.supplier_name}</p>
                )}
                <Link href={`/product/${item.id}`} className="font-medium text-headline hover:text-primary line-clamp-2">
                  {item.title}
                </Link>
                {item.part_number && (
                  <p className="mt-1 text-xs text-muted-foreground">Part number {item.part_number}</p>
                )}
                <p className="mt-2 text-lg font-semibold text-primary">
                  {formatPrice(item.currency, item.price)}{" "}
                  <span className="text-xs font-normal text-muted-foreground">ex VAT</span>
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Quantity</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        updateItem(item.id, { quantity: Math.max(1, (item.quantity || 1) - 1) })
                      }
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-6 text-center text-sm font-medium">{item.quantity || 1}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateItem(item.id, { quantity: (item.quantity || 1) + 1 })}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="mt-3">
                  <Label htmlFor={`note-${item.id}`} className="text-xs text-muted-foreground">
                    Note for this item (optional)
                  </Label>
                  <Textarea
                    id={`note-${item.id}`}
                    rows={2}
                    className="mt-1"
                    value={item.note || ""}
                    onChange={(e) => updateItem(item.id, { note: e.target.value })}
                  />
                </div>

                {shopOpen && (
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="o42Primary" onClick={() => handleAddToCart(item)}>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to basket
                    </Button>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="self-start rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-destructive"
                aria-label="Remove"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <Button variant="outline" asChild>
            <Link href="/browse">
              Keep browsing
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {!shopOpen && (
          <div className="mt-12 rounded-2xl border border-border bg-muted/20 p-6 md:p-8">
            <h2 className="text-xl font-bold text-headline mb-2">Send us your wish list</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              We confirm price, availability and delivery — and tell you when we open.
            </p>

            <form onSubmit={submitWishlist} className="space-y-4">
              <input
                type="text"
                name="company_url"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="wl-name">Your name *</Label>
                  <Input id="wl-name" required value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="wl-email">Email *</Label>
                  <Input id="wl-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="wl-mobile">Mobile (for WhatsApp)</Label>
                  <Input id="wl-mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="wl-postcode">Delivery postcode</Label>
                  <Input id="wl-postcode" value={postcode} onChange={(e) => setPostcode(e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="wl-boat">What boat?</Label>
                <Input id="wl-boat" value={boat} onChange={(e) => setBoat(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="wl-kept">Where is she kept? (optional)</Label>
                <Input id="wl-kept" value={boatLocation} onChange={(e) => setBoatLocation(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="wl-extra">Anything else we should know? (optional)</Label>
                <Textarea id="wl-extra" rows={3} value={extraNotes} onChange={(e) => setExtraNotes(e.target.value)} />
              </div>

              <div className="flex items-start gap-2">
                <Checkbox id="wl-consent" checked={consentContact} onCheckedChange={(c) => setConsentContact(!!c)} />
                <label htmlFor="wl-consent" className="text-sm leading-snug cursor-pointer">
                  Contact me about the items on this list (required)
                </label>
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button type="submit" variant="o42Primary" disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send us your wish list"}
                </Button>
                {isWhatsAppConfigured() ? (
                  <WhatsAppLink
                    message={waMessage}
                    className="inline-flex h-10 items-center rounded-md border border-[#128C7E] px-4 text-sm font-semibold text-[#128C7E] hover:bg-[#128C7E]/10"
                  >
                    Send by WhatsApp
                  </WhatsAppLink>
                ) : (
                  <Button type="button" variant="outline" className="border-[#128C7E] text-[#128C7E]" asChild>
                    <Link href="/contact">Message us instead</Link>
                  </Button>
                )}
              </div>
            </form>

            <p className="mt-4 text-xs text-muted-foreground">
              Or email{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">
                {CONTACT_EMAIL}
              </a>
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Wishlist;
