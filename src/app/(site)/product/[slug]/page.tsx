import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug, getRelatedProducts } from "@/lib/supabase/queries";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { BackButton } from "@/components/ui/BackButton";

// Next caches server-side data fetches indefinitely by default — without
// this, a price/stock/image edit in the admin panel wouldn't appear on the
// live product page until the next redeploy, even though the route itself
// is dynamic. Same fix as the homepage and sitemap.
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return {};

  const description =
    product.description ??
    `Shop ${product.name} at Eleven11 Collection — fine jewellery, thoughtfully made.`;
  const image = product.images[0]?.imageUrl;
  const url = `/product/${product.slug}`;

  return {
    title: product.name,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: product.name,
      description,
      url,
      type: "website",
      images: image ? [{ url: image, alt: product.name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.categoryId, product.id);

  return (
    <div>
      <div className="px-4 pt-4 md:px-8">
        <BackButton />
      </div>

      <div className="grid gap-6 px-4 py-6 md:grid-cols-2 md:gap-10 md:px-8 md:py-10">
        <ProductGallery images={product.images} productName={product.name} />
        <ProductInfo product={product} image={product.images[0]?.imageUrl ?? null} />
      </div>
      <RelatedProducts items={related} />
    </div>
  );
}
