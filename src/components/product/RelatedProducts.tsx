import type { ProductCardData } from "@/lib/supabase/queries";
import { ProductCard } from "./ProductCard";

export function RelatedProducts({ items }: { items: ProductCardData[] }) {
  if (items.length === 0) return null;

  return (
    <section aria-label="Related products" className="border-t border-ink/10 px-4 py-10 md:px-8">
      <h2 className="mb-4 text-center font-serif text-xl text-ink">You May Also Like</h2>
      <div className="no-scrollbar flex snap-x gap-4 overflow-x-auto md:grid md:grid-cols-4 md:overflow-visible">
        {items.map((product) => (
          <div key={product.id} className="w-40 shrink-0 snap-start sm:w-48 md:w-auto">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
