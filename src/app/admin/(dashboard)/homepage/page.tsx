import { getAdminBanners, getAdminTopStyles, getAllProductsForPicker } from "@/lib/supabase/admin-queries";
import { BannerSectionEditor } from "@/components/admin/BannerSectionEditor";
import { TopStylesManager } from "@/components/admin/TopStylesManager";

export const metadata = { title: "Homepage" };

const MOOD_SECTIONS = [
  { section: "mood_daily", title: "Daily Wear" },
  { section: "mood_party", title: "Party Wear" },
  { section: "mood_dayout", title: "Day Out" },
];

const GIFTING_SECTIONS = [
  { section: "gifting_her", title: "Gifts for Her" },
  { section: "gifting_him", title: "Gifts for Him" },
];

export default async function AdminHomepagePage() {
  const allSections = ["hero", ...MOOD_SECTIONS.map((m) => m.section), ...GIFTING_SECTIONS.map((g) => g.section)];
  const [banners, topStyleRows, products] = await Promise.all([
    getAdminBanners(allSections),
    getAdminTopStyles(),
    getAllProductsForPicker(),
  ]);

  const bySection = (section: string) => banners.filter((b) => b.section === section);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-serif text-2xl text-ink">Homepage</h1>
        <p className="mt-1 font-sans text-sm text-ink-soft">
          Changes here go live on the storefront immediately — no redeploy needed.
        </p>
      </div>

      <section>
        <h2 className="mb-3 font-sans text-xs uppercase tracking-wide text-ink-soft">Hero Carousel</h2>
        <BannerSectionEditor section="hero" title="Hero Banners" banners={bySection("hero")} />
      </section>

      <section>
        <h2 className="mb-3 font-sans text-xs uppercase tracking-wide text-ink-soft">
          Mood / Occasion Banners
        </h2>
        <div className="grid gap-4 lg:grid-cols-3">
          {MOOD_SECTIONS.map((m) => (
            <BannerSectionEditor key={m.section} section={m.section} title={m.title} banners={bySection(m.section)} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-sans text-xs uppercase tracking-wide text-ink-soft">Gifting Banners</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {GIFTING_SECTIONS.map((g) => (
            <BannerSectionEditor key={g.section} section={g.section} title={g.title} banners={bySection(g.section)} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-sans text-xs uppercase tracking-wide text-ink-soft">Top Styles Tabs</h2>
        <TopStylesManager rows={topStyleRows} products={products} />
      </section>
    </div>
  );
}
