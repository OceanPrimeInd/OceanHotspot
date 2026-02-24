// @ts-nocheck
"use client";

import Link from "next/link";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { EmptyState } from "@/components/ui/empty-state";
import { formatPrice } from "@/lib/utils";
import { getPlaceholderSvg } from "@/lib/productPlaceholders";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Heart,
  Trash2,
  ShoppingCart,
  Package,
  ArrowRight,
} from "lucide-react";

const Wishlist = () => {
  const { items, removeItem, clearWishlist } = useWishlist();
  const { addItem: addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (item: typeof items[0]) => {
    addToCart({
      id: item.id,
      title: item.title,
      price: item.price,
      currency: item.currency,
      image_url: item.image_url,
      quantity: 1,
    });
    toast({
      title: "Added to cart",
      description: `${item.title} has been added to your cart.`,
    });
  };

  const handleMoveToCart = (item: typeof items[0]) => {
    handleAddToCart(item);
    removeItem(item.id);
    toast({
      title: "Moved to cart",
      description: `${item.title} has been moved to your cart.`,
    });
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container py-12">
          <EmptyState
            icon={Heart}
            title="Your wishlist is empty"
            description="Save items you love by clicking the heart icon on any product. They'll appear here for easy access later."
            actionLabel="Browse Products"
            actionHref="/browse"
            secondaryActionLabel="Go Home"
            secondaryActionHref="/"
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-5xl py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-headline flex items-center gap-2">
            <Heart className="h-6 w-6 text-red-500 fill-red-500" />
            My Wishlist ({items.length} {items.length === 1 ? "item" : "items"})
          </h1>
          <Button variant="ghost" size="sm" onClick={clearWishlist}>
            Clear Wishlist
          </Button>
        </div>

        <div className="grid gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 p-4 rounded-xl border border-border bg-card hover:shadow-md transition-shadow"
            >
              {/* Image */}
              <Link href={`/product/${item.id}`} className="flex-shrink-0">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-28 h-28 object-cover rounded-lg border"
                  />
                ) : getPlaceholderSvg(item.title) ? (
                  <div className="w-28 h-28 rounded-lg overflow-hidden">
                    {getPlaceholderSvg(item.title)}
                  </div>
                ) : (
                  <div className="w-28 h-28 bg-muted rounded-lg flex items-center justify-center">
                    <Package className="h-10 w-10 text-muted-foreground" />
                  </div>
                )}
              </Link>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <Link
                  href={`/product/${item.id}`}
                  className="font-medium text-headline hover:text-primary transition-colors line-clamp-1"
                >
                  {item.title}
                </Link>

                {/* Category badges */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {item.entity_type && (
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {item.entity_type}
                    </span>
                  )}
                  {item.domain_category && (
                    <span className="inline-flex items-center rounded-full bg-secondary/10 px-2 py-0.5 text-xs font-medium text-secondary">
                      {item.domain_category}
                    </span>
                  )}
                </div>

                {item.description && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {item.description}
                  </p>
                )}

                <p className="text-lg font-semibold text-primary mt-2">
                  {formatPrice(item.currency, item.price)}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="o42Primary"
                    onClick={() => handleMoveToCart(item)}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Move to Cart
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddToCart(item)}
                  >
                    Add to Cart
                  </Button>
                  <Button size="sm" variant="ghost" asChild>
                    <Link href={`/product/${item.id}`}>
                      View Details
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Remove Button */}
              <div className="flex-shrink-0">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-muted"
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Remove from wishlist</TooltipContent>
                </Tooltip>
              </div>
            </div>
          ))}
        </div>

        {/* Continue Shopping */}
        <div className="mt-8 text-center">
          <Button variant="outline" asChild>
            <Link href="/browse">
              Continue Shopping
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Wishlist;
