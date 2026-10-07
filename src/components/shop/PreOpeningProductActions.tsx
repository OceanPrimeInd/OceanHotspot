"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { isShopOpen } from "@/config/shop";
import { useToast } from "@/hooks/use-toast";
import { openProductRequest } from "@/lib/purchaseRequest";
import { cleanListingCopy } from "@/lib/listingCopy";

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
  vatRate?: number | null;
  compact?: boolean;
};

export function PreOpeningProductActions(props: Props) {
  const { toggleItem, isInWishlist } = useWishlist();
  const { addItem, items } = useCart();
  const { profile } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const inList = isInWishlist(props.productId);
  const inCart = items.some((item) => item.id === props.productId);
  const [productUrl, setProductUrl] = useState("");

  useEffect(() => {
    setProductUrl(`${window.location.origin}/product/${props.productId}`);
  }, [props.productId]);

  if (isShopOpen()) return null;

  const title = cleanListingCopy(props.title);

  const buyNow = () => {
    const customerName = profile?.full_name?.trim() || profile?.company_name?.trim() || "A customer";
    openProductRequest({
      kind: "purchase",
      customerName,
      lines: [
        {
          productId: props.productId,
          title,
          partNumber: props.partNumber,
          supplierName: props.supplierName,
          currency: props.currency,
          unitPrice: props.price,
          quantity: 1,
          productUrl: productUrl || `${window.location.origin}/product/${props.productId}`,
        },
      ],
    });
    router.push("/request");
  };

  const addToBasket = () => {
    addItem({
      id: props.productId,
      title: props.title,
      price: props.price,
      currency: props.currency,
      image_url: props.image_url ?? null,
      seller_id: props.sellerId || "",
      vat_treatment: props.vatTreatment ?? null,
      vat_rate: props.vatRate ?? 20,
      part_number: props.partNumber ?? null,
      supplier_name: props.supplierName ?? null,
    });
    toast({
      title: "Added to cart",
      description: title,
    });
  };

  const toggleWish = () => {
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
      description: title,
    });
  };

  const buttonClass = props.compact
    ? "h-8 w-full min-w-0 gap-1 px-1.5 text-[11px] font-semibold leading-none [&_svg]:!size-3"
    : "h-10 w-full min-w-0 gap-1.5 px-3 text-sm leading-none";

  return (
    <div className={props.compact ? "grid w-full grid-cols-3 items-stretch gap-1.5" : "mt-2 grid grid-cols-3 items-stretch gap-2"} onClick={(e) => e.stopPropagation()}>
      <Button type="button" variant="o42Primary" className={buttonClass} onClick={buyNow}>
        Buy now
      </Button>
      <Button
        type="button"
        variant="outline"
        className={`${buttonClass} ${inCart ? "border-[#9ed9b0] bg-[#d9f5e3] text-[#166534] hover:bg-[#c9efd8] hover:text-[#166534]" : ""}`}
        onClick={addToBasket}
      >
        <ShoppingCart className="shrink-0" />
        Add to cart
      </Button>
      <Button
        type="button"
        variant={inList ? "secondary" : "outline"}
        className={buttonClass}
        onClick={toggleWish}
      >
        <Heart className={`shrink-0 ${inList ? "fill-red-500 text-red-500" : ""}`} />
        {inList ? "On your wish list" : "Add to wish list"}
      </Button>
    </div>
  );
}
