import Link from "next/link";
import { ImageIcon } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { getPlaceholderSvg } from "@/lib/productPlaceholders";

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
}

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const allImages = [
    ...(product.image_url ? [product.image_url] : []),
    ...(product.images || []),
  ].filter((img, idx, arr) => arr.indexOf(img) === idx);

  const hasImage = allImages.length > 0;
  const imageCount = allImages.length;
  const placeholder = getPlaceholderSvg(product.title);

  const renderPrice = () => {
    switch (product.pricing_type) {
      case "poa":
        return <span className="text-sm font-semibold text-primary">POA — Price on Application</span>;
      case "contact_us":
        return <span className="text-sm font-semibold text-primary">Contact Us for More Information</span>;
      case "coming_soon":
        return <span className="text-sm font-semibold text-amber-600">Coming Soon</span>;
      default:
        return product.price > 0 ? (
          <span className="text-base font-semibold text-foreground">
            {formatPrice(product.currency, product.price)}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">Price on request</span>
        );
    }
  };

  return (
    <Link
      href={`/product/${product.id}`}
      className="group block overflow-hidden rounded-[18px] border border-[#e7e7e7] bg-white"
      style={{ animationDelay: `${index * 30}ms` }}
    >
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
        ) : placeholder ? (
          <div className="h-full w-full">
            {placeholder}
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
            <ImageIcon className="mb-1 h-8 w-8" />
            <span className="text-xs">No image</span>
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

      <div className="space-y-1 px-3 pb-3 pt-2">
        <h3 className="line-clamp-2 text-[15px] font-medium leading-snug text-[#1f2a37]">
          {product.title}
        </h3>
        {product.description && (
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {product.description}
          </p>
        )}
        <div className="pt-0.5">{renderPrice()}</div>
      </div>
    </Link>
  );
}
