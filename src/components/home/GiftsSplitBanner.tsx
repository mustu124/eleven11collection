import Link from "next/link";
import type { HomeBanner } from "@/lib/supabase/queries";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";

const LABELS: Record<string, string> = {
  gifting_her: "Gifts for Her",
  gifting_him: "Gifts for Him",
};

export function GiftsSplitBanner({ banners }: { banners: HomeBanner[] }) {
  if (banners.length === 0) return null;

  return (
    <section aria-label="Gifting" className="grid grid-cols-1 gap-3 px-4 py-8 sm:grid-cols-2 md:px-8">
      {banners.map((banner) => {
        const content = (
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg sm:aspect-[3/4]">
            <ImageWithFallback
              src={banner.image_url}
              alt=""
              fill
              sizes="(min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
            <span className="absolute bottom-4 left-4 font-serif text-xl text-white drop-shadow">
              {LABELS[banner.section] ?? banner.section}
            </span>
          </div>
        );

        return banner.link_url ? (
          <Link href={banner.link_url} key={banner.id}>
            {content}
          </Link>
        ) : (
          <div key={banner.id}>{content}</div>
        );
      })}
    </section>
  );
}
