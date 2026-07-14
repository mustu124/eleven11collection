"use client";

import { useState } from "react";
import Image from "next/image";
import { Carousel } from "@/components/ui/Carousel";
import { ImageLightbox } from "./ImageLightbox";

export function ProductGallery({
  images,
  productName,
}: {
  images: { id: string; imageUrl: string }[];
  productName: string;
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (images.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-md bg-ivory-soft">
        <span className="font-sans text-sm text-ink-soft">No image available</span>
      </div>
    );
  }

  const slides = images.map((img, i) => (
    <button
      key={img.id}
      type="button"
      onClick={() => setLightboxIndex(i)}
      aria-label={`View image ${i + 1} of ${images.length}, full screen`}
      // pan-x for gallery swipe, pinch-zoom left enabled for native zoom
      className="relative block aspect-square w-full [touch-action:pan-x_pinch-zoom]"
    >
      <Image
        src={img.imageUrl}
        alt={`${productName} — image ${i + 1} of ${images.length}`}
        fill
        priority={i === 0}
        sizes="(min-width: 768px) 50vw, 100vw"
        className="object-cover"
      />
    </button>
  ));

  return (
    <>
      <Carousel slides={slides} ariaLabel={`${productName} gallery`} />
      {lightboxIndex !== null && (
        <ImageLightbox
          images={images}
          index={lightboxIndex}
          onIndexChange={setLightboxIndex}
          onClose={() => setLightboxIndex(null)}
          productName={productName}
        />
      )}
    </>
  );
}
