"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, ChevronUp, ChevronDown, Star } from "lucide-react";
import { saveOfferAction, deleteOfferAction, moveOfferAction } from "@/app/admin/(dashboard)/offers/actions";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import type { AdminOffer } from "@/lib/supabase/admin-queries";

const MAX_BYTES = 5 * 1024 * 1024;

type FormValues = {
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  isFeatured: boolean;
  isActive: boolean;
};

const EMPTY_FORM: FormValues = {
  title: "",
  description: "",
  imageUrl: "",
  linkUrl: "",
  isFeatured: false,
  isActive: true,
};

export function OfferManager({ offers }: { offers: AdminOffer[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormValues>(EMPTY_FORM);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function resetForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFile(null);
    setPreviewUrl(null);
    setError(null);
  }

  function startEdit(offer: AdminOffer) {
    setShowForm(true);
    setEditingId(offer.id);
    setForm({
      title: offer.title,
      description: offer.description ?? "",
      imageUrl: offer.imageUrl ?? "",
      linkUrl: offer.linkUrl ?? "",
      isFeatured: offer.isFeatured,
      isActive: offer.isActive,
    });
    setFile(null);
    setPreviewUrl(null);
    setError(null);
  }

  function handleFile(f: File) {
    setError(null);
    if (!f.type.startsWith("image/")) {
      setError(`"${f.name}" isn't an image.`);
      return;
    }
    if (f.size > MAX_BYTES) {
      setError(`"${f.name}" is ${(f.size / 1024 / 1024).toFixed(1)}MB — the limit is 5MB.`);
      return;
    }
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const formData = new FormData();
    if (editingId) formData.append("offerId", editingId);
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("image_url", form.imageUrl);
    formData.append("link_url", form.linkUrl);
    if (form.isFeatured) formData.append("is_featured", "on");
    if (form.isActive) formData.append("is_active", "on");
    if (file) formData.append("imageFile", file);

    startTransition(async () => {
      const result = await saveOfferAction(formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      resetForm();
      router.refresh();
    });
  }

  function handleDelete(offer: AdminOffer) {
    if (!window.confirm(`Delete "${offer.title}"?`)) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteOfferAction(offer.id);
      if (result?.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function handleMove(offer: AdminOffer, direction: "up" | "down") {
    setError(null);
    startTransition(async () => {
      const result = await moveOfferAction(offer.id, direction);
      if (result?.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  const inputClass =
    "w-full rounded-md border border-ink/15 px-3 py-1.5 font-sans text-sm text-ink focus:outline-none focus:ring-1 focus:ring-gold";

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="font-sans text-xs text-ink-soft">
          Featured offer shows on the homepage. All active offers show on the Offer Zone page.
        </p>
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1 rounded-full bg-gold-dark px-4 py-2 font-sans text-sm font-medium text-white hover:opacity-90"
          >
            + Add Offer
          </button>
        )}
      </div>

      {error && (
        <p role="alert" className="mb-3 font-sans text-sm text-red-600">
          {error}
        </p>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} noValidate className="mb-4 space-y-3 rounded-lg border border-ink/10 bg-white p-4">
          <div>
            <label className="mb-1 block font-sans text-xs uppercase tracking-wide text-ink-soft">Title</label>
            <input
              type="text"
              placeholder="e.g. Flat 20% off on Rings"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1 block font-sans text-xs uppercase tracking-wide text-ink-soft">
              Description (optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. This weekend only, on our full ring collection"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1 block font-sans text-xs uppercase tracking-wide text-ink-soft">Image</label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files[0];
                if (f) handleFile(f);
              }}
              className="flex items-center gap-3 rounded-md border border-dashed border-ink/20 p-2"
            >
              {(previewUrl || form.imageUrl) && (
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded bg-ivory-soft">
                  {previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={previewUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <ImageWithFallback src={form.imageUrl} alt="" fill sizes="56px" className="object-cover" />
                  )}
                </div>
              )}
              <label className="flex-1 cursor-pointer font-sans text-xs text-ink-soft">
                Drag &amp; drop or click to upload
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
            <input
              type="text"
              placeholder="Or paste an image URL"
              value={form.imageUrl}
              onChange={(e) => {
                setForm({ ...form, imageUrl: e.target.value });
                setFile(null);
                setPreviewUrl(null);
              }}
              className={`${inputClass} mt-2`}
            />
          </div>

          <div>
            <label className="mb-1 block font-sans text-xs uppercase tracking-wide text-ink-soft">
              Link (optional, e.g. /category/rings)
            </label>
            <input
              type="text"
              value={form.linkUrl}
              onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
              className={inputClass}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 font-sans text-sm text-ink">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                  className="h-4 w-4 rounded border-ink/30"
                />
                Feature on homepage
              </label>
              <label className="flex items-center gap-2 font-sans text-sm text-ink">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-ink/30"
                />
                Visible on Offer Zone
              </label>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={resetForm} className="font-sans text-sm text-ink-soft hover:text-gold">
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="rounded-full bg-gold-dark px-4 py-1.5 font-sans text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
              >
                {isPending ? "Saving..." : editingId ? "Save" : "Add"}
              </button>
            </div>
          </div>
        </form>
      )}

      <ul className="space-y-2">
        {offers.map((offer, i) => (
          <li key={offer.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-ink/10 bg-white p-3">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded bg-ivory-soft">
              <ImageWithFallback src={offer.imageUrl ?? "/banner-fallback.svg"} alt="" fill sizes="56px" className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 truncate font-sans text-sm text-ink">
                {offer.isFeatured && <Star className="h-3.5 w-3.5 shrink-0 fill-gold text-gold" />}
                {offer.title}
              </p>
              <p className="truncate font-sans text-xs text-ink-soft">
                {offer.linkUrl || "No link"}
                {!offer.isActive && " · Hidden"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleMove(offer, "up")}
              disabled={i === 0}
              aria-label="Move up"
              className="flex min-h-11 min-w-11 items-center justify-center rounded text-ink-soft hover:bg-ink/5 disabled:opacity-30"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => handleMove(offer, "down")}
              disabled={i === offers.length - 1}
              aria-label="Move down"
              className="flex min-h-11 min-w-11 items-center justify-center rounded text-ink-soft hover:bg-ink/5 disabled:opacity-30"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => startEdit(offer)}
              aria-label={`Edit ${offer.title}`}
              className="flex min-h-11 min-w-11 items-center justify-center rounded text-ink-soft hover:bg-ink/5 hover:text-gold"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => handleDelete(offer)}
              aria-label={`Delete ${offer.title}`}
              className="flex min-h-11 min-w-11 items-center justify-center rounded text-ink-soft hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
        {offers.length === 0 && !showForm && (
          <p className="font-sans text-sm text-ink-soft">No offers yet.</p>
        )}
      </ul>
    </div>
  );
}
