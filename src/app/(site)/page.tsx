import {
  getActiveCategories,
  getFeaturedOffer,
  getGiftBanners,
  getHeroBanners,
  getMoodBanners,
  getTopStyles,
} from "@/lib/supabase/queries";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { CategoryCircles } from "@/components/home/CategoryCircles";
import { TopStyles } from "@/components/home/TopStyles";
import { MoodCarousel } from "@/components/home/MoodCarousel";
import { GiftsSplitBanner } from "@/components/home/GiftsSplitBanner";
import { BestOfferBanner } from "@/components/home/BestOfferBanner";

// Without this, Next prerenders the homepage once at build time and it goes
// stale the moment an admin edits hero banners/categories/top styles via the
// Homepage Builder (which doesn't trigger a redeploy) — revalidate every
// minute so admin edits show up promptly.
export const revalidate = 60;

export default async function Home() {
  const [categories, heroBanners, moodBanners, giftBanners, topStyles, featuredOffer] = await Promise.all([
    getActiveCategories(),
    getHeroBanners(),
    getMoodBanners(),
    getGiftBanners(),
    getTopStyles(),
    getFeaturedOffer(),
  ]);

  return (
    <div>
      <HeroCarousel banners={heroBanners} />
      <CategoryCircles categories={categories} />
      <BestOfferBanner offer={featuredOffer} />
      <TopStyles items={topStyles} />
      <MoodCarousel banners={moodBanners} />
      <GiftsSplitBanner banners={giftBanners} />
    </div>
  );
}
