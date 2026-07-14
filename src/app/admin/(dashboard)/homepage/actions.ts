"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireAdminUser } from "@/lib/supabase/admin-auth";
import { uploadBannerImage, deleteBannerImages, MAX_IMAGE_BYTES } from "@/lib/supabase/storage";

export type ActionResult = { error: string | null };

// ---------------------------------------------------------------------
// Banners (hero, mood_daily, mood_party, mood_dayout, gifting_her)
// ---------------------------------------------------------------------

export async function saveBannerAction(formData: FormData): Promise<ActionResult> {
  await requireAdminUser();

  const bannerId = (formData.get("bannerId") as string) || null;
  const section = (formData.get("section") as string)?.trim();
  const linkUrl = ((formData.get("link_url") as string) ?? "").trim() || null;
  const isActive = formData.get("is_active") === "on";
  const manualImageUrl = ((formData.get("image_url") as string) ?? "").trim();
  const file = formData.get("imageFile");
  const imageFile = file instanceof File && file.size > 0 ? file : null;

  if (!section) return { error: "Missing section." };

  let imageUrl = manualImageUrl;

  if (imageFile) {
    if (imageFile.size > MAX_IMAGE_BYTES) {
      return {
        error: `"${imageFile.name}" is ${(imageFile.size / 1024 / 1024).toFixed(1)}MB — the limit is ${MAX_IMAGE_BYTES / 1024 / 1024}MB.`,
      };
    }
    try {
      imageUrl = await uploadBannerImage(imageFile, section);
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Image upload failed." };
    }
  }

  if (!imageUrl) return { error: "An image (uploaded or a URL) is required." };

  if (bannerId) {
    const { error } = await supabaseAdmin
      .from("homepage_banners")
      .update({ image_url: imageUrl, link_url: linkUrl, is_active: isActive })
      .eq("id", bannerId);
    if (error) return { error: `Could not update banner: ${error.message}` };
  } else {
    const { data: maxSort } = await supabaseAdmin
      .from("homepage_banners")
      .select("sort_order")
      .eq("section", section)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    const nextSortOrder = (maxSort?.sort_order ?? 0) + 1;

    const { error } = await supabaseAdmin.from("homepage_banners").insert({
      section,
      image_url: imageUrl,
      link_url: linkUrl,
      is_active: isActive,
      sort_order: nextSortOrder,
    });
    if (error) return { error: `Could not create banner: ${error.message}` };
  }

  revalidatePath("/", "layout");
  return { error: null };
}

export async function deleteBannerAction(bannerId: string): Promise<ActionResult> {
  await requireAdminUser();

  const { data: banner } = await supabaseAdmin
    .from("homepage_banners")
    .select("image_url")
    .eq("id", bannerId)
    .maybeSingle();

  if (banner?.image_url) {
    await deleteBannerImages([banner.image_url]);
  }

  const { error } = await supabaseAdmin.from("homepage_banners").delete().eq("id", bannerId);
  if (error) return { error: `Could not delete banner: ${error.message}` };

  revalidatePath("/", "layout");
  return { error: null };
}

export async function moveBannerAction(
  bannerId: string,
  direction: "up" | "down"
): Promise<ActionResult> {
  await requireAdminUser();

  const { data: banner } = await supabaseAdmin
    .from("homepage_banners")
    .select("id, section, sort_order")
    .eq("id", bannerId)
    .maybeSingle();
  if (!banner) return { error: "Banner not found." };

  // The immediate neighbor in sort order: the closest one below (for "up")
  // or above (for "down") the current banner within the same section.
  let neighborQuery = supabaseAdmin
    .from("homepage_banners")
    .select("id, sort_order")
    .eq("section", banner.section);

  neighborQuery =
    direction === "up"
      ? neighborQuery.lt("sort_order", banner.sort_order).order("sort_order", { ascending: false })
      : neighborQuery.gt("sort_order", banner.sort_order).order("sort_order", { ascending: true });

  const { data: neighbor } = await neighborQuery.limit(1).maybeSingle();
  if (!neighbor) return { error: null }; // already at the edge, nothing to do

  await Promise.all([
    supabaseAdmin.from("homepage_banners").update({ sort_order: neighbor.sort_order }).eq("id", banner.id),
    supabaseAdmin.from("homepage_banners").update({ sort_order: banner.sort_order }).eq("id", neighbor.id),
  ]);

  revalidatePath("/", "layout");
  return { error: null };
}

// ---------------------------------------------------------------------
// Top Styles (homepage_top_styles)
// ---------------------------------------------------------------------

export async function addTopStyleAction(tab: string, productId: string): Promise<ActionResult> {
  await requireAdminUser();

  const trimmedTab = tab.trim();
  if (!trimmedTab) return { error: "Tab name is required." };
  if (!productId) return { error: "Choose a product to add." };

  const { data: existing } = await supabaseAdmin
    .from("homepage_top_styles")
    .select("id")
    .eq("tab", trimmedTab)
    .eq("product_id", productId)
    .maybeSingle();
  if (existing) return { error: "That product is already in this tab." };

  const { data: maxSort } = await supabaseAdmin
    .from("homepage_top_styles")
    .select("sort_order")
    .eq("tab", trimmedTab)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextSortOrder = (maxSort?.sort_order ?? -1) + 1;

  const { error } = await supabaseAdmin
    .from("homepage_top_styles")
    .insert({ tab: trimmedTab, product_id: productId, sort_order: nextSortOrder });
  if (error) return { error: `Could not add product: ${error.message}` };

  revalidatePath("/", "layout");
  return { error: null };
}

export async function removeTopStyleAction(rowId: string): Promise<ActionResult> {
  await requireAdminUser();

  const { error } = await supabaseAdmin.from("homepage_top_styles").delete().eq("id", rowId);
  if (error) return { error: `Could not remove product: ${error.message}` };

  revalidatePath("/", "layout");
  return { error: null };
}

export async function deleteTabAction(tab: string): Promise<ActionResult> {
  await requireAdminUser();

  const { error } = await supabaseAdmin.from("homepage_top_styles").delete().eq("tab", tab);
  if (error) return { error: `Could not delete tab: ${error.message}` };

  revalidatePath("/", "layout");
  return { error: null };
}
