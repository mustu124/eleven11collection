import Image from "next/image";
import Link from "next/link";
import type { NavCategory } from "@/lib/supabase/queries";

export function CategoryCircles({ categories }: { categories: NavCategory[] }) {
  if (categories.length === 0) return null;

  return (
    <section aria-label="Shop by category" className="px-4 py-8 md:px-8">
      <h2 className="mb-4 text-center font-serif text-xl text-ink">Shop by Category</h2>
      <ul className="no-scrollbar flex snap-x gap-5 overflow-x-auto px-1 pb-1">
        {categories.map((category) => (
          <li key={category.id} className="snap-start">
            <Link
              href={`/category/${category.slug}`}
              className="flex w-20 flex-col items-center gap-2 sm:w-24"
            >
              <span className="relative block h-20 w-20 overflow-hidden rounded-full bg-ivory-soft ring-1 ring-ink/10 sm:h-24 sm:w-24">
                {category.image_url ? (
                  <Image
                    src={category.image_url}
                    alt=""
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center font-serif text-lg text-gold">
                    {category.name.charAt(0)}
                  </span>
                )}
              </span>
              <span className="text-center font-sans text-xs text-ink">{category.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
