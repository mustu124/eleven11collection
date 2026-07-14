"use client";

import Image from "next/image";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useFocusTrap } from "@/lib/hooks/useFocusTrap";

export function ImageLightbox({
  images,
  index,
  onIndexChange,
  onClose,
  productName,
}: {
  images: { id: string; imageUrl: string }[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  productName: string;
}) {
  // Mounted only while open, so `active` is true for this component's whole
  // lifetime — mount/unmount IS the open/close transition here.
  const panelRef = useFocusTrap(true, onClose);
  const image = images[index];

  // Portalled to <body> rather than rendered inline — this component is
  // nested deep under the page's `<main>`, and the sticky header (its own
  // stacking/compositing context) painted over this overlay despite a
  // higher z-index and correct hit-testing, a known sticky+fixed
  // compositing quirk. Portalling to body sidesteps it entirely, which is
  // also just the standard place to mount a modal from.
  return createPortal(
    <div
      className="fixed inset-0 z-[60] bg-ink/90"
      role="dialog"
      aria-modal="true"
      aria-label={`${productName} image, enlarged`}
    >
      <div ref={panelRef} className="relative flex h-full w-full items-center justify-center">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 flex min-h-11 min-w-11 items-center justify-center rounded-full bg-white/90 text-ink hover:bg-white"
        >
          <X className="h-5 w-5" />
        </button>

        {images.length > 1 && (
          <button
            type="button"
            onClick={() => onIndexChange((index - 1 + images.length) % images.length)}
            aria-label="Previous image"
            className="absolute left-2 top-1/2 z-10 flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink hover:bg-white sm:left-4"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        {/* Plain image in a fixed-size box with no page-zoom restrictions —
            native pinch-to-zoom works here since nothing blocks it. */}
        <div className="relative h-[85vh] w-[92vw] [touch-action:pinch-zoom]">
          <Image
            src={image.imageUrl}
            alt={`${productName} — enlarged image ${index + 1} of ${images.length}`}
            fill
            sizes="92vw"
            className="object-contain"
          />
        </div>

        {images.length > 1 && (
          <button
            type="button"
            onClick={() => onIndexChange((index + 1) % images.length)}
            aria-label="Next image"
            className="absolute right-2 top-1/2 z-10 flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink hover:bg-white sm:right-4"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>,
    document.body
  );
}
