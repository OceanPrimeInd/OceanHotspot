"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/contexts/WishlistContext";
import { isShopOpen } from "@/config/shop";
import { WhatsAppLink } from "@/components/shop/WhatsAppButton";
import { buildProductWhatsAppMessage, isWhatsAppConfigured } from "@/lib/whatsapp";
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
  if (isShopOpen()) return null;

  const { toggleItem, isInWishlist } = useWishlist();
  const { toast } = useToast();
  const inList = isInWishlist(props.productId);
  const productUrl =
    typeof window !== "undefined" ? `${window.location.origin}/product/${props.productId}` : undefined;

  const waMessage = buildProductWhatsAppMessage({
    title: props.title,
    partNumber: props.partNumber,
    supplierName: props.supplierName,
    productUrl,
  });

  return (
    <div className={`flex flex-col gap-2 ${props.compact ? "" : "mt-2"}`} onClick={(e) => e.preventDefault()}>
      <p className="text-xs font-medium text-[#b3161c]">Order when we open</p>
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
          <Button type="button" size="sm" variant="outline" className="border-[#128C7E] text-[#128C7E]" asChild>
            <Link href="/contact">Contact us</Link>
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
