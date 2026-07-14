import { getAllCategoriesForAdmin } from "@/lib/supabase/admin-queries";
import { CategoryManager } from "@/components/admin/CategoryManager";

export const metadata = { title: "Categories" };

export default async function AdminCategoriesPage() {
  const categories = await getAllCategoriesForAdmin();

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl text-ink">Categories</h1>
      <CategoryManager categories={categories} />
    </div>
  );
}
