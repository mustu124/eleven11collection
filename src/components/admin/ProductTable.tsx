"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { deleteProductAction } from "@/app/admin/(dashboard)/products/actions";
import type { AdminProductListItem } from "@/lib/supabase/admin-queries";

export function ProductTable({ products }: { products: AdminProductListItem[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete(product: AdminProductListItem) {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    setError(null);
    setPendingId(product.id);
    startTransition(async () => {
      const result = await deleteProductAction(product.id);
      setPendingId(null);
      if (result?.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  if (products.length === 0) {
    return <p className="font-sans text-sm text-ink-soft">No products yet.</p>;
  }

  return (
    <div>
      {error && (
        <p role="alert" className="mb-3 font-sans text-sm text-red-600">
          {error}
        </p>
      )}
      <div className="overflow-x-auto rounded-lg border border-ink/10 bg-white">
        <table className="w-full text-left font-sans text-sm">
          <thead className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink-soft">
            <tr>
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-ink/5 last:border-0">
                <td className="px-4 py-3">
                  <div className="relative h-12 w-12 overflow-hidden rounded-md bg-ivory-soft">
                    {product.imageUrl && (
                      <Image src={product.imageUrl} alt="" fill sizes="48px" className="object-cover" />
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-ink">{product.name}</td>
                <td className="px-4 py-3 text-ink-soft">{product.categoryName}</td>
                <td className="px-4 py-3 text-ink">₹{product.price.toLocaleString("en-IN")}</td>
                <td className="px-4 py-3 text-ink-soft">{product.stock}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      aria-label={`Edit ${product.name}`}
                      className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-ink-soft hover:bg-ink/5 hover:text-gold"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(product)}
                      disabled={isPending && pendingId === product.id}
                      aria-label={`Delete ${product.name}`}
                      className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-ink-soft hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
