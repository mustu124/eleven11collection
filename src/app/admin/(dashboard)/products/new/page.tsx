import { getAllCategoriesForAdmin } from "@/lib/supabase/admin-queries";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata = { title: "Add Product" };

export default async function NewProductPage() {
  const categories = await getAllCategoriesForAdmin();

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl text-ink">Add Product</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
