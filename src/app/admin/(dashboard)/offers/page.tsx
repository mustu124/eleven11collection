import { getAdminOffers } from "@/lib/supabase/admin-queries";
import { OfferManager } from "@/components/admin/OfferManager";

export const metadata = { title: "Offers" };

export default async function AdminOffersPage() {
  const offers = await getAdminOffers();

  return (
    <div>
      <h1 className="mb-1 font-serif text-2xl text-ink">Offer Zone</h1>
      <p className="mb-6 font-sans text-sm text-ink-soft">
        Changes here go live on the storefront immediately — no redeploy needed.
      </p>
      <OfferManager offers={offers} />
    </div>
  );
}
