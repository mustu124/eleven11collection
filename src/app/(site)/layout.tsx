import { Providers } from "@/lib/store/providers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { getActiveCategories } from "@/lib/supabase/queries";

// Categories, banners and products are admin-editable in Supabase — never
// let the header/homepage/category tree freeze into a static build output.
export const revalidate = 60;

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = await getActiveCategories();

  return (
    <Providers>
      <Header categories={categories} />
      <main className="min-h-[60vh]">{children}</main>
      <Footer />
      <MobileTabBar />
      <CartDrawer />
    </Providers>
  );
}
