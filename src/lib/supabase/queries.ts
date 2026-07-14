import { supabase } from "./client";

export type NavCategory = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
};

export async function getActiveCategories(): Promise<NavCategory[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, image_url")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Failed to load categories:", error.message);
    return [];
  }

  return data ?? [];
}

export async function getCategoryBySlug(slug: string): Promise<NavCategory | null> {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, image_url")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error(`Failed to load category "${slug}":`, error.message);
    return null;
  }

  return data;
}

export type HomeBanner = {
  id: string;
  section: string;
  image_url: string;
  link_url: string | null;
};

async function getBannersBySections(sections: string[]): Promise<HomeBanner[]> {
  const { data, error } = await supabase
    .from("homepage_banners")
    .select("id, section, image_url, link_url")
    .eq("is_active", true)
    .in("section", sections)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error(`Failed to load banners for [${sections.join(", ")}]:`, error.message);
    return [];
  }

  return data ?? [];
}

export function getHeroBanners(): Promise<HomeBanner[]> {
  return getBannersBySections(["hero"]);
}

export async function getMoodBanners(): Promise<HomeBanner[]> {
  const { data, error } = await supabase
    .from("homepage_banners")
    .select("id, section, image_url, link_url")
    .eq("is_active", true)
    .like("section", "mood_%")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Failed to load mood banners:", error.message);
    return [];
  }

  return data ?? [];
}

export function getGiftBanners(): Promise<HomeBanner[]> {
  return getBannersBySections(["gifting_her"]);
}

export type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  price: number;
  mrp: number | null;
  badgeText: string | null;
  image: string | null;
};

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  price: number;
  mrp: number | null;
  badge_text: string | null;
  product_images: { image_url: string; sort_order: number }[];
};

const PRODUCT_CARD_COLUMNS =
  "id, name, slug, price, mrp, badge_text, created_at, product_images(image_url, sort_order)";

function mapProductRow(row: ProductRow): ProductCardData {
  const firstImage = [...(row.product_images ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order
  )[0];

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    price: row.price,
    mrp: row.mrp,
    badgeText: row.badge_text,
    image: firstImage?.image_url ?? null,
  };
}

export type TopStyleProduct = {
  rowId: string;
  tab: string;
  product: ProductCardData;
};

export async function getTopStyles(): Promise<TopStyleProduct[]> {
  const { data, error } = await supabase
    .from("homepage_top_styles")
    .select(`id, tab, sort_order, products(${PRODUCT_CARD_COLUMNS})`)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Failed to load top styles:", error.message);
    return [];
  }

  return (data ?? [])
    .filter((row) => row.products)
    .map((row) => ({
      rowId: row.id,
      tab: row.tab,
      product: mapProductRow(row.products as unknown as ProductRow),
    }));
}

export type ProductSort = "price_asc" | "price_desc" | "newest";

export type CategoryProductFilters = {
  categoryId: string;
  minPrice?: number;
  maxPrice?: number;
  material?: string;
  sort?: ProductSort;
};

export async function getCategoryProducts(
  filters: CategoryProductFilters
): Promise<ProductCardData[]> {
  let query = supabase
    .from("products")
    .select(PRODUCT_CARD_COLUMNS)
    .eq("category_id", filters.categoryId);

  if (filters.minPrice !== undefined) query = query.gte("price", filters.minPrice);
  if (filters.maxPrice !== undefined) query = query.lte("price", filters.maxPrice);
  if (filters.material) query = query.eq("material", filters.material);

  if (filters.sort === "price_asc") {
    query = query.order("price", { ascending: true });
  } else if (filters.sort === "price_desc") {
    query = query.order("price", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to load category products:", error.message);
    return [];
  }

  return (data ?? []).map((row) => mapProductRow(row as unknown as ProductRow));
}

export async function getCategoryMaterials(categoryId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("products")
    .select("material")
    .eq("category_id", categoryId)
    .not("material", "is", null);

  if (error) {
    console.error("Failed to load category materials:", error.message);
    return [];
  }

  const materials = new Set((data ?? []).map((row) => row.material).filter((m): m is string => !!m));
  return Array.from(materials).sort();
}

function escapeLikePattern(term: string) {
  // Escape LIKE metacharacters (and the escape char itself) so a search
  // term containing "%" or "_" is matched literally instead of acting as
  // a wildcard. `.ilike()` values are sent as normal parameterized query
  // values (not string-interpolated SQL), so this is about correct
  // matching, not injection — quotes/commas need no special handling here.
  return term.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

export async function searchProducts(term: string): Promise<ProductCardData[]> {
  const trimmed = term.trim();
  if (!trimmed) return [];

  const pattern = `%${escapeLikePattern(trimmed)}%`;

  // Two separate ilike queries + client-side merge, rather than a single
  // `.or("name.ilike...,description.ilike...")` — the `.or()` filter is a
  // hand-built DSL string where commas/parentheses in the search term
  // would corrupt the filter syntax. Plain `.ilike()` calls pass the term
  // as a normal query parameter, so arbitrary characters are safe.
  const [byName, byDescription] = await Promise.all([
    supabase.from("products").select(PRODUCT_CARD_COLUMNS).ilike("name", pattern).limit(24),
    supabase.from("products").select(PRODUCT_CARD_COLUMNS).ilike("description", pattern).limit(24),
  ]);

  if (byName.error) console.error("Search by name failed:", byName.error.message);
  if (byDescription.error) console.error("Search by description failed:", byDescription.error.message);

  const merged = new Map<string, ProductCardData>();
  for (const row of [...(byName.data ?? []), ...(byDescription.data ?? [])]) {
    const mapped = mapProductRow(row as unknown as ProductRow);
    merged.set(mapped.id, mapped);
  }
  return Array.from(merged.values());
}

export type ProductVariant = {
  id: string;
  name: string;
  priceOverride: number | null;
  stock: number;
};

export type ProductDetail = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  mrp: number | null;
  stock: number;
  material: string | null;
  badgeText: string | null;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  images: { id: string; imageUrl: string }[];
  variants: ProductVariant[];
};

type ProductDetailRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  mrp: number | null;
  stock: number;
  material: string | null;
  badge_text: string | null;
  category_id: string;
  categories: { name: string; slug: string } | null;
  product_images: { id: string; image_url: string; sort_order: number }[];
  product_variants: { id: string; variant_name: string; price_override: number | null; stock: number }[];
};

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  const { data, error } = await supabase
    .from("products")
    .select(
      `id, name, slug, description, price, mrp, stock, material, badge_text, category_id,
       categories(name, slug),
       product_images(id, image_url, sort_order),
       product_variants(id, variant_name, price_override, stock)`
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error(`Failed to load product "${slug}":`, error.message);
    return null;
  }
  if (!data) return null;

  const row = data as unknown as ProductDetailRow;

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    price: row.price,
    mrp: row.mrp,
    stock: row.stock,
    material: row.material,
    badgeText: row.badge_text,
    categoryId: row.category_id,
    categoryName: row.categories?.name ?? "",
    categorySlug: row.categories?.slug ?? "",
    images: [...(row.product_images ?? [])]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((img) => ({ id: img.id, imageUrl: img.image_url })),
    variants: (row.product_variants ?? []).map((v) => ({
      id: v.id,
      name: v.variant_name,
      priceOverride: v.price_override,
      stock: v.stock,
    })),
  };
}

export async function getProductsByIds(ids: string[]): Promise<ProductCardData[]> {
  if (ids.length === 0) return [];

  const { data, error } = await supabase.from("products").select(PRODUCT_CARD_COLUMNS).in("id", ids);

  if (error) {
    console.error("Failed to load wishlist products:", error.message);
    return [];
  }

  return (data ?? []).map((row) => mapProductRow(row as unknown as ProductRow));
}

export type SitemapProduct = { slug: string; createdAt: string };

export async function getAllProductSlugs(): Promise<SitemapProduct[]> {
  const { data, error } = await supabase.from("products").select("slug, created_at");

  if (error) {
    console.error("Failed to load product slugs for sitemap:", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({ slug: row.slug, createdAt: row.created_at }));
}

export async function getRelatedProducts(
  categoryId: string,
  excludeProductId: string
): Promise<ProductCardData[]> {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_CARD_COLUMNS)
    .eq("category_id", categoryId)
    .neq("id", excludeProductId)
    .order("created_at", { ascending: false })
    .limit(8);

  if (error) {
    console.error("Failed to load related products:", error.message);
    return [];
  }

  return (data ?? []).map((row) => mapProductRow(row as unknown as ProductRow));
}

export type CartPriceCheck = { productId: string; variantId: string | null };
export type CurrentPrice = { productId: string; variantId: string | null; price: number };

/**
 * Cart items store the price captured at add-to-cart time (so the cart
 * works offline from localStorage without a network round trip). This
 * looks up the *current* price for each line so the cart drawer can
 * reconcile and flag anything that's since changed, rather than silently
 * honoring a stale snapshot at checkout.
 */
export async function getCurrentPrices(items: CartPriceCheck[]): Promise<CurrentPrice[]> {
  const productIds = Array.from(new Set(items.map((i) => i.productId)));
  if (productIds.length === 0) return [];

  const { data, error } = await supabase
    .from("products")
    .select("id, price, product_variants(id, price_override)")
    .in("id", productIds);

  if (error) {
    console.error("Failed to refresh cart prices:", error.message);
    return [];
  }

  const products = data as unknown as {
    id: string;
    price: number;
    product_variants: { id: string; price_override: number | null }[];
  }[];

  const results: CurrentPrice[] = [];
  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) continue;

    if (item.variantId) {
      const variant = (product.product_variants ?? []).find((v) => v.id === item.variantId);
      if (!variant) continue;
      results.push({
        productId: item.productId,
        variantId: item.variantId,
        price: variant.price_override ?? product.price,
      });
    } else {
      results.push({ productId: item.productId, variantId: null, price: product.price });
    }
  }
  return results;
}

export type Offer = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
};

const OFFER_COLUMNS = "id, title, description, image_url, link_url, is_featured, sort_order";

function mapOfferRow(row: {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  link_url: string | null;
}): Offer {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    imageUrl: row.image_url,
    linkUrl: row.link_url,
  };
}

export async function getActiveOffers(): Promise<Offer[]> {
  const { data, error } = await supabase
    .from("offers")
    .select(OFFER_COLUMNS)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Failed to load offers:", error.message);
    return [];
  }

  return (data ?? []).map(mapOfferRow);
}

export async function getFeaturedOffer(): Promise<Offer | null> {
  const { data, error } = await supabase
    .from("offers")
    .select(OFFER_COLUMNS)
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("sort_order", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Failed to load featured offer:", error.message);
    return null;
  }

  return data ? mapOfferRow(data) : null;
}
