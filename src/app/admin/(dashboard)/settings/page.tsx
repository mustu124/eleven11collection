import { getWhatsAppNumber } from "@/lib/supabase/queries";
import { WhatsAppNumberForm } from "@/components/admin/WhatsAppNumberForm";

export const metadata = { title: "Settings" };

// getWhatsAppNumber() uses the public (non-cookie) client, so this page has
// no dynamic API usage Next would otherwise force it dynamic on — without
// this it could serve a stale cached number between explicit revalidations.
export const revalidate = 60;

export default async function AdminSettingsPage() {
  const whatsappNumber = await getWhatsAppNumber();

  return (
    <div>
      <h1 className="mb-1 font-serif text-2xl text-ink">Settings</h1>
      <p className="mb-6 font-sans text-sm text-ink-soft">
        Changes here go live on the storefront immediately — no redeploy needed.
      </p>
      <WhatsAppNumberForm currentNumber={whatsappNumber} />
    </div>
  );
}
