import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getCategoryBySlug,
  getCategoryMaterials,
  getCategoryProducts,
  type ProductSort,
} from "@/lib/supabase/queries";
import { CategoryFilters } from "@/components/category/CategoryFilters";
import { ProductCard } from "@/components/product/ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { BackButton } from "@/components/ui/BackButton";

// Next caches server-side data fetches indefinitely by default — without
// this, a product/price/image edit in the admin panel wouldn't appear on
// the live category page until the next redeploy. Same fix as the
// homepage, sitemap, and product page.
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const category = await getCategoryBySlug(params.slug);
  if (!category) return {};

  const description = `Shop ${category.name} at Eleven11 Collection — fine jewellery, thoughtfully made.`;
  const url = `/category/${category.slug}`;

  return {
    title: category.name,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: category.name,
      description,
      url,
      type: "website",
      images: category.image_url ? [{ url: category.image_url, alt: category.name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: category.name,
      description,
      images: category.image_url ? [category.image_url] : undefined,
    },
  };
}

function parseNumberParam(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function parseSortParam(value: string | undefined): ProductSort {
  return value === "price_asc" || value === "price_desc" ? value : "newest";
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { min?: string; max?: string; material?: string; sort?: string };
}) {
  const category = await getCategoryBySlug(params.slug);
  if (!category) notFound();

  const minPrice = parseNumberParam(searchParams.min);
  const maxPrice = parseNumberParam(searchParams.max);
  const material = searchParams.material || undefined;
  const sort = parseSortParam(searchParams.sort);

  const [materials, products] = await Promise.all([
    getCategoryMaterials(category.id),
    getCategoryProducts({ categoryId: category.id, minPrice, maxPrice, material, sort }),
  ]);

  const hasActiveFilters = Boolean(minPrice !== undefined || maxPrice !== undefined || material);

  return (
    <div>
      <div className="px-4 pt-4 md:px-8">
        <BackButton />
      </div>

      <h1 className="px-4 pt-4 text-center font-serif text-2xl text-ink md:px-8">
        {category.name}
      </h1>

      <CategoryFilters materials={materials} />

      {products.length === 0 ? (
        <EmptyState
          title={hasActiveFilters ? "No products match these filters" : "No products yet"}
          description={
            hasActiveFilters
              ? "Try a wider price range or a different material."
              : "New pieces in this category are on the way — check back soon."
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 px-4 pb-12 pt-2 sm:grid-cols-3 md:grid-cols-4 md:px-8">
          {products.map((product, i) => (
            // Only the first row on the narrowest (2-col) layout is truly
            // above the fold — marking more than that "priority" would
            // just compete for bandwidth with the actual LCP image.
            <ProductCard key={product.id} product={product} priority={i < 2} />
          ))}
        </div>
      )}
    </div>
  );
}
