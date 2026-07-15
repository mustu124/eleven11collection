"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { saveBannerAction, deleteBannerAction, moveBannerAction } from "@/app/admin/(dashboard)/homepage/actions";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import type { AdminBanner } from "@/lib/supabase/admin-queries";

const MAX_BYTES = 5 * 1024 * 1024;

export function BannerSectionEditor({
  section,
  title,
  banners,
}: {
  section: string;
  title: string;
  banners: AdminBanner[];
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [eyebrowText, setEyebrowText] = useState("");
  const [headingText, setHeadingText] = useState("");
  const [subheadingText, setSubheadingText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function resetForm() {
    setShowForm(false);
    setEditingId(null);
    setLinkUrl("");
    setImageUrl("");
    setIsActive(true);
    setFile(null);
    setPreviewUrl(null);
    setError(null);
    setEyebrowText("");
    setHeadingText("");
    setSubheadingText("");
  }

  function startEdit(banner: AdminBanner) {
    setShowForm(true);
    setEditingId(banner.id);
    setLinkUrl(banner.linkUrl ?? "");
    setImageUrl(banner.imageUrl);
    setIsActive(banner.isActive);
    setFile(null);
    setPreviewUrl(null);
    setError(null);
    setEyebrowText(banner.eyebrowText ?? "");
    setHeadingText(banner.headingText ?? "");
    setSubheadingText(banner.subheadingText ?? "");
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
    if (editingId) formData.append("bannerId", editingId);
    formData.append("section", section);
    formData.append("link_url", linkUrl);
    formData.append("image_url", imageUrl);
    if (isActive) formData.append("is_active", "on");
    if (file) formData.append("imageFile", file);
    if (section === "hero") {
      formData.append("eyebrow_text", eyebrowText);
      formData.append("heading_text", headingText);
      formData.append("subheading_text", subheadingText);
    }

    startTransition(async () => {
      const result = await saveBannerAction(formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      resetForm();
      router.refresh();
    });
  }

  function handleDelete(banner: AdminBanner) {
    if (!window.confirm("Delete this banner?")) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteBannerAction(banner.id);
      if (result?.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function handleMove(banner: AdminBanner, direction: "up" | "down") {
    setError(null);
    startTransition(async () => {
      const result = await moveBannerAction(banner.id, direction);
      if (result?.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div data-testid={`banner-section-${section}`} className="rounded-lg border border-ink/10 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-serif text-base text-ink">{title}</h3>
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="font-sans text-xs text-gold-dark hover:underline"
          >
            + Add
          </button>
        )}
      </div>

      {error && (
        <p role="alert" className="mb-2 font-sans text-xs text-red-600">
          {error}
        </p>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} noValidate className="mb-4 space-y-2 rounded-md border border-ink/10 p-3">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files[0];
              if (f) handleFile(f);
            }}
            className="flex items-center gap-3 rounded-md border border-dashed border-ink/20 p-2"
          >
            {(previewUrl || imageUrl) && (
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded bg-ivory-soft">
                {previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <ImageWithFallback src={imageUrl} alt="" fill sizes="56px" className="object-cover" />
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
            value={imageUrl}
            onChange={(e) => {
              setImageUrl(e.target.value);
              setFile(null);
              setPreviewUrl(null);
            }}
            className="w-full rounded-md border border-ink/15 px-3 py-1.5 font-sans text-xs text-ink focus:outline-none focus:ring-1 focus:ring-gold"
          />
          <input
            type="text"
            placeholder="Link URL (optional, e.g. /category/rings)"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="w-full rounded-md border border-ink/15 px-3 py-1.5 font-sans text-xs text-ink focus:outline-none focus:ring-1 focus:ring-gold"
          />
          {section === "hero" && (
            <>
              <input
                type="text"
                placeholder="Eyebrow text (e.g. Eleven 11 Collection)"
                value={eyebrowText}
                onChange={(e) => setEyebrowText(e.target.value)}
                className="w-full rounded-md border border-ink/15 px-3 py-1.5 font-sans text-xs text-ink focus:outline-none focus:ring-1 focus:ring-gold"
              />
              <input
                type="text"
                placeholder="Headline (e.g. Timeless diamonds, made for you)"
                value={headingText}
                onChange={(e) => setHeadingText(e.target.value)}
                className="w-full rounded-md border border-ink/15 px-3 py-1.5 font-sans text-xs text-ink focus:outline-none focus:ring-1 focus:ring-gold"
              />
              <input
                type="text"
                placeholder="Description (e.g. Fine jewellery crafted with rare stones...)"
                value={subheadingText}
                onChange={(e) => setSubheadingText(e.target.value)}
                className="w-full rounded-md border border-ink/15 px-3 py-1.5 font-sans text-xs text-ink focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </>
          )}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 font-sans text-xs text-ink">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-ink/30"
              />
              Active
            </label>
            <div className="flex gap-2">
              <button type="button" onClick={resetForm} className="font-sans text-xs text-ink-soft hover:text-gold">
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="rounded-full bg-gold-dark px-3 py-1 font-sans text-xs font-medium text-white hover:opacity-90 disabled:opacity-60"
              >
                {isPending ? "Saving..." : editingId ? "Save" : "Add"}
              </button>
            </div>
          </div>
        </form>
      )}

      <ul className="space-y-2">
        {banners.map((banner, i) => (
          <li key={banner.id} className="flex flex-wrap items-center gap-2 rounded-md border border-ink/10 p-2">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-ivory-soft">
              <ImageWithFallback src={banner.imageUrl} alt="" fill sizes="48px" className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-sans text-xs text-ink">{banner.linkUrl || "No link"}</p>
              {!banner.isActive && <span className="font-sans text-[10px] text-ink-soft">Hidden</span>}
            </div>
            <button
              type="button"
              onClick={() => handleMove(banner, "up")}
              disabled={i === 0}
              aria-label="Move up"
              className="flex min-h-11 min-w-11 items-center justify-center rounded text-ink-soft hover:bg-ink/5 disabled:opacity-30"
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleMove(banner, "down")}
              disabled={i === banners.length - 1}
              aria-label="Move down"
              className="flex min-h-11 min-w-11 items-center justify-center rounded text-ink-soft hover:bg-ink/5 disabled:opacity-30"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => startEdit(banner)}
              aria-label="Edit banner"
              className="flex min-h-11 min-w-11 items-center justify-center rounded text-ink-soft hover:bg-ink/5 hover:text-gold"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleDelete(banner)}
              aria-label="Delete banner"
              className="flex min-h-11 min-w-11 items-center justify-center rounded text-ink-soft hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
        {banners.length === 0 && !showForm && (
          <p className="font-sans text-xs text-ink-soft">No banners yet.</p>
        )}
      </ul>
    </div>
  );
}
