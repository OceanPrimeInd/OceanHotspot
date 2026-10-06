"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CONTACT_EMAIL } from "@/config/contact";
import { useWishlist } from "@/contexts/WishlistContext";
import { isShopOpen } from "@/config/shop";
import { WhatsAppLink } from "@/components/shop/WhatsAppButton";
import { buildProductWhatsAppMessage, isWhatsAppConfigured } from "@/lib/whatsapp";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type Props = {
  productId: string;
  title: string;
  price: number;
  currency: string;
  image_url?: string | null;
  partNumber?: string | null;
  supplierName?: string | null;
  sellerId?: string;
  vatTreatment?: string | null;
  compact?: boolean;
};

export function PreOpeningProductActions(props: Props) {
  const { toggleItem, isInWishlist } = useWishlist();
  const { toast } = useToast();
  const inList = isInWishlist(props.productId);
  const [productUrl, setProductUrl] = useState("");

  useEffect(() => {
    setProductUrl(`${window.location.origin}/product/${props.productId}`);
  }, [props.productId]);

  if (isShopOpen()) return null;

  const waMessage = buildProductWhatsAppMessage({
    title: props.title,
    partNumber: props.partNumber,
    priceLabel: props.price > 0 ? `${formatPrice(props.currency, props.price)} ex VAT` : null,
    productUrl,
  });

  return (
    <div className={`flex flex-col gap-2 ${props.compact ? "" : "mt-2"}`} onClick={(e) => e.stopPropagation()}>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant={inList ? "secondary" : "outline"}
          className="gap-1.5"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const wasInList = inList;
            toggleItem({
              id: props.productId,
              title: props.title,
              price: props.price,
              currency: props.currency,
              image_url: props.image_url ?? null,
              seller_id: props.sellerId,
              part_number: props.partNumber ?? null,
              supplier_name: props.supplierName ?? null,
              quantity: 1,
              note: "",
            });
            toast({
              title: wasInList ? "Removed from wish list" : "Added to wish list",
              description: wasInList ? props.title : `${props.title} — view your list anytime from the header.`,
            });
          }}
        >
          <Heart className={`h-4 w-4 ${inList ? "fill-red-500 text-red-500" : ""}`} />
          Wish list
        </Button>
        {isWhatsAppConfigured() ? (
          <WhatsAppLink
            message={waMessage}
            className="inline-flex h-9 items-center rounded-md border border-[#128C7E] bg-[#128C7E]/10 px-3 text-xs font-semibold text-[#128C7E] hover:bg-[#128C7E]/20"
          >
            Ask on WhatsApp
          </WhatsAppLink>
        ) : (
          <Button type="button" size="sm" variant="outline" className="border-primary text-primary" asChild>
            <a href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(props.title)}`}>
              <Mail className="mr-1.5 h-4 w-4" />
              Email us
            </a>
          </Button>
        )}
      </div>
      {!props.compact && (
        <Link href={`/product/${props.productId}`} className="text-xs text-primary hover:underline">
          View details
        </Link>
      )}
    </div>
  );
}
