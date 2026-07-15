import Link from "next/link";
import type { HomeBanner } from "@/lib/supabase/queries";
import { Carousel } from "@/components/ui/Carousel";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";

export function HeroCarousel({ banners }: { banners: HomeBanner[] }) {
  if (banners.length === 0) return null;

  const slides = banners.map((banner, i) => {
    const image = (
      <div className="relative aspect-[4/5] w-full sm:aspect-[21/9]">
        <ImageWithFallback
          src={banner.image_url}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end gap-2 p-6 sm:justify-center sm:gap-3 sm:p-12">
          <p className="w-fit rounded bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-gold-dark backdrop-blur-sm sm:text-sm">
            Eleven 11 Collection
          </p>
          <h1 className="w-fit max-w-md rounded bg-white/70 px-4 py-2 font-serif text-3xl font-bold leading-tight text-ink backdrop-blur-sm sm:text-5xl">
            Timeless diamonds, made for you
          </h1>
          <p className="w-fit max-w-sm rounded bg-white/70 px-3 py-1.5 text-sm text-ink/85 backdrop-blur-sm sm:text-base">
            Fine jewellery crafted with rare stones and lasting brilliance.
          </p>
          <span className="mt-2 inline-flex w-fit items-center rounded-full bg-gold px-6 py-3 text-xs font-semibold uppercase tracking-wide text-white shadow-sm sm:text-sm">
            Shop Now
          </span>
        </div>
      </div>
    );

    // The image is decorative (alt="") and banners don't have their own
    // admin-editable label yet, so the link needs its own accessible name
    // — otherwise it reaches screen readers as a link with nothing to say.
    return banner.link_url ? (
      <Link href={banner.link_url} key={banner.id} aria-label={`Featured — slide ${i + 1}`}>
        {image}
      </Link>
    ) : (
      image
    );
  });

  return (
    <section aria-label="Featured">
      <Carousel slides={slides} ariaLabel="Hero banners" autoRotate />
    </section>
  );
}
