"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireAdminUser } from "@/lib/supabase/admin-auth";
import { uploadProductImage, deleteProductImages, MAX_IMAGE_BYTES } from "@/lib/supabase/storage";

export type ActionResult = { error: string | null };

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type VariantInput = { name: string; stock: number; price_override: number | null };
type ExistingImageInput = { id: string; image_url: string; sort_order: number };

export async function saveProductAction(formData: FormData): Promise<ActionResult> {
  await requireAdminUser();

  const productId = (formData.get("productId") as string) || null;
  const name = ((formData.get("name") as string) ?? "").trim();
  const slugInput = ((formData.get("slug") as string) ?? "").trim();
  const slug = slugify(slugInput || name);
  const description = ((formData.get("description") as string) ?? "").trim() || null;
  const priceRaw = formData.get("price") as string;
  const mrpRaw = formData.get("mrp") as string;
  const stockRaw = formData.get("stock") as string;
  const material = ((formData.get("material") as string) ?? "").trim() || null;
  const badgeText = ((formData.get("badge_text") as string) ?? "").trim() || null;
  const categoryId = formData.get("category_id") as string;
  const isBestseller = formData.get("is_bestseller") === "on";
  const isNewArrival = formData.get("is_new_arrival") === "on";

  if (!name) return { error: "Product name is required." };
  if (!slug) return { error: "Please use a product name with at least one letter or number." };
  if (!categoryId) return { error: "Category is required." };

  const price = Number(priceRaw);
  if (!Number.isFinite(price) || price < 0) {
    return { error: "Price must be a valid non-negative number." };
  }
  const mrp = mrpRaw ? Number(mrpRaw) : null;
  if (mrp !== null && (!Number.isFinite(mrp) || mrp < 0)) {
    return { error: "MRP must be a valid non-negative number." };
  }
  const stock = stockRaw ? Number(stockRaw) : 0;
  if (!Number.isInteger(stock) || stock < 0) {
    return { error: "Stock must be a non-negative whole number." };
  }

  let variants: VariantInput[] = [];
  try {
    variants = JSON.parse((formData.get("variants") as string) || "[]");
  } catch {
    return { error: "Invalid variant data." };
  }
  for (const v of variants) {
    if (!v.name?.trim()) return { error: "Each variant needs a name." };
    if (!Number.isInteger(v.stock) || v.stock < 0) {
      return { error: `Variant "${v.name}" has an invalid stock value.` };
    }
    if (v.price_override !== null && (!Number.isFinite(v.price_override) || v.price_override < 0)) {
      return { error: `Variant "${v.name}" has an invalid price override.` };
    }
  }

  let keepImages: ExistingImageInput[] = [];
  try {
    keepImages = JSON.parse((formData.get("existingImages") as string) || "[]");
  } catch {
    return { error: "Invalid image data." };
  }

  const newImageFiles = formData.getAll("newImages").filter((f): f is File => f instanceof File && f.size > 0);

  // Validate sizes before touching the DB at all — a rejected upload
  // shouldn't leave a half-saved product behind.
  for (const file of newImageFiles) {
    if (file.size > MAX_IMAGE_BYTES) {
      return {
        error: `"${file.name}" is ${(file.size / 1024 / 1024).toFixed(1)}MB — the limit is ${MAX_IMAGE_BYTES / 1024 / 1024}MB.`,
      };
    }
  }

  const productRow = {
    name,
    slug,
    description,
    price,
    mrp,
    stock,
    material,
    badge_text: badgeText,
    category_id: categoryId,
    is_bestseller: isBestseller,
    is_new_arrival: isNewArrival,
  };

  let savedProductId = productId;

  if (productId) {
    const { error } = await supabaseAdmin.from("products").update(productRow).eq("id", productId);
    if (error) {
      if (error.code === "23505") return { error: "A product with this name already exists — please use a slightly different name." };
      return { error: `Could not update product: ${error.message}` };
    }
  } else {
    const { data, error } = await supabaseAdmin.from("products").insert(productRow).select("id").single();
    if (error) {
      if (error.code === "23505") return { error: "A product with this name already exists — please use a slightly different name." };
      return { error: `Could not create product: ${error.message}` };
    }
    savedProductId = data.id;
  }

  if (!savedProductId) return { error: "Something went wrong saving the product." };

  // Images: remove any dropped from the form (+ their storage objects),
  // keep the rest in their (possibly reordered) positions, upload new ones.
  const { data: currentImages } = await supabaseAdmin
    .from("product_images")
    .select("id, image_url")
    .eq("product_id", savedProductId);

  const keepIds = new Set(keepImages.map((i) => i.id));
  const toDelete = (currentImages ?? []).filter((img) => !keepIds.has(img.id));
  if (toDelete.length > 0) {
    await deleteProductImages(toDelete.map((i) => i.image_url));
    await supabaseAdmin
      .from("product_images")
      .delete()
      .in("id", toDelete.map((i) => i.id));
  }

  await Promise.all(
    keepImages.map((img) =>
      supabaseAdmin.from("product_images").update({ sort_order: img.sort_order }).eq("id", img.id)
    )
  );

  let nextSortOrder = keepImages.length;
  for (const file of newImageFiles) {
    try {
      const url = await uploadProductImage(file, savedProductId);
      await supabaseAdmin.from("product_images").insert({
        product_id: savedProductId,
        image_url: url,
        sort_order: nextSortOrder++,
      });
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Image upload failed." };
    }
  }

  // Variants: replace the full set rather than diffing update/insert/delete
  // — simplest correct approach at this scale (a handful of rows per product).
  await supabaseAdmin.from("product_variants").delete().eq("product_id", savedProductId);
  if (variants.length > 0) {
    const { error: variantError } = await supabaseAdmin.from("product_variants").insert(
      variants.map((v) => ({
        product_id: savedProductId,
        variant_name: v.name.trim(),
        stock: v.stock,
        price_override: v.price_override,
      }))
    );
    if (variantError) return { error: `Could not save variants: ${variantError.message}` };
  }

  // Categories/products feed the header nav, homepage, category pages and
  // product pages — revalidate everything rather than tracking every path.
  revalidatePath("/", "layout");

  return { error: null };
}

export async function deleteProductAction(productId: string): Promise<ActionResult> {
  await requireAdminUser();

  const { data: images } = await supabaseAdmin
    .from("product_images")
    .select("image_url")
    .eq("product_id", productId);

  if (images?.length) {
    await deleteProductImages(images.map((i) => i.image_url));
  }

  const { error } = await supabaseAdmin.from("products").delete().eq("id", productId);
  if (error) {
    return { error: `Could not delete product: ${error.message}` };
  }

  revalidatePath("/", "layout");
  return { error: null };
}
