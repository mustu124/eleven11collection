"use client";

import { Plus, X } from "lucide-react";

export type VariantRow = { name: string; stock: number; price_override: number | null };

export function VariantEditor({
  variants,
  onChange,
}: {
  variants: VariantRow[];
  onChange: (variants: VariantRow[]) => void;
}) {
  function updateVariant(index: number, patch: Partial<VariantRow>) {
    onChange(variants.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  }

  return (
    <div>
      {variants.length > 0 && (
        <div className="mb-2 grid grid-cols-[1fr_6rem_8rem_2rem] gap-2 font-sans text-xs uppercase tracking-wide text-ink-soft">
          <span>Name</span>
          <span>Stock</span>
          <span>Price override</span>
          <span />
        </div>
      )}
      <div className="space-y-2">
        {variants.map((variant, i) => (
          <div key={i} className="grid grid-cols-[1fr_6rem_8rem_2rem] items-center gap-2">
            <input
              type="text"
              placeholder="e.g. Size 7"
              value={variant.name}
              onChange={(e) => updateVariant(i, { name: e.target.value })}
              className="rounded-md border border-ink/15 px-3 py-1.5 font-sans text-sm text-ink focus:outline-none focus:ring-1 focus:ring-gold"
            />
            <input
              type="number"
              min={0}
              value={variant.stock}
              onChange={(e) => updateVariant(i, { stock: Math.max(0, Number(e.target.value) || 0) })}
              className="rounded-md border border-ink/15 px-3 py-1.5 font-sans text-sm text-ink focus:outline-none focus:ring-1 focus:ring-gold"
            />
            <input
              type="number"
              min={0}
              placeholder="optional"
              value={variant.price_override ?? ""}
              onChange={(e) =>
                updateVariant(i, {
                  price_override: e.target.value === "" ? null : Number(e.target.value),
                })
              }
              className="rounded-md border border-ink/15 px-3 py-1.5 font-sans text-sm text-ink focus:outline-none focus:ring-1 focus:ring-gold"
            />
            <button
              type="button"
              onClick={() => onChange(variants.filter((_, idx) => idx !== i))}
              aria-label="Remove variant"
              className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-ink-soft hover:bg-ink/5"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...variants, { name: "", stock: 0, price_override: null }])}
        className="mt-2 flex items-center gap-1 font-sans text-sm text-gold-dark hover:underline"
      >
        <Plus className="h-4 w-4" /> Add variant
      </button>
    </div>
  );
}
