import { Skeleton } from "@/components/ui/Skeleton";
import { ProductCardSkeleton } from "@/components/product/ProductCardSkeleton";

export default function HomeLoading() {
  return (
    <div>
      <Skeleton className="aspect-[4/5] w-full sm:aspect-[21/9]" />

      <div className="px-4 py-8 md:px-8">
        <div className="mb-4 flex justify-center">
          <Skeleton className="h-6 w-40" />
        </div>
        <div className="flex justify-center gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-20 shrink-0 rounded-full sm:h-24 sm:w-24" />
          ))}
        </div>
      </div>

      <div className="px-4 py-8 md:px-8">
        <div className="mb-5 flex justify-center">
          <Skeleton className="h-6 w-28" />
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
