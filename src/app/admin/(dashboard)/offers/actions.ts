"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireAdminUser } from "@/lib/supabase/admin-auth";
import { uploadOfferImage, deleteOfferImages, MAX_IMAGE_BYTES } from "@/lib/supabase/storage";

export type ActionResult = { error: string | null };

export async function saveOfferAction(formData: FormData): Promise<ActionResult> {
  await requireAdminUser();

  const offerId = (formData.get("offerId") as string) || null;
  const title = ((formData.get("title") as string) ?? "").trim();
  const description = ((formData.get("description") as string) ?? "").trim() || null;
  const linkUrl = ((formData.get("link_url") as string) ?? "").trim() || null;
  const isFeatured = formData.get("is_featured") === "on";
  const isActive = formData.get("is_active") === "on";
  const manualImageUrl = ((formData.get("image_url") as string) ?? "").trim();
  const file = formData.get("imageFile");
  const imageFile = file instanceof File && file.size > 0 ? file : null;

  if (!title) return { error: "Title is required." };

  let imageUrl: string | null = manualImageUrl || null;

  if (imageFile) {
    if (imageFile.size > MAX_IMAGE_BYTES) {
      return {
        error: `"${imageFile.name}" is ${(imageFile.size / 1024 / 1024).toFixed(1)}MB — the limit is ${MAX_IMAGE_BYTES / 1024 / 1024}MB.`,
      };
    }
    try {
      imageUrl = await uploadOfferImage(imageFile);
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Image upload failed." };
    }
  }

  // Only one offer should ever be "the" homepage feature at a time — turning
  // this one on turns any other featured offer off, rather than needing the
  // admin to remember to untoggle the previous one themselves.
  if (isFeatured) {
    await supabaseAdmin.from("offers").update({ is_featured: false }).eq("is_featured", true);
  }

  if (offerId) {
    const { error } = await supabaseAdmin
      .from("offers")
      .update({
        title,
        description,
        image_url: imageUrl,
        link_url: linkUrl,
        is_featured: isFeatured,
        is_active: isActive,
      })
      .eq("id", offerId);
    if (error) return { error: `Could not update offer: ${error.message}` };
  } else {
    const { data: maxSort } = await supabaseAdmin
      .from("offers")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    const nextSortOrder = (maxSort?.sort_order ?? 0) + 1;

    const { error } = await supabaseAdmin.from("offers").insert({
      title,
      description,
      image_url: imageUrl,
      link_url: linkUrl,
      is_featured: isFeatured,
      is_active: isActive,
      sort_order: nextSortOrder,
    });
    if (error) return { error: `Could not create offer: ${error.message}` };
  }

  revalidatePath("/", "layout");
  return { error: null };
}

export async function deleteOfferAction(offerId: string): Promise<ActionResult> {
  await requireAdminUser();

  const { data: offer } = await supabaseAdmin
    .from("offers")
    .select("image_url")
    .eq("id", offerId)
    .maybeSingle();

  if (offer?.image_url) {
    await deleteOfferImages([offer.image_url]);
  }

  const { error } = await supabaseAdmin.from("offers").delete().eq("id", offerId);
  if (error) return { error: `Could not delete offer: ${error.message}` };

  revalidatePath("/", "layout");
  return { error: null };
}

export async function moveOfferAction(offerId: string, direction: "up" | "down"): Promise<ActionResult> {
  await requireAdminUser();

  const { data: offer } = await supabaseAdmin
    .from("offers")
    .select("id, sort_order")
    .eq("id", offerId)
    .maybeSingle();
  if (!offer) return { error: "Offer not found." };

  let neighborQuery = supabaseAdmin.from("offers").select("id, sort_order");
  neighborQuery =
    direction === "up"
      ? neighborQuery.lt("sort_order", offer.sort_order).order("sort_order", { ascending: false })
      : neighborQuery.gt("sort_order", offer.sort_order).order("sort_order", { ascending: true });

  const { data: neighbor } = await neighborQuery.limit(1).maybeSingle();
  if (!neighbor) return { error: null }; // already at the edge, nothing to do

  await Promise.all([
    supabaseAdmin.from("offers").update({ sort_order: neighbor.sort_order }).eq("id", offer.id),
    supabaseAdmin.from("offers").update({ sort_order: offer.sort_order }).eq("id", neighbor.id),
  ]);

  revalidatePath("/", "layout");
  return { error: null };
}
