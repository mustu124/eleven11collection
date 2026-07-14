import Link from "next/link";
import { getAdminProducts } from "@/lib/supabase/admin-queries";
import { ProductTable } from "@/components/admin/ProductTable";

export const metadata = { title: "Products" };

export default async function AdminProductsPage() {
  const products = await getAdminProducts();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-2xl text-ink">Products</h1>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-gold-dark px-5 py-2 font-sans text-sm font-medium text-white hover:opacity-90"
        >
          Add Product
        </Link>
      </div>
      <ProductTable products={products} />
    </div>
  );
}
