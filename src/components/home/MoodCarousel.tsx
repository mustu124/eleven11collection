import Link from "next/link";
import type { HomeBanner } from "@/lib/supabase/queries";
import { Carousel } from "@/components/ui/Carousel";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";

function moodLabel(section: string) {
  return section
    .replace(/^mood_/, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function MoodCarousel({ banners }: { banners: HomeBanner[] }) {
  if (banners.length === 0) return null;

  const slides = banners.map((banner) => {
    const card = (
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-ivory-soft">
        <ImageWithFallback
          src={banner.image_url}
          alt=""
          fill
          sizes="(min-width: 640px) 260px, 60vw"
          className="object-cover"
        />
        <span className="absolute bottom-3 left-3 rounded-full bg-white/85 px-3 py-1 font-sans text-xs uppercase tracking-wide text-ink">
          {moodLabel(banner.section)}
        </span>
      </div>
    );

    return banner.link_url ? (
      <Link href={banner.link_url} key={banner.id}>
        {card}
      </Link>
    ) : (
      card
    );
  });

  return (
    <section aria-label="Shop by occasion" className="px-4 py-8 md:px-8">
      <h2 className="mb-4 text-center font-serif text-xl text-ink">
        Daily Wear, Party Wear &amp; Day Out
      </h2>
      {/* Fixed-width slides don't stretch to fill a full-bleed section, so on
          wide desktop screens a handful of cards were left flush-left with a
          large dead gap on the right — capping and centering the width fixes
          that while staying a no-op on mobile (viewport is already narrower
          than the cap) and still scrolling normally if more cards are added. */}
      <div className="mx-auto max-w-4xl">
        <Carousel
          slides={slides}
          ariaLabel="Occasion banners"
          showDots={false}
          slideClassName="w-[60vw] shrink-0 snap-start pr-3 sm:w-[260px]"
        />
      </div>
    </section>
  );
}
