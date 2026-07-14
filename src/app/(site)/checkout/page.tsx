import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { getWhatsAppNumber } from "@/lib/supabase/queries";

export const metadata = { title: "Checkout" };

// Without this, the WhatsApp number (admin-editable in /admin/settings)
// would freeze into this page's build-time value — same fix as the
// homepage/product/category pages.
export const revalidate = 60;

export default async function CheckoutPage() {
  const whatsappNumber = await getWhatsAppNumber();
  return <CheckoutForm whatsappNumber={whatsappNumber} />;
}
