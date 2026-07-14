"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";

const MAX_BYTES = 5 * 1024 * 1024; // 5MB — matches scripts/setup-storage.mjs and lib/supabase/storage.ts

export type ExistingImage = { id: string; image_url: string; sort_order: number };

export function ImageDropzone({
  existingImages,
  onExistingImagesChange,
  newFiles,
  onNewFilesChange,
}: {
  existingImages: ExistingImage[];
  onExistingImagesChange: (images: ExistingImage[]) => void;
  newFiles: File[];
  onNewFilesChange: (files: File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addFiles(fileList: FileList | File[]) {
    setError(null);
    const accepted: File[] = [];
    const rejected: string[] = [];

    for (const file of Array.from(fileList)) {
      if (!file.type.startsWith("image/")) {
        rejected.push(`"${file.name}" isn't an image.`);
        continue;
      }
      if (file.size > MAX_BYTES) {
        rejected.push(`"${file.name}" is ${(file.size / 1024 / 1024).toFixed(1)}MB — the limit is 5MB.`);
        continue;
      }
      accepted.push(file);
    }

    if (rejected.length > 0) setError(rejected.join(" "));
    if (accepted.length > 0) onNewFilesChange([...newFiles, ...accepted]);
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          addFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-4 py-8 text-center transition-colors ${
          isDragging ? "border-gold bg-gold/5" : "border-ink/20 hover:border-gold"
        }`}
      >
        <Upload className="h-6 w-6 text-ink-soft" aria-hidden="true" />
        <p className="font-sans text-sm text-ink-soft">Drag &amp; drop images here, or click to browse</p>
        <p className="font-sans text-xs text-ink-soft/70">JPG, PNG, WEBP or GIF — up to 5MB each</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {error && (
        <p role="alert" className="mt-2 font-sans text-sm text-red-600">
          {error}
        </p>
      )}

      {(existingImages.length > 0 || newFiles.length > 0) && (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {existingImages.map((img) => (
            <div key={img.id} className="relative aspect-square overflow-hidden rounded-md bg-ivory-soft">
              <Image src={img.image_url} alt="" fill sizes="120px" className="object-cover" />
              <button
                type="button"
                onClick={() => onExistingImagesChange(existingImages.filter((i) => i.id !== img.id))}
                aria-label="Remove image"
                className="absolute right-1 top-1 flex min-h-11 min-w-11 items-center justify-center rounded-full bg-white/90 text-ink hover:bg-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {newFiles.map((file, i) => (
            <NewFilePreview
              key={`${file.name}-${i}`}
              file={file}
              onRemove={() => onNewFilesChange(newFiles.filter((_, idx) => idx !== i))}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function NewFilePreview({ file, onRemove }: { file: File; onRemove: () => void }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return (
    <div className="relative aspect-square overflow-hidden rounded-md bg-ivory-soft">
      {/* Local blob: preview, not an optimizable remote image — plain <img> is correct here, not next/image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {url && <img src={url} alt="" className="h-full w-full object-cover" />}
      <span className="absolute bottom-1 left-1 rounded-full bg-gold-dark px-1.5 py-0.5 text-[10px] text-white">
        New
      </span>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove image"
        className="absolute right-1 top-1 flex min-h-11 min-w-11 items-center justify-center rounded-full bg-white/90 text-ink hover:bg-white"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
