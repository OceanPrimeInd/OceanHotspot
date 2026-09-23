// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useRecentlyViewed } from "@/contexts/RecentlyViewedContext";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/utils";
import { getProductCategoryLabel } from "@/config/productCategories";
import { isShopOpen } from "@/config/shop";
import { WhatsAppLink } from "@/components/shop/WhatsAppButton";
import { buildProductWhatsAppMessage } from "@/lib/whatsapp";
import { OpeningSoonWatermark } from "@/components/launch/OpeningSoonWatermark";
import { ProductReviews } from "@/components/ProductReviews";
import { ProductImageGallery } from "@/components/product/ProductImageGallery";
import {
  Loader2,
  Package,
  MessageSquare,
  CheckCircle,
  Pencil,
  Settings,
  ShoppingCart,
  ShieldCheck,
  Check,
  Heart,
  Store,
  ExternalLink,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface Product {
  id: string;
  seller_id: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  entity_type: string | null;
  domain_category: string | null;
  image_url: string | null;
  images: string[] | null;
  vat_treatment: string | null;
  vat_rate: number | null;
  availability_status: string | null;
  lead_time_text: string | null;
  shipping_cost_rule: string | null;
  ships_from: string | null;
  part_number: string | null;
  technical_detail: string | null;
  fits: string | null;
  replaces: string | null;
  supplier_note: string | null;
  condition: string | null;
  brand: string | null;
  pricing_type: string | null;
  created_at: string;
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [showEnquiryForm, setShowEnquiryForm] = useState(false);
  const { user } = useAuth();
  const { addItem, items } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();
  const { addItem: addToRecentlyViewed } = useRecentlyViewed();
  const { toast } = useToast();
  const [addedToCart, setAddedToCart] = useState(false);
  const [sellerShowroom, setSellerShowroom] = useState<{
    slug: string;
    brand_name: string;
    logo_url: string | null;
    tagline: string | null;
    company_name: string | null;
  } | null>(null);

  const isOwner = user && product && user.id === product.seller_id;
  const checkoutLive = isShopOpen();
  const supplierLabel =
    sellerShowroom?.brand_name || sellerShowroom?.company_name || null;
  const isInCart = product && items.some((item) => item.id === product.id);
  const inWishlist = product ? isInWishlist(product.id) : false;

  const handleToggleWishlist = () => {
    if (!product) return;
    toggleItem({
      id: product.id,
      title: product.title,
      price: product.price,
      currency: product.currency,
      image_url: product.image_url,
      description: product.description,
      entity_type: product.entity_type,
      domain_category: product.domain_category,
      seller_id: product.seller_id,
      part_number: product.part_number,
      supplier_name: supplierLabel,
      quantity: 1,
      note: "",
    });
    toast({
      title: inWishlist ? "Removed from wishlist" : "Added to wishlist",
      description: inWishlist
        ? `${product.title} has been removed from your wishlist.`
        : `${product.title} has been added to your wishlist.`,
    });
  };

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      currency: product.currency,
      image_url: product.image_url,
      seller_id: product.seller_id,
      vat_treatment: product.vat_treatment,
      vat_rate: product.vat_rate ?? 20,
    });
    setAddedToCart(true);
    toast({
      title: "Added to cart!",
      description: `${product.title} has been added to your cart.`,
    });
    // Reset button state after 2 seconds
    setTimeout(() => setAddedToCart(false), 2000);
  };

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .eq("is_published", true)
        .maybeSingle();

      if (!error && data) {
        // Track recently viewed
        addToRecentlyViewed({
          id: data.id,
          title: data.title,
          price: data.price,
          currency: data.currency,
          image_url: data.image_url,
          entity_type: data.entity_type,
          domain_category: data.domain_category,
        });
        setProduct(data);

        // Auto-open enquiry form for non-fixed-price products
        if (isShopOpen() && data.pricing_type && data.pricing_type !== "fixed_price") {
          setShowEnquiryForm(true);
        }

        // Fetch seller's published showroom
        const { data: showroomData } = await supabase
          .from("showrooms")
          .select("slug, brand_name, logo_url, tagline")
          .eq("seller_id", data.seller_id)
          .eq("is_published", true)
          .maybeSingle();

        if (showroomData) {
          // Fetch seller's company name from profiles
          const { data: profileData } = await supabase
            .from("profiles")
            .select("company_name")
            .eq("id", data.seller_id)
            .maybeSingle();
          setSellerShowroom({
            ...showroomData,
            company_name: profileData?.company_name ?? null,
          });
        }
      }
      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  const handleSendEnquiry = async () => {
    if (!product || !message.trim()) {
      toast({
        title: "Message Required",
        description: "Please enter a message for the seller.",
        variant: "destructive",
      });
      return;
    }

    if (!buyerEmail.trim() || !buyerName.trim()) {
      toast({
        title: "Contact Info Required",
        description: "Please enter your name and email.",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(buyerEmail.trim())) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setSending(true);

    // Insert enquiry (buyer_id is now optional for guest submissions)
    const { error } = await supabase.from("enquiries").insert({
      product_id: product.id,
      seller_id: product.seller_id,
      message: message.trim(),
      buyer_name: buyerName.trim(),
      buyer_email: buyerEmail.trim(),
      buyer_phone: buyerPhone.trim() || null,
    });

    if (error) {
      console.error("Enquiry error:", error);
      toast({
        title: "Failed to Send",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setSending(false);
      return;
    }

    // Fetch seller profile for email notification
    const { data: sellerProfile } = await supabase
      .from("profiles")
      .select("email, company_name")
      .eq("id", product.seller_id)
      .maybeSingle();

    // Send email notification to seller (fire and forget)
    if (sellerProfile?.email) {
      supabase.functions.invoke("send-email", {
        body: {
          type: "enquiry_notification",
          to: sellerProfile.email,
          data: {
            productTitle: product.title,
            message: message.trim(),
            buyerEmail: buyerEmail.trim(),
            buyerName: buyerName.trim(),
            dashboardUrl: `${window.location.origin}/seller/enquiries`,
          },
        },
      }).catch((err) => console.error("Failed to send notification email:", err));
    }

    setSent(true);
    setSending(false);
    setMessage("");
    setBuyerName("");
    setBuyerEmail("");
    setBuyerPhone("");
    toast({
      title: "Enquiry Sent!",
      description: "The seller will receive your message shortly.",
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="container flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <Package className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold text-headline mb-2">
            Product Not Found
          </h1>
          <p className="text-muted-foreground mb-6">
            This product may have been removed or is no longer available.
          </p>
          <Button variant="o42Primary" asChild>
            <Link href="/browse">Browse Products</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-12">
        {/* Breadcrumb Navigation */}
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/browse">Browse</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {product.domain_category && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href={`/browse?domain=${encodeURIComponent(product.domain_category)}`}>
                      {getProductCategoryLabel(product.domain_category)}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            )}
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="max-w-[200px] truncate">
                {product.title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid lg:grid-cols-2 gap-12 animate-slide-up">
          {/* Product Image */}
          {/* Product Image Gallery */}
          <div className="relative">
            <ProductImageGallery
              images={[
                ...(product.image_url ? [product.image_url] : []),
                ...(product.images || []),
              ].filter((img, idx, arr) => arr.indexOf(img) === idx)}
              title={product.title}
            />
            {!checkoutLive && !isOwner && <OpeningSoonWatermark />}
          </div>

          {/* Product Details */}
          <div>
            {/* Category badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {product.entity_type && (
                <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  {product.entity_type}
                </span>
              )}
              {product.domain_category && (
                <span className="inline-flex items-center rounded-full bg-secondary/10 px-3 py-1 text-sm font-medium text-secondary">
                  {getProductCategoryLabel(product.domain_category)}
                </span>
              )}
            </div>

            <h1 className="text-3xl font-bold text-headline mb-2">
              {product.title}
            </h1>
            {product.part_number && (
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Part number: {product.part_number}
              </p>
            )}

            {/* Product meta */}
            <div className="flex flex-wrap gap-2 mb-4 text-sm text-muted-foreground">
              {product.brand && <span>By {product.brand}</span>}
              {product.condition && (
                <>
                  <span>•</span>
                  <span className="capitalize">{product.condition.replace("_", " ")}</span>
                </>
              )}
            </div>

            {product.pricing_type === "poa" ? (
              <div className="mb-6">
                <p className="text-2xl font-bold text-primary">POA</p>
                <p className="text-sm text-muted-foreground mt-1">Price on Application — contact us for pricing details</p>
              </div>
            ) : product.pricing_type === "contact_us" ? (
              <div className="mb-6">
                <p className="text-2xl font-bold text-primary">Contact Us</p>
                <p className="text-sm text-muted-foreground mt-1">Get in touch for more information and pricing</p>
              </div>
            ) : product.pricing_type === "coming_soon" ? (
              <div className="mb-6">
                <span className="inline-block bg-muted text-muted-foreground text-sm font-semibold px-4 py-2 rounded-full">Coming Soon</span>
                <p className="text-sm text-muted-foreground mt-2">This product is not yet available. Submit an enquiry to register your interest.</p>
              </div>
            ) : (
              <>
                <p className="text-2xl font-bold text-primary mb-2">
                  {formatPrice(product.currency, product.price)}
                </p>
                {product.vat_treatment === "plus_vat" && (
                  <p className="text-sm text-muted-foreground mb-6">+ VAT ({product.vat_rate ?? 20}%)</p>
                )}
                {product.vat_treatment === "vat_included" && (
                  <p className="text-sm text-muted-foreground mb-6">inc. VAT ({product.vat_rate ?? 20}%)</p>
                )}
              </>
            )}

            {(product.availability_status || product.lead_time_text || product.ships_from) && (
              <div className="mb-6 rounded-lg border border-border bg-muted/30 p-4 text-sm space-y-1">
                {product.availability_status && (
                  <p>
                    <span className="font-semibold text-foreground">Stock: </span>
                    {product.availability_status.replace(/_/g, " ")}
                  </p>
                )}
                {product.lead_time_text && (
                  <p>
                    <span className="font-semibold text-foreground">Delivery: </span>
                    {product.lead_time_text}
                  </p>
                )}
                {product.ships_from && (
                  <p>
                    <span className="font-semibold text-foreground">Ships from: </span>
                    {product.ships_from}
                  </p>
                )}
              </div>
            )}

            <div className="prose prose-slate max-w-none mb-8 space-y-4">
              <p className="text-muted-foreground whitespace-pre-wrap">
                {product.description || "No description provided."}
              </p>
              {product.technical_detail && (
                <div>
                  <h2 className="text-lg font-semibold text-headline">Technical detail</h2>
                  <p className="text-muted-foreground whitespace-pre-wrap">{product.technical_detail}</p>
                </div>
              )}
              {product.fits && (
                <p className="text-sm">
                  <span className="font-semibold text-foreground">Fits: </span>
                  {product.fits}
                </p>
              )}
              {product.replaces && (
                <p className="text-sm">
                  <span className="font-semibold text-foreground">Replaces: </span>
                  {product.replaces}
                </p>
              )}
              {product.supplier_note && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-1">Supplier&apos;s note</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{product.supplier_note}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            {isOwner ? (
              <div className="rounded-xl border border-border bg-muted/30 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Settings className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold text-headline">
                    Manage Your Product
                  </h2>
                </div>
                <p className="text-muted-foreground mb-4">
                  This is your product listing. You can edit or manage it from here.
                </p>
                <div className="flex gap-3">
                  <Button variant="o42Primary" asChild>
                    <Link href={`/seller/products/${product.id}/edit`}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit Product
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/seller/dashboard">Go to Dashboard</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {!checkoutLive && (
                  <div className="space-y-3 rounded-xl border border-[rgba(214,31,38,0.35)] bg-[#fff7f7] p-5">
                    <p className="text-sm font-semibold text-[#b3161c]">Order when we open</p>
                    <div className="flex flex-wrap gap-3">
                      <Button
                        variant={inWishlist ? "secondary" : "o42Primary"}
                        size="lg"
                        className="flex-1"
                        onClick={handleToggleWishlist}
                      >
                        <Heart className={`mr-2 h-5 w-5 ${inWishlist ? "fill-red-500 text-red-500" : ""}`} />
                        {inWishlist ? "On your wish list" : "Add to wish list"}
                      </Button>
                      <WhatsAppLink
                        message={buildProductWhatsAppMessage({
                          title: product.title,
                          partNumber: product.part_number,
                          supplierName: supplierLabel,
                          productUrl:
                            typeof window !== "undefined"
                              ? `${window.location.origin}/product/${product.id}`
                              : undefined,
                        })}
                        className="inline-flex h-14 flex-1 items-center justify-center rounded-md border-2 border-[#128C7E] bg-[#128C7E]/10 px-4 text-base font-semibold text-[#128C7E] hover:bg-[#128C7E]/20"
                      >
                        Ask on WhatsApp
                      </WhatsAppLink>
                    </div>
                  </div>
                )}

                {checkoutLive && (
                <>
                {/* Add to Cart & Wishlist Buttons — hidden for POA/Contact Us/Coming Soon */}
                <div className="flex gap-3">
                  {(!product.pricing_type || product.pricing_type === "fixed_price") && (
                  <Button
                    variant={addedToCart || isInCart ? "outline" : "o42Primary"}
                    size="lg"
                    className="flex-1 h-14 text-lg"
                    onClick={handleAddToCart}
                    disabled={addedToCart}
                  >
                    {addedToCart ? (
                      <>
                        <Check className="mr-2 h-5 w-5 text-green-500" />
                        Added to Cart!
                      </>
                    ) : isInCart ? (
                      <>
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        Add Another
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        Add to Cart
                      </>
                    )}
                  </Button>
                  )}

                  {/* Wishlist Button */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="lg"
                        className={`h-14 w-14 ${
                          inWishlist
                            ? "text-red-500 hover:text-red-600 border-red-200 hover:border-red-300"
                            : ""
                        }`}
                        onClick={handleToggleWishlist}
                        aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                      >
                        <Heart
                          className={`h-6 w-6 ${inWishlist ? "fill-current" : ""}`}
                        />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{inWishlist ? "Remove from wishlist" : "Add to wishlist"}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                {/* View Cart Link */}
                {isInCart && (
                  <Button variant="o42Outline" size="lg" className="w-full" asChild>
                    <Link href="/cart">View Cart &rarr;</Link>
                  </Button>
                )}

                {(!product.pricing_type || product.pricing_type === "fixed_price") && (
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 text-green-500" />
                    <span>Secure card payment via Stripe</span>
                  </div>
                )}
                </>
                )}

                {/* Non-fixed-price: show prominent CTA box */}
                {checkoutLive && product.pricing_type && product.pricing_type !== "fixed_price" && (
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <MessageSquare className="h-4 w-4 text-primary" />
                      <p className="font-semibold text-sm text-primary">
                        {product.pricing_type === "poa"
                          ? "Request a Price"
                          : product.pricing_type === "contact_us"
                          ? "Contact Us for More Information"
                          : "Register Your Interest"}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {product.pricing_type === "poa"
                        ? "Fill in the form below and the seller will come back to you with pricing."
                        : product.pricing_type === "contact_us"
                        ? "Fill in the form below and the seller will be in touch with full details."
                        : "This product is coming soon. Leave your details and we'll let you know when it's available."}
                    </p>
                  </div>
                )}

                {checkoutLive && (
                <>
                {/* Enquiry Toggle */}
                <div className="border-t border-border pt-4">
                  <button
                    onClick={() => setShowEnquiryForm(!showEnquiryForm)}
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <MessageSquare className="h-4 w-4" />
                    {showEnquiryForm ? "Hide form" : "Ask a question — we will come back to you"}
                  </button>
                </div>

                {/* Collapsible Enquiry Form */}
                {showEnquiryForm && (
                  <div className="rounded-xl border border-border bg-muted/30 p-6 animate-slide-up">
                    {sent ? (
                      <div className="flex items-center gap-3 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span>Your enquiry has been sent successfully!</span>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="buyerName">Your Name *</Label>
                            <Input
                              id="buyerName"
                              placeholder="John Doe"
                              value={buyerName}
                              onChange={(e) => setBuyerName(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="buyerEmail">Your Email *</Label>
                            <Input
                              id="buyerEmail"
                              type="email"
                              placeholder="john@example.com"
                              value={buyerEmail}
                              onChange={(e) => setBuyerEmail(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="buyerPhone">Phone (Optional)</Label>
                          <Input
                            id="buyerPhone"
                            type="tel"
                            placeholder="+44 123 456 7890"
                            value={buyerPhone}
                            onChange={(e) => setBuyerPhone(e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="message">Message *</Label>
                          <Textarea
                            id="message"
                            placeholder={
                              product.pricing_type === "poa"
                                ? "Please provide pricing for this product. Include quantity and delivery location if relevant."
                                : product.pricing_type === "contact_us"
                                ? "I'd like more information about this product..."
                                : product.pricing_type === "coming_soon"
                                ? "I'm interested in this product. Please notify me when it becomes available."
                                : "Write your message to the seller..."
                            }
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={4}
                          />
                        </div>

                        <Button
                          variant={product.pricing_type && product.pricing_type !== "fixed_price" ? "o42Primary" : "outline"}
                          onClick={handleSendEnquiry}
                          disabled={sending || !message.trim() || !buyerEmail.trim() || !buyerName.trim()}
                          className="w-full"
                        >
                          {sending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Sending...
                            </>
                          ) : product.pricing_type === "poa" ? (
                            "Request a Price"
                          ) : product.pricing_type === "contact_us" ? (
                            "Send My Enquiry"
                          ) : product.pricing_type === "coming_soon" ? (
                            "Register My Interest"
                          ) : (
                            "Send Enquiry"
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
                </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Seller Showroom Card */}
        {sellerShowroom && !isOwner && (
          <div className="mt-12 rounded-xl border border-border bg-linear-to-r from-primary/5 to-secondary/5 p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              {/* Logo */}
              <div className="shrink-0">
                {sellerShowroom.logo_url ? (
                  <img
                    src={sellerShowroom.logo_url}
                    alt={sellerShowroom.brand_name}
                    className="h-16 w-16 rounded-xl object-contain border border-border bg-white p-1"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center border border-border">
                    <Store className="h-8 w-8 text-primary" />
                  </div>
                )}
              </div>
              {/* Info */}
              <div className="flex-1 text-center sm:text-left">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Sold by
                </p>
                <h3 className="text-xl font-bold text-headline">
                  {sellerShowroom.brand_name}
                </h3>
                {sellerShowroom.tagline && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {sellerShowroom.tagline}
                  </p>
                )}
              </div>
              {/* CTA */}
              <div className="shrink-0">
                <Button variant="o42Primary" asChild>
                  <Link href={`/showroom/${sellerShowroom.slug}`}>
                    <Store className="mr-2 h-4 w-4" />
                    Visit Showroom
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Reviews & Q&A Section */}
        {product && <ProductReviews productId={product.id} sellerId={product.seller_id} />}
      </div>
    </Layout>
  );
};

export default ProductDetail;
