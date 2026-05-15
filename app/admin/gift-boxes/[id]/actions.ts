"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { GiftBoxSaveSchema, type GiftBoxSaveInput } from "@/lib/admin/gift-boxes";
import { requireAdmin } from "@/lib/admin/auth";

/**
 * Sprint 2.3b , Gift box CRUD server actions.
 * Patterns mirror lib/admin/products.ts: zod-validate FormData, upsert via
 * service-role client (RLS bypass), revalidate public + admin paths.
 */

function parseFormData(formData: FormData): GiftBoxSaveInput {
  const raw = {
    slug: String(formData.get("slug") ?? "").trim(),
    categoryId: String(formData.get("categoryId") ?? "").trim(),
    heroImagePath: (formData.get("heroImagePath") as string | null) || null,
    defaultQuantityMin: formData.get("defaultQuantityMin") ?? 5,
    sortOrder: formData.get("sortOrder") ?? 0,
    isCustomizable: formData.get("isCustomizable") === "on",
    translations: {
      en: {
        name: String(formData.get("name_en") ?? "").trim(),
        tagline: (formData.get("tagline_en") as string | null) || null,
        storyIntro: (formData.get("storyIntro_en") as string | null) || null,
      },
      fr: {
        name: String(formData.get("name_fr") ?? "").trim(),
        tagline: (formData.get("tagline_fr") as string | null) || null,
        storyIntro: (formData.get("storyIntro_fr") as string | null) || null,
      },
    },
    itemProductIds: ((formData.get("itemProductIds") as string | null) ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  };
  return GiftBoxSaveSchema.parse(raw);
}

export async function saveGiftBox(id: string | "new", formData: FormData) {
  const admin = await requireAdmin();
  const data = parseFormData(formData);
  const supabase = createServiceRoleClient();

  const isCreate = id === "new";
  const payload = {
    slug: data.slug,
    category_id: data.categoryId,
    hero_image_path: data.heroImagePath,
    default_quantity_min: data.defaultQuantityMin,
    sort_order: data.sortOrder,
    is_customizable: data.isCustomizable,
    updated_by: admin.id,
  };

  let giftBoxId: string;
  if (isCreate) {
    const { data: row, error } = await supabase
      .from("gift_boxes")
      .insert({ ...payload, created_by: admin.id, status: "draft" })
      .select("id")
      .single();
    if (error || !row) throw new Error(`gift_box insert: ${error?.message}`);
    giftBoxId = row.id;
  } else {
    const { error } = await supabase.from("gift_boxes").update(payload).eq("id", id);
    if (error) throw new Error(`gift_box update: ${error.message}`);
    giftBoxId = id;
  }

  // Translations: upsert one per locale.
  for (const locale of ["en", "fr"] as const) {
    const t = data.translations[locale];
    const { error } = await supabase.from("gift_box_translations").upsert(
      {
        gift_box_id: giftBoxId,
        locale,
        name: t.name,
        tagline: t.tagline,
        story_intro: t.storyIntro,
      },
      { onConflict: "gift_box_id,locale" }
    );
    if (error) throw new Error(`gift_box_translations ${locale}: ${error.message}`);
  }

  // Items: wipe and replace based on the form's ordered list.
  await supabase.from("gift_box_items").delete().eq("gift_box_id", giftBoxId);
  if (data.itemProductIds.length > 0) {
    const rows = data.itemProductIds.map((pid, i) => ({
      gift_box_id: giftBoxId,
      product_id: pid,
      sort_order: i,
    }));
    const { error } = await supabase.from("gift_box_items").insert(rows);
    if (error) throw new Error(`gift_box_items insert: ${error.message}`);
  }

  revalidatePath("/en/products", "layout");
  revalidatePath("/fr/products", "layout");
  revalidatePath("/admin/gift-boxes");

  if (isCreate) redirect(`/admin/gift-boxes/${giftBoxId}?saved=1`);
}

export async function setGiftBoxStatus(id: string, status: "draft" | "published") {
  await requireAdmin();
  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("gift_boxes")
    .update({
      status,
      published_at: status === "published" ? new Date().toISOString() : null,
    })
    .eq("id", id);
  if (error) throw new Error(`gift_box status: ${error.message}`);
  revalidatePath("/en/products", "layout");
  revalidatePath("/fr/products", "layout");
  revalidatePath(`/admin/gift-boxes/${id}`);
  revalidatePath("/admin/gift-boxes");
}

export async function deleteGiftBox(id: string) {
  await requireAdmin();
  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("gift_boxes").delete().eq("id", id);
  if (error) throw new Error(`gift_box delete: ${error.message}`);
  revalidatePath("/en/products", "layout");
  revalidatePath("/fr/products", "layout");
  revalidatePath("/admin/gift-boxes");
  redirect("/admin/gift-boxes");
}
