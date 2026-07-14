import "server-only";
import { createSupabaseServerClient } from "./server-session";

export type AdminOrder = {
  id: string;
  customerName: string;
  total: number;
  status: string;
  itemCount: number;
  createdAt: string;
};

export async function getRecentOrders(limit = 10): Promise<AdminOrder[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("orders")
    .select("id, customer_name, total, status, cart_items, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to load recent orders:", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    customerName: row.customer_name,
    total: row.total,
    status: row.status,
    itemCount: Array.isArray(row.cart_items) ? row.cart_items.length : 0,
    createdAt: row.created_at,
  }));
}

export type DashboardStats = {
  ordersToday: number;
  ordersThisWeek: number;
  topCategory: { name: string; orderCount: number } | null;
};

type CartItemSnapshot = { productId?: string };

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createSupabaseServerClient();

  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, cart_items, created_at");

  if (error || !orders) {
    console.error("Failed to load dashboard stats:", error?.message);
    return { ordersToday: 0, ordersThisWeek: 0, topCategory: null };
  }

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const ordersToday = orders.filter((o) => new Date(o.created_at) >= startOfToday).length;
  const ordersThisWeek = orders.filter((o) => new Date(o.created_at) >= sevenDaysAgo).length;

  // Top category "by orders": for each order, every distinct category
  // represented in its cart_items counts once — an order with 3 rings
  // still only counts once toward Rings, not three times.
  const productIds = new Set<string>();
  for (const order of orders) {
    const items = (order.cart_items as CartItemSnapshot[] | null) ?? [];
    for (const item of items) {
      if (item?.productId) productIds.add(item.productId);
    }
  }

  let topCategory: DashboardStats["topCategory"] = null;

  if (productIds.size > 0) {
    const [{ data: products }, { data: categories }] = await Promise.all([
      supabase.from("products").select("id, category_id").in("id", Array.from(productIds)),
      supabase.from("categories").select("id, name"),
    ]);

    const productToCategory = new Map((products ?? []).map((p) => [p.id, p.category_id]));
    const categoryNames = new Map((categories ?? []).map((c) => [c.id, c.name]));

    const orderCountByCategory = new Map<string, number>();
    for (const order of orders) {
      const items = (order.cart_items as CartItemSnapshot[] | null) ?? [];
      const categoriesInOrder = new Set<string>();
      for (const item of items) {
        const categoryId = item?.productId ? productToCategory.get(item.productId) : undefined;
        if (categoryId) categoriesInOrder.add(categoryId);
      }
      Array.from(categoriesInOrder).forEach((categoryId) => {
        orderCountByCategory.set(categoryId, (orderCountByCategory.get(categoryId) ?? 0) + 1);
      });
    }

    let bestCategoryId: string | null = null;
    let bestCount = 0;
    Array.from(orderCountByCategory.entries()).forEach(([categoryId, count]) => {
      if (count > bestCount) {
        bestCount = count;
        bestCategoryId = categoryId;
      }
    });

    if (bestCategoryId) {
      topCategory = {
        name: categoryNames.get(bestCategoryId) ?? "Unknown",
        orderCount: bestCount,
      };
    }
  }

  return { ordersToday, ordersThisWeek, topCategory };
}

export type AdminCategoryOption = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
};

export async function getAllCategoriesForAdmin(): Promise<AdminCategoryOption[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, image_url, is_active, sort_order")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Failed to load categories:", error.message);
    return [];
  }

  return (data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    imageUrl: c.image_url,
    isActive: c.is_active,
    sortOrder: c.sort_order,
  }));
}

export type AdminProductListItem = {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  categoryName: string;
  imageUrl: string | null;
};

export async function getAdminProducts(): Promise<AdminProductListItem[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, slug, price, stock, categories(name), product_images(image_url, sort_order)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load products:", error.message);
    return [];
  }

  return (data ?? []).map((row) => {
    const category = row.categories as unknown as { name: string } | null;
    const images = (row.product_images ?? []) as { image_url: string; sort_order: number }[];
    const firstImage = [...images].sort((a, b) => a.sort_order - b.sort_order)[0];
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      price: row.price,
      stock: row.stock,
      categoryName: category?.name ?? "—",
      imageUrl: firstImage?.image_url ?? null,
    };
  });
}

export type AdminProductDetail = {
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
  isBestseller: boolean;
  isNewArrival: boolean;
  images: { id: string; image_url: string; sort_order: number }[];
  variants: { name: string; stock: number; priceOverride: number | null }[];
};

export async function getProductForAdmin(id: string): Promise<AdminProductDetail | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      `id, name, slug, description, price, mrp, stock, material, badge_text, category_id,
       is_bestseller, is_new_arrival,
       product_images(id, image_url, sort_order),
       product_variants(variant_name, stock, price_override)`
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error(`Failed to load product "${id}":`, error.message);
    return null;
  }

  const images = (data.product_images ?? []) as { id: string; image_url: string; sort_order: number }[];
  const variants = (data.product_variants ?? []) as {
    variant_name: string;
    stock: number;
    price_override: number | null;
  }[];

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    description: data.description,
    price: data.price,
    mrp: data.mrp,
    stock: data.stock,
    material: data.material,
    badgeText: data.badge_text,
    categoryId: data.category_id,
    isBestseller: data.is_bestseller,
    isNewArrival: data.is_new_arrival,
    images: [...images].sort((a, b) => a.sort_order - b.sort_order),
    variants: variants.map((v) => ({
      name: v.variant_name,
      stock: v.stock,
      priceOverride: v.price_override,
    })),
  };
}

export type AdminBanner = {
  id: string;
  section: string;
  imageUrl: string;
  linkUrl: string | null;
  sortOrder: number;
  isActive: boolean;
};

export async function getAdminBanners(sections: string[]): Promise<AdminBanner[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("homepage_banners")
    .select("id, section, image_url, link_url, sort_order, is_active")
    .in("section", sections)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Failed to load banners:", error.message);
    return [];
  }

  return (data ?? []).map((b) => ({
    id: b.id,
    section: b.section,
    imageUrl: b.image_url,
    linkUrl: b.link_url,
    sortOrder: b.sort_order,
    isActive: b.is_active,
  }));
}

export type AdminTopStyleRow = {
  rowId: string;
  tab: string;
  sortOrder: number;
  productId: string;
  productName: string;
  productImage: string | null;
};

export async function getAdminTopStyles(): Promise<AdminTopStyleRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("homepage_top_styles")
    .select("id, tab, sort_order, product_id, products(name, product_images(image_url, sort_order))")
    .order("tab", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Failed to load top styles:", error.message);
    return [];
  }

  return (data ?? [])
    .filter((row) => row.products)
    .map((row) => {
      const product = row.products as unknown as {
        name: string;
        product_images: { image_url: string; sort_order: number }[];
      };
      const firstImage = [...(product.product_images ?? [])].sort(
        (a, b) => a.sort_order - b.sort_order
      )[0];
      return {
        rowId: row.id,
        tab: row.tab,
        sortOrder: row.sort_order,
        productId: row.product_id,
        productName: product.name,
        productImage: firstImage?.image_url ?? null,
      };
    });
}

export type AdminProductOption = { id: string; name: string; imageUrl: string | null };

export async function getAllProductsForPicker(): Promise<AdminProductOption[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, product_images(image_url, sort_order)")
    .order("name", { ascending: true });

  if (error) {
    console.error("Failed to load products:", error.message);
    return [];
  }

  return (data ?? []).map((row) => {
    const images = (row.product_images ?? []) as { image_url: string; sort_order: number }[];
    const firstImage = [...images].sort((a, b) => a.sort_order - b.sort_order)[0];
    return { id: row.id, name: row.name, imageUrl: firstImage?.image_url ?? null };
  });
}
