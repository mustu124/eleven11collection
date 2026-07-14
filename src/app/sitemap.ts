import type { MetadataRoute } from "next";
import { getActiveCategories, getAllProductSlugs } from "@/lib/supabase/queries";
import { SITE_URL } from "@/lib/site";

// Without this, Next prerenders sitemap.xml once at build time and it goes
// stale the moment a product/category is added via the admin panel (which
// doesn't trigger a redeploy) — revalidate hourly so it stays live.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([getActiveCategories(), getAllProductSlugs()]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/search`, changeFrequency: "weekly", priority: 0.3 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${SITE_URL}/category/${category.slug}`,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${SITE_URL}/product/${product.slug}`,
    lastModified: product.createdAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
