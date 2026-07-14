"use client";

import { useEffect, useMemo, useState } from "react";
import type { TopStyleProduct } from "@/lib/supabase/queries";
import { ProductCard } from "@/components/product/ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";

function tabLabel(tab: string) {
  return tab === "all" ? "All" : tab.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function TopStyles({ items }: { items: TopStyleProduct[] }) {
  const tabs = useMemo(() => {
    const unique = Array.from(new Set(items.map((i) => i.tab)));
    return unique.sort((a, b) => (a === "all" ? -1 : b === "all" ? 1 : a.localeCompare(b)));
  }, [items]);

  const [activeTab, setActiveTab] = useState(tabs[0]);
  const selected = activeTab ?? tabs[0];

  // Defensive: if the tab the visitor had open stops existing (all its
  // products were removed elsewhere, e.g. by an admin, and `items`
  // refreshed), fall back to the first remaining tab rather than showing a
  // permanently-empty selection.
  useEffect(() => {
    if (activeTab && !tabs.includes(activeTab)) {
      setActiveTab(tabs[0]);
    }
  }, [tabs, activeTab]);

  const filtered = useMemo(
    () => items.filter((i) => i.tab === selected),
    [items, selected]
  );

  if (items.length === 0) return null;

  return (
    <section aria-label="Top styles" className="px-4 py-8 md:px-8">
      <h2 className="mb-4 text-center font-serif text-xl text-ink">Top Styles</h2>

      {tabs.length > 1 && (
        <div
          role="tablist"
          aria-label="Top styles categories"
          className="no-scrollbar mb-5 flex justify-center gap-2 overflow-x-auto"
        >
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={tab === selected}
              onClick={() => setActiveTab(tab)}
              className={`inline-flex min-h-11 shrink-0 items-center justify-center rounded-full border px-4 font-sans text-xs uppercase tracking-wide transition-colors ${
                tab === selected
                  ? "border-gold-dark bg-gold-dark text-white"
                  : "border-ink/15 text-ink-soft hover:border-gold hover:text-gold"
              }`}
            >
              {tabLabel(tab)}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState title="No products in this tab yet" description="Check back soon." />
      ) : (
        <div className="no-scrollbar flex snap-x gap-4 overflow-x-auto md:grid md:grid-cols-4 md:overflow-visible">
          {filtered.map((item) => (
            <div key={item.rowId} className="w-40 shrink-0 snap-start sm:w-48 md:w-auto">
              <ProductCard product={item.product} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
