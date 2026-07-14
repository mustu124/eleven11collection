import Link from "next/link";
import type { NavCategory } from "@/lib/supabase/queries";

export function DesktopNav({ categories }: { categories: NavCategory[] }) {
  if (categories.length === 0) return null;

  return (
    <nav
      aria-label="Categories"
      className="hidden md:block border-t border-ink/10 bg-ivory-soft"
    >
      <ul className="no-scrollbar flex items-center gap-6 overflow-x-auto whitespace-nowrap px-4 py-2.5 md:px-8">
        {categories.map((category) => (
          <li key={category.id} className="shrink-0">
            <Link
              href={`/category/${category.slug}`}
              className="font-sans text-xs uppercase tracking-wider text-ink/80 transition-colors hover:text-gold"
            >
              {category.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
