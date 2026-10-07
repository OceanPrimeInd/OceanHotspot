import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { isShopOpen } from "@/config/shop";
import { PreOpeningProductActions } from "@/components/shop/PreOpeningProductActions";
import { cleanListingCopy } from "@/lib/listingCopy";
import { isHiddenSupplierBrand } from "@/lib/publicBrand";
import { isMissingProductImage, PRODUCT_IMAGE_UNAVAILABLE } from "@/lib/productImage";

interface Product {
  id: string;
  title: string;
  description?: string | null;
  price: number;
  pricing_type?: string | null;
  currency?: string | null;
  entity_type?: string | null;
  domain_category?: string | null;
  image_url?: string | null;
  images?: string[] | null;
  part_number?: string | null;
  availability_status?: string | null;
  seller_company?: string | null;
  seller_id?: string;
}

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const shopClosed = !isShopOpen();
  const allImages = [
    ...(product.image_url ? [product.image_url] : []),
    ...(product.images || []),
  ].filter((img, idx, arr) => arr.indexOf(img) === idx && !isMissingProductImage(img));

  const hasImage = allImages.length > 0;
  const imageCount = allImages.length;

  const renderPrice = () => {
    switch (product.pricing_type) {
      case "poa":
        return <span className="text-sm font-semibold text-primary">POA — Price on Application</span>;
      case "contact_us":
        return <span className="text-sm font-semibold text-primary">Message us</span>;
      case "coming_soon":
        return <span className="text-sm font-semibold text-amber-600">Coming Soon</span>;
      default:
        return product.price > 0 ? (
          <span className="text-base font-semibold text-foreground">
            {formatPrice(product.currency, product.price)}{" "}
            <span className="text-xs font-normal text-muted-foreground">ex VAT</span>
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">Price on request</span>
        );
    }
  };

  return (
    <div
      className="group flex h-full flex-col overflow-hidden rounded-[18px] border border-[#c5ced6] bg-white"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative aspect-[4/3.45] overflow-hidden bg-[#f3f3f3]">
          {hasImage ? (
            <>
              <img
                src={allImages[0]}
                alt={product.title}
                className="h-full w-full object-contain"
              />
              {imageCount > 1 && (
                <span className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-1 text-[10px] font-medium text-white">
                  +{imageCount - 1} more
                </span>
              )}
            </>
          ) : (
            <div className="flex h-full items-center justify-center px-4 text-center text-3xl font-semibold leading-tight text-[#374151]">
              {PRODUCT_IMAGE_UNAVAILABLE}
            </div>
          )}
          {product.pricing_type === "coming_soon" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-black">
                Coming Soon
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col px-3 pb-3 pt-2">
        <Link href={`/product/${product.id}`}>
          <h3 className="line-clamp-2 min-h-[2.6em] text-[15px] font-medium leading-snug text-[#1f2a37] hover:text-primary">
            {cleanListingCopy(product.title)}
          </h3>
        </Link>
        {product.part_number && (
          <p className="mt-1 text-xs text-muted-foreground">Part no. {product.part_number}</p>
        )}
        {product.seller_company && !isHiddenSupplierBrand(product.seller_company) && (
          <p className="mt-1 text-xs text-[#53616d]">{product.seller_company}</p>
        )}
        <div className="mt-1">{renderPrice()}</div>
        {shopClosed && (
          <div className="mt-auto w-full pt-2">
            <PreOpeningProductActions
              compact
              productId={product.id}
              title={product.title}
              price={product.price}
              currency={product.currency || "GBP"}
              image_url={product.image_url}
              partNumber={product.part_number}
              supplierName={product.seller_company}
              sellerId={product.seller_id}
            />
          </div>
        )}
      </div>
    </div>
  );
}
