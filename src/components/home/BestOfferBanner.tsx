import Link from "next/link";
import type { Offer } from "@/lib/supabase/queries";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";

export function BestOfferBanner({ offer }: { offer: Offer | null }) {
  if (!offer) return null;

  return (
    <section aria-label="Best offer" className="px-4 py-6 md:px-8">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-lg border border-gold/30 bg-ivory-soft sm:flex sm:items-stretch">
        <div className="relative aspect-[16/9] w-full sm:aspect-auto sm:w-2/5">
          <ImageWithFallback
            src={offer.imageUrl ?? "/banner-fallback.svg"}
            alt=""
            fill
            sizes="(min-width: 640px) 40vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="flex flex-1 flex-col justify-center gap-2 p-6">
          <span className="w-fit rounded-full bg-gold-dark px-3 py-1 font-sans text-xs uppercase tracking-wide text-white">
            Best Offer
          </span>
          <h2 className="font-serif text-xl text-ink md:text-2xl">{offer.title}</h2>
          {offer.description && (
            <p className="font-sans text-sm text-ink-soft">{offer.description}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-4">
            {offer.linkUrl && (
              <Link
                href={offer.linkUrl}
                className="rounded-full bg-gold-dark px-5 py-2 font-sans text-sm font-medium text-white hover:opacity-90"
              >
                Shop Now
              </Link>
            )}
            <Link
              href="/offers"
              className="font-sans text-sm text-ink-soft underline hover:text-gold"
            >
              See all offers
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
