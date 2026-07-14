import { Skeleton } from "@/components/ui/Skeleton";

export function ProductCardSkeleton() {
  return (
    <div className="w-full">
      <Skeleton className="aspect-[4/5] w-full" />
      <Skeleton className="mt-2 h-4 w-3/4" />
      <Skeleton className="mt-2 h-4 w-1/3" />
    </div>
  );
}
