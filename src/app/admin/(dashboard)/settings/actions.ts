"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireAdminUser } from "@/lib/supabase/admin-auth";

export type ActionResult = { error: string | null };

export async function saveWhatsAppNumberAction(formData: FormData): Promise<ActionResult> {
  await requireAdminUser();

  const raw = ((formData.get("whatsapp_number") as string) ?? "").trim();
  const digits = raw.replace(/\D/g, "");

  if (digits.length !== 10) {
    return { error: "Enter a valid 10-digit mobile number (no country code)." };
  }

  const { error } = await supabaseAdmin
    .from("settings")
    .upsert({ key: "whatsapp_number", value: digits, updated_at: new Date().toISOString() });

  if (error) return { error: `Could not save: ${error.message}` };

  revalidatePath("/", "layout");
  return { error: null };
}
