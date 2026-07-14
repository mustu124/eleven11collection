import Image from "next/image";
import Link from "next/link";
import type { NavCategory } from "@/lib/supabase/queries";

export function CategoryCircles({ categories }: { categories: NavCategory[] }) {
  if (categories.length === 0) return null;

  return (
    <section aria-label="Shop by category" className="px-4 py-8 md:px-8">
      <h2 className="mb-4 text-center font-serif text-xl text-ink">Shop by Category</h2>
      {/* Mobile: a fixed 3-column grid that wraps into as many rows as
          needed — no horizontal scroll, and it holds regardless of how many
          categories get added. Tablet/desktop keep the original horizontally
          scrollable single row, which has room to breathe at that width. */}
      <ul className="grid grid-cols-3 gap-x-2 gap-y-5 sm:no-scrollbar sm:flex sm:snap-x sm:gap-5 sm:overflow-x-auto sm:px-1 sm:pb-1">
        {categories.map((category) => (
          <li key={category.id} className="sm:snap-start">
            <Link
              href={`/category/${category.slug}`}
              className="flex flex-col items-center gap-2 sm:w-24"
            >
              <span className="relative block h-16 w-16 overflow-hidden rounded-full bg-ivory-soft ring-1 ring-ink/10 sm:h-24 sm:w-24">
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
