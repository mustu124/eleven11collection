import { notFound } from "next/navigation";
import { getAllCategoriesForAdmin, getProductForAdmin } from "@/lib/supabase/admin-queries";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata = { title: "Edit Product" };

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const [product, categories] = await Promise.all([
    getProductForAdmin(params.id),
    getAllCategoriesForAdmin(),
  ]);

  if (!product) notFound();

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl text-ink">Edit Product</h1>
      <ProductForm
        categories={categories}
        initialData={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: product.price,
          mrp: product.mrp,
          stock: product.stock,
          material: product.material,
          badgeText: product.badgeText,
          categoryId: product.categoryId,
          isBestseller: product.isBestseller,
          isNewArrival: product.isNewArrival,
          images: product.images,
          variants: product.variants,
        }}
      />
    </div>
  );
}
