import { Skeleton } from "@/components/ui/skeleton";

export function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="space-y-3 flex-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-10 w-10 rounded-lg" />
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <Skeleton className="h-6 w-48 mb-6" />
      <Skeleton className="h-[200px] w-full rounded-lg" />
    </div>
  );
}

export function QuickActionSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  );
}

export function ProductListItemSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-sm flex items-center justify-between">
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded" />
        <Skeleton className="h-8 w-8 rounded" />
        <Skeleton className="h-8 w-8 rounded" />
      </div>
    </div>
  );
}

export function OrderTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="p-6 border-b border-border">
        <Skeleton className="h-6 w-36" />
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="p-4 flex items-center gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32 flex-1" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      {/* Product Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Quick Actions */}
      <Skeleton className="h-6 w-32 mb-4" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <QuickActionSkeleton />
        <QuickActionSkeleton />
        <QuickActionSkeleton />
        <QuickActionSkeleton />
      </div>

      {/* Recent Orders */}
      <div className="mb-8">
        <OrderTableSkeleton rows={5} />
      </div>

      {/* Products List */}
      <Skeleton className="h-6 w-32 mb-4" />
      <div className="space-y-4">
        <ProductListItemSkeleton />
        <ProductListItemSkeleton />
        <ProductListItemSkeleton />
      </div>
    </div>
  );
}
