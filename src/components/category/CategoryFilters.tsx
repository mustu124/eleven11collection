"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

export function CategoryFilters({ materials }: { materials: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [minInput, setMinInput] = useState(searchParams.get("min") ?? "");
  const [maxInput, setMaxInput] = useState(searchParams.get("max") ?? "");
  const debouncedMin = useDebouncedValue(minInput, 500);
  const debouncedMax = useDebouncedValue(maxInput, 500);
  const skipNextPriceEffect = useRef(true);

  const material = searchParams.get("material") ?? "";
  const sort = searchParams.get("sort") ?? "newest";

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (!value) params.delete(key);
      else params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  // Debounced: typing digits shouldn't fire a request per keystroke.
  useEffect(() => {
    if (skipNextPriceEffect.current) {
      skipNextPriceEffect.current = false;
      return;
    }
    updateParams({ min: debouncedMin, max: debouncedMax });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedMin, debouncedMax]);

  const hasActiveFilters = Boolean(searchParams.get("min") || searchParams.get("max") || material);

  return (
    <div className="flex flex-wrap items-center gap-3 px-4 py-4 md:px-8">
      <div className="flex items-center gap-2">
        <label htmlFor="min-price" className="sr-only">
          Minimum price
        </label>
        <input
          id="min-price"
          type="number"
          inputMode="numeric"
          min={0}
          placeholder="Min ₹"
          value={minInput}
          onChange={(e) => setMinInput(e.target.value)}
          className="w-24 rounded-full border border-ink/15 bg-white min-h-11 px-3 font-sans text-sm text-ink focus:outline-none focus:ring-1 focus:ring-gold"
        />
        <span className="text-ink-soft">–</span>
        <label htmlFor="max-price" className="sr-only">
          Maximum price
        </label>
        <input
          id="max-price"
          type="number"
          inputMode="numeric"
          min={0}
          placeholder="Max ₹"
          value={maxInput}
          onChange={(e) => setMaxInput(e.target.value)}
          className="w-24 rounded-full border border-ink/15 bg-white min-h-11 px-3 font-sans text-sm text-ink focus:outline-none focus:ring-1 focus:ring-gold"
        />
      </div>

      {materials.length > 0 && (
        <select
          aria-label="Material"
          value={material}
          onChange={(e) => updateParams({ material: e.target.value })}
          className="rounded-full border border-ink/15 bg-white min-h-11 px-3 font-sans text-sm text-ink focus:outline-none focus:ring-1 focus:ring-gold"
        >
          <option value="">All Materials</option>
          {materials.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      )}

      <select
        aria-label="Sort by"
        value={sort}
        onChange={(e) => updateParams({ sort: e.target.value })}
        className="ml-auto rounded-full border border-ink/15 bg-white min-h-11 px-3 font-sans text-sm text-ink focus:outline-none focus:ring-1 focus:ring-gold"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={() => {
            setMinInput("");
            setMaxInput("");
            skipNextPriceEffect.current = true;
            router.push(pathname, { scroll: false });
          }}
          className="inline-flex min-h-11 items-center px-1 font-sans text-xs text-ink-soft underline hover:text-gold"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
