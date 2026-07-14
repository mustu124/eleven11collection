import Image from "next/image";
import Link from "next/link";
import type { ProductCardData } from "@/lib/supabase/queries";

export function ProductCard({
  product,
  priority = false,
}: {
  product: ProductCardData;
  /** Set for cards visible above the fold (e.g. the first row of a grid) so
   * next/image preloads them instead of lazy-loading — an LCP image that's
   * already on screen at load shouldn't be waiting on lazy-load detection. */
  priority?: boolean;
}) {
  return (
    <Link href={`/product/${product.slug}`} className="block w-full">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-md bg-ivory-soft">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            priority={priority}
            sizes="(min-width: 640px) 192px, 160px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-sans text-xs text-ink-soft">
            No image
          </div>
        )}
        {product.badgeText && (
          <span className="absolute left-2 top-2 rounded-full bg-gold-dark px-2 py-0.5 font-sans text-[10px] text-white">
            {product.badgeText}
          </span>
        )}
      </div>
      <p className="mt-2 truncate font-sans text-sm text-ink">{product.name}</p>
      <p className="font-sans text-sm text-ink">
        <span className="font-medium">₹{product.price.toLocaleString("en-IN")}</span>
        {product.mrp && product.mrp > product.price && (
          <span className="ml-2 text-ink-soft line-through">
            ₹{product.mrp.toLocaleString("en-IN")}
          </span>
        )}
      </p>
    </Link>
  );
}
