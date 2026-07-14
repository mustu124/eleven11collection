import { Skeleton } from "@/components/ui/Skeleton";
import { ProductCardSkeleton } from "@/components/product/ProductCardSkeleton";

export default function CategoryLoading() {
  return (
    <div>
      <div className="flex justify-center px-4 pt-8 md:px-8">
        <Skeleton className="h-8 w-40" />
      </div>

      <div className="flex flex-wrap items-center gap-3 px-4 py-4 md:px-8">
        <Skeleton className="h-11 w-52 rounded-full" />
        <Skeleton className="h-11 w-32 rounded-full" />
        <Skeleton className="ml-auto h-11 w-36 rounded-full" />
      </div>

      <div className="grid grid-cols-2 gap-4 px-4 pb-12 pt-2 sm:grid-cols-3 md:grid-cols-4 md:px-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
