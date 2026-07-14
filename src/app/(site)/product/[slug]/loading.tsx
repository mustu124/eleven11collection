import { Skeleton } from "@/components/ui/Skeleton";

export default function ProductLoading() {
  return (
    <div className="grid gap-6 px-4 py-8 md:grid-cols-2 md:gap-10 md:px-8 md:py-12">
      <Skeleton className="aspect-square w-full" />
      <div className="flex flex-col gap-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="mt-2 h-11 w-full rounded-full" />
      </div>
    </div>
  );
}
