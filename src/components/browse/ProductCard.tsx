import Link from "next/link";
import { ImageIcon } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { getPlaceholderSvg } from "@/lib/productPlaceholders";

interface Product {
  id: string;
  title: string;
  description?: string | null;
  price: number;
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
  // Get all images - combine image_url and images array
  const allImages = [
    ...(product.image_url ? [product.image_url] : []),
    ...(product.images || []),
  ].filter((img, idx, arr) => arr.indexOf(img) === idx); // Remove duplicates

  const hasImage = allImages.length > 0;
  const imageCount = allImages.length;
  const placeholder = getPlaceholderSvg(product.title);

  return (
    <Link
      href={`/product/${product.id}`}
      className="group block rounded-md border border-border bg-card overflow-hidden hover:shadow-md transition-shadow duration-200"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      {/* Image Container - Square aspect ratio */}
      <div className="aspect-square bg-muted flex items-center justify-center relative overflow-hidden">
        {hasImage ? (
          <>
            <img
              src={allImages[0]}
              alt={product.title}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
            />
            {/* Image count badge */}
            {imageCount > 1 && (
              <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                +{imageCount - 1} more
              </span>
            )}
          </>
        ) : placeholder ? (
          <div className="w-full h-full group-hover:scale-105 transition-transform duration-200">
            {placeholder}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-muted-foreground">
            <ImageIcon className="h-8 w-8 mb-1" />
            <span className="text-xs">No image</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Title - 2 lines max */}
        <h3 className="text-sm font-medium text-foreground line-clamp-2 leading-tight mb-1 group-hover:text-primary transition-colors">
          {product.title}
        </h3>

        {/* Description - 2 lines with ellipsis */}
        {product.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
            {product.description}
          </p>
        )}

        {/* Price */}
        <div className="mt-auto">
          {product.price > 0 ? (
            <span className="text-base font-semibold text-foreground">
              {formatPrice(product.currency, product.price)}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">Price on request</span>
          )}
        </div>
      </div>
    </Link>
  );
}
