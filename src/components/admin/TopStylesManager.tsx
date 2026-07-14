"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Plus, Trash2, X } from "lucide-react";
import {
  addTopStyleAction,
  deleteTabAction,
  removeTopStyleAction,
} from "@/app/admin/(dashboard)/homepage/actions";
import type { AdminProductOption, AdminTopStyleRow } from "@/lib/supabase/admin-queries";

export function TopStylesManager({
  rows,
  products,
}: {
  rows: AdminTopStyleRow[];
  products: AdminProductOption[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [newTabName, setNewTabName] = useState("");
  const [newTabProduct, setNewTabProduct] = useState(products[0]?.id ?? "");
  const [addProductByTab, setAddProductByTab] = useState<Record<string, string>>({});

  const byTab = useMemo(() => {
    const map = new Map<string, AdminTopStyleRow[]>();
    for (const row of rows) {
      if (!map.has(row.tab)) map.set(row.tab, []);
      map.get(row.tab)!.push(row);
    }
    return map;
  }, [rows]);

  const tabs = Array.from(byTab.keys()).sort((a, b) =>
    a === "all" ? -1 : b === "all" ? 1 : a.localeCompare(b)
  );

  function handleAdd(tab: string, productId: string) {
    if (!productId) return;
    setError(null);
    startTransition(async () => {
      const result = await addTopStyleAction(tab, productId);
      if (result?.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function handleRemove(rowId: string) {
    setError(null);
    startTransition(async () => {
      const result = await removeTopStyleAction(rowId);
      if (result?.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function handleDeleteTab(tab: string) {
    if (!window.confirm(`Remove all products from "${tab}"? The tab will disappear from the homepage.`))
      return;
    setError(null);
    startTransition(async () => {
      const result = await deleteTabAction(tab);
      if (result?.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function handleCreateTab(e: React.FormEvent) {
    e.preventDefault();
    if (!newTabName.trim() || !newTabProduct) return;
    handleAdd(newTabName.trim().toLowerCase(), newTabProduct);
    setNewTabName("");
  }

  return (
    <div className="space-y-4">
      {error && (
        <p role="alert" className="font-sans text-sm text-red-600">
          {error}
        </p>
      )}

      {tabs.map((tab) => {
        const tabRows = byTab.get(tab) ?? [];
        const assignedIds = new Set(tabRows.map((r) => r.productId));
        const available = products.filter((p) => !assignedIds.has(p.id));

        return (
          <div key={tab} data-testid={`top-styles-tab-${tab}`} className="rounded-lg border border-ink/10 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-serif text-base capitalize text-ink">{tab}</h3>
              <button
                type="button"
                onClick={() => handleDeleteTab(tab)}
                className="flex items-center gap-1 font-sans text-xs text-red-600 hover:underline"
              >
                <Trash2 className="h-3.5 w-3.5" /> Remove tab
              </button>
            </div>

            {tabRows.length === 0 ? (
              <p className="mb-3 font-sans text-xs text-ink-soft">No products in this tab.</p>
            ) : (
              <ul className="mb-3 flex flex-wrap gap-2">
                {tabRows.map((row) => (
                  <li
                    key={row.rowId}
                    className="flex items-center gap-2 rounded-full border border-ink/15 py-1 pl-1 pr-2"
                  >
                    <span className="relative h-6 w-6 overflow-hidden rounded-full bg-ivory-soft">
                      {row.productImage && (
                        <Image src={row.productImage} alt="" fill sizes="24px" className="object-cover" />
                      )}
                    </span>
                    <span className="font-sans text-xs text-ink">{row.productName}</span>
                    <button
                      type="button"
                      onClick={() => handleRemove(row.rowId)}
                      aria-label={`Remove ${row.productName}`}
                      className="text-ink-soft hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {available.length > 0 && (
              <div className="flex items-center gap-2">
                <select
                  value={addProductByTab[tab] ?? ""}
                  onChange={(e) => setAddProductByTab((s) => ({ ...s, [tab]: e.target.value }))}
                  className="rounded-md border border-ink/15 px-2 py-1 font-sans text-xs text-ink"
                >
                  <option value="">Add a product...</option>
                  {available.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={!addProductByTab[tab] || isPending}
                  onClick={() => {
                    handleAdd(tab, addProductByTab[tab]);
                    setAddProductByTab((s) => ({ ...s, [tab]: "" }));
                  }}
                  className="rounded-full bg-gold-dark px-3 py-1 font-sans text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            )}
          </div>
        );
      })}

      <form onSubmit={handleCreateTab} className="rounded-lg border border-dashed border-ink/20 p-4">
        <p className="mb-2 font-sans text-xs uppercase tracking-wide text-ink-soft">New Tab</p>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Tab name (e.g. bracelets)"
            value={newTabName}
            onChange={(e) => setNewTabName(e.target.value)}
            className="rounded-md border border-ink/15 px-3 py-1.5 font-sans text-sm text-ink focus:outline-none focus:ring-1 focus:ring-gold"
          />
          <select
            value={newTabProduct}
            onChange={(e) => setNewTabProduct(e.target.value)}
            className="rounded-md border border-ink/15 px-2 py-1.5 font-sans text-sm text-ink"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-1 rounded-full bg-gold-dark px-4 py-1.5 font-sans text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
          >
            <Plus className="h-4 w-4" /> Create Tab
          </button>
        </div>
      </form>
    </div>
  );
}
