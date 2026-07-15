"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireAdminUser } from "@/lib/supabase/admin-auth";
import { uploadCategoryImage, deleteCategoryImages, MAX_IMAGE_BYTES } from "@/lib/supabase/storage";

export type ActionResult = { error: string | null };

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function saveCategoryAction(formData: FormData): Promise<ActionResult> {
  await requireAdminUser();

  const categoryId = (formData.get("categoryId") as string) || null;
  const name = ((formData.get("name") as string) ?? "").trim();
  const slugInput = ((formData.get("slug") as string) ?? "").trim();
  const slug = slugify(slugInput || name);
  const manualImageUrl = ((formData.get("image_url") as string) ?? "").trim();
  const isActive = formData.get("is_active") === "on";
  const file = formData.get("imageFile");
  const imageFile = file instanceof File && file.size > 0 ? file : null;

  if (!name) return { error: "Category name is required." };
  if (!slug) return { error: "Please use a category name with at least one letter or number." };

  let imageUrl: string | null = manualImageUrl || null;

  if (imageFile) {
    if (imageFile.size > MAX_IMAGE_BYTES) {
      return {
        error: `"${imageFile.name}" is ${(imageFile.size / 1024 / 1024).toFixed(1)}MB — the limit is ${MAX_IMAGE_BYTES / 1024 / 1024}MB.`,
      };
    }
    try {
      imageUrl = await uploadCategoryImage(imageFile);
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Image upload failed." };
    }
  }

  if (categoryId) {
    const { error } = await supabaseAdmin
      .from("categories")
      .update({ name, slug, image_url: imageUrl, is_active: isActive })
      .eq("id", categoryId);
    if (error) {
      if (error.code === "23505") return { error: "A category with this name already exists — please use a slightly different name." };
      return { error: `Could not update category: ${error.message}` };
    }
  } else {
    const { data: maxSort } = await supabaseAdmin
      .from("categories")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    const nextSortOrder = (maxSort?.sort_order ?? 0) + 1;

    const { error } = await supabaseAdmin
      .from("categories")
      .insert({ name, slug, image_url: imageUrl, is_active: isActive, sort_order: nextSortOrder });
    if (error) {
      if (error.code === "23505") return { error: "A category with this name already exists — please use a slightly different name." };
      return { error: `Could not create category: ${error.message}` };
    }
  }

  revalidatePath("/", "layout");
  return { error: null };
}

export async function deleteCategoryAction(categoryId: string): Promise<ActionResult> {
  await requireAdminUser();

  // categories.products has an ON DELETE RESTRICT foreign key by design —
  // a category with products in it should never silently cascade-delete
  // those products. Check first for a clear message instead of surfacing
  // a raw Postgres FK-violation error.
  const { count, error: countError } = await supabaseAdmin
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category_id", categoryId);

  if (countError) {
    return { error: `Could not check category usage: ${countError.message}` };
  }
  if (count && count > 0) {
    return {
      error: `This category has ${count} product${count === 1 ? "" : "s"} in it. Move or delete ${
        count === 1 ? "it" : "them"
      } first.`,
    };
  }

  const { data: category } = await supabaseAdmin
    .from("categories")
    .select("image_url")
    .eq("id", categoryId)
    .maybeSingle();

  const { error } = await supabaseAdmin.from("categories").delete().eq("id", categoryId);
  if (error) {
    // Defensive fallback in case of a race (a product was added between the
    // count check above and this delete) — the DB's RESTRICT constraint is
    // still the real backstop.
    if (error.code === "23503") {
      return { error: "This category still has products in it and can't be deleted." };
    }
    return { error: `Could not delete category: ${error.message}` };
  }

  if (category?.image_url) {
    await deleteCategoryImages([category.image_url]);
  }

  revalidatePath("/", "layout");
  return { error: null };
}

export async function reorderCategoriesAction(orderedIds: string[]): Promise<ActionResult> {
  await requireAdminUser();

  try {
    const results = await Promise.all(
      orderedIds.map((id, index) =>
        supabaseAdmin.from("categories").update({ sort_order: index + 1 }).eq("id", id)
      )
    );
    const failed = results.find((r) => r.error);
    if (failed?.error) {
      return { error: `Could not save the new order: ${failed.error.message}` };
    }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Reorder failed." };
  }

  revalidatePath("/", "layout");
  return { error: null };
}
