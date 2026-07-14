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
      <Carousel slides={slides} ariaLabel="Hero banners" />
    </section>
  );
}
