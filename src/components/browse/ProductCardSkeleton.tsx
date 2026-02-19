import { Skeleton } from "@/components/ui/skeleton";

interface ProductCardSkeletonProps {
  index?: number;
}

export function ProductCardSkeleton({ index = 0 }: ProductCardSkeletonProps) {
  return (
    <div
      className="rounded-lg border border-border bg-card overflow-hidden shadow-card animate-slide-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Image placeholder */}
      <Skeleton className="aspect-video w-full rounded-none" />

      <div className="p-5">
        {/* Category badges */}
        <div className="flex gap-2 mb-3">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>

        {/* Title */}
        <Skeleton className="h-6 w-3/4 mb-2" />

        {/* Description */}
        <div className="space-y-2 mb-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        {/* Price and CTA */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} index={index} />
      ))}
    </div>
  );
}
