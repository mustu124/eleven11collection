"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import { searchProducts, type ProductCardData } from "@/lib/supabase/queries";
import { ProductCard } from "@/components/product/ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";

export function SearchClient({ initialQuery }: { initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebouncedValue(query, 400);
  const [results, setResults] = useState<ProductCardData[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Keep the URL shareable without round-tripping through Next's router
  // (and therefore the server) on every keystroke.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (debouncedQuery) url.searchParams.set("q", debouncedQuery);
    else url.searchParams.delete("q");
    window.history.replaceState({}, "", url);
  }, [debouncedQuery]);

  useEffect(() => {
    const trimmed = debouncedQuery.trim();
    if (!trimmed) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    searchProducts(trimmed)
      .then((data) => {
        if (!cancelled) {
          setResults(data);
          setHasSearched(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      <div className="relative mx-auto max-w-md">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft"
        />
        <input
          type="search"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for earrings, rings, kadas..."
          aria-label="Search products"
          className="min-h-11 w-full rounded-full border border-ink/15 bg-white py-2.5 pl-9 pr-4 font-sans text-sm text-ink placeholder:text-ink-soft focus:outline-none focus:ring-1 focus:ring-gold"
        />
      </div>

      <div className="mt-8">
        {loading && (
          <p className="text-center font-sans text-sm text-ink-soft">Searching...</p>
        )}

        {!loading && hasSearched && results.length === 0 && (
          <EmptyState
            title={`No results for "${debouncedQuery.trim()}"`}
            description="Try a different word, or check the spelling."
          />
        )}

        {!loading && !hasSearched && !debouncedQuery.trim() && (
          <p className="text-center font-sans text-sm text-ink-soft">
            Start typing to search products.
          </p>
        )}

        {!loading && results.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {results.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
