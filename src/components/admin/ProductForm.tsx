"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveProductAction } from "@/app/admin/(dashboard)/products/actions";
import { ImageDropzone, type ExistingImage } from "./ImageDropzone";
import { VariantEditor, type VariantRow } from "./VariantEditor";

type CategoryOption = { id: string; name: string };

export type ProductFormInitialData = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  mrp: number | null;
  stock: number;
  material: string | null;
  badgeText: string | null;
  categoryId: string;
  isBestseller: boolean;
  isNewArrival: boolean;
  images: ExistingImage[];
  variants: { name: string; stock: number; priceOverride: number | null }[];
};

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ProductForm({
  categories,
  initialData,
}: {
  categories: CategoryOption[];
  initialData?: ProductFormInitialData;
}) {
  const router = useRouter();
  const isEditing = !!initialData;

  const [name, setName] = useState(initialData?.name ?? "");
  // Slug is never surfaced in the UI — auto-derived from the name on
  // create, and left untouched on edit so existing product URLs don't
  // silently change when an admin just tweaks the name.
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [price, setPrice] = useState(initialData ? String(initialData.price) : "");
  const [mrp, setMrp] = useState(initialData?.mrp != null ? String(initialData.mrp) : "");
  const [stock, setStock] = useState(initialData ? String(initialData.stock) : "0");
  const [material, setMaterial] = useState(initialData?.material ?? "");
  const [badgeText, setBadgeText] = useState(initialData?.badgeText ?? "");
  const [categoryId, setCategoryId] = useState(initialData?.categoryId ?? categories[0]?.id ?? "");
  const [isBestseller, setIsBestseller] = useState(initialData?.isBestseller ?? false);
  const [isNewArrival, setIsNewArrival] = useState(initialData?.isNewArrival ?? false);
  const [existingImages, setExistingImages] = useState<ExistingImage[]>(initialData?.images ?? []);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [variants, setVariants] = useState<VariantRow[]>(
    (initialData?.variants ?? []).map((v) => ({
      name: v.name,
      stock: v.stock,
      price_override: v.priceOverride,
    }))
  );

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleNameChange(value: string) {
    setName(value);
    if (!isEditing) setSlug(slugify(value));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    if (initialData) formData.append("productId", initialData.id);
    formData.append("name", name);
    formData.append("slug", slug);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("mrp", mrp);
    formData.append("stock", stock);
    formData.append("material", material);
    formData.append("badge_text", badgeText);
    formData.append("category_id", categoryId);
    if (isBestseller) formData.append("is_bestseller", "on");
    if (isNewArrival) formData.append("is_new_arrival", "on");
    formData.append("existingImages", JSON.stringify(existingImages));
    formData.append("variants", JSON.stringify(variants));
    for (const file of newFiles) formData.append("newImages", file);

    startTransition(async () => {
      const result = await saveProductAction(formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      router.push("/admin/products");
      router.refresh();
    });
  }

  const inputClass =
    "w-full rounded-md border border-ink/15 px-3 py-2 font-sans text-sm text-ink focus:outline-none focus:ring-1 focus:ring-gold";
  const labelClass = "mb-1 block font-sans text-xs uppercase tracking-wide text-ink-soft";

  return (
    <form onSubmit={handleSubmit} noValidate className="max-w-3xl space-y-6">
      <div>
        <label htmlFor="name" className={labelClass}>
          Product Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>
          Description
        </label>
        <textarea
          id="description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="price" className={labelClass}>
            Price (₹)
          </label>
          <input
            id="price"
            type="number"
            min={0}
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="mrp" className={labelClass}>
            MRP (₹, optional)
          </label>
          <input
            id="mrp"
            type="number"
            min={0}
            step="0.01"
            value={mrp}
            onChange={(e) => setMrp(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="stock" className={labelClass}>
            Stock
          </label>
          <input
            id="stock"
            type="number"
            min={0}
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="material" className={labelClass}>
            Material
          </label>
          <input
            id="material"
            type="text"
            placeholder="e.g. 9KT Gold"
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="category" className={labelClass}>
            Category
          </label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className={inputClass}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="badge_text" className={labelClass}>
          Badge Text (optional)
        </label>
        <input
          id="badge_text"
          type="text"
          placeholder="e.g. Only 5 left"
          value={badgeText}
          onChange={(e) => setBadgeText(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 font-sans text-sm text-ink">
          <input
            type="checkbox"
            checked={isBestseller}
            onChange={(e) => setIsBestseller(e.target.checked)}
            className="h-4 w-4 rounded border-ink/30"
          />
          Bestseller
        </label>
        <label className="flex items-center gap-2 font-sans text-sm text-ink">
          <input
            type="checkbox"
            checked={isNewArrival}
            onChange={(e) => setIsNewArrival(e.target.checked)}
            className="h-4 w-4 rounded border-ink/30"
          />
          New Arrival
        </label>
      </div>

      <div>
        <p className={labelClass}>Images</p>
        <ImageDropzone
          existingImages={existingImages}
          onExistingImagesChange={setExistingImages}
          newFiles={newFiles}
          onNewFilesChange={setNewFiles}
        />
      </div>

      <div>
        <p className={labelClass}>Variants (optional — e.g. sizes)</p>
        <VariantEditor variants={variants} onChange={setVariants} />
      </div>

      {error && (
        <p role="alert" className="font-sans text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-gold-dark px-6 py-2.5 font-sans text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Saving..." : isEditing ? "Save Changes" : "Create Product"}
      </button>
    </form>
  );
}
