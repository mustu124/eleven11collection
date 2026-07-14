import type { Metadata } from "next";
import Link from "next/link";
import { getActiveOffers } from "@/lib/supabase/queries";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { EmptyState } from "@/components/ui/EmptyState";
import { BackButton } from "@/components/ui/BackButton";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Offer Zone",
  description: "Current offers and deals at Eleven11 Collection.",
};

export default async function OffersPage() {
  const offers = await getActiveOffers();

  return (
    <div className="px-4 pb-16 pt-4 md:px-8">
      <BackButton />

      <h1 className="mb-2 mt-4 text-center font-serif text-2xl text-ink md:text-3xl">Offer Zone</h1>
      <p className="mb-8 text-center font-sans text-sm text-ink-soft">
        The latest deals, curated just for you.
      </p>

      {offers.length === 0 ? (
        <EmptyState
          title="No offers right now"
          description="Check back soon — new deals are on the way."
        />
      ) : (
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {offers.map((offer) => {
            const card = (
              <div className="overflow-hidden rounded-lg border border-ink/10 bg-white">
                <div className="relative aspect-[4/3] w-full bg-ivory-soft">
                  <ImageWithFallback
                    src={offer.imageUrl ?? "/banner-fallback.svg"}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h2 className="font-serif text-lg text-ink">{offer.title}</h2>
                  {offer.description && (
                    <p className="mt-1 font-sans text-sm text-ink-soft">{offer.description}</p>
                  )}
                </div>
              </div>
            );

            return offer.linkUrl ? (
              <Link href={offer.linkUrl} key={offer.id} className="block hover:opacity-95">
                {card}
              </Link>
            ) : (
              <div key={offer.id}>{card}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
