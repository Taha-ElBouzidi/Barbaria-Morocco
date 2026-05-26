"use server";

import { revalidatePath, updateTag } from "next/cache";
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
    leadTimeWeeksMin: formData.get("leadTimeWeeksMin") ?? 4,
    leadTimeWeeksMax: formData.get("leadTimeWeeksMax") ?? 6,
    sortOrder: formData.get("sortOrder") ?? 0,
    isCustomizable: formData.get("isCustomizable") === "on",
    // Multi-select checkboxes return one entry per checked value
    // under the same name; getAll() collects them as strings.
    customSizeOptions: formData.getAll("customSizeOptions"),
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

export type SaveGiftBoxResult =
  | { ok: true; id: string; created: boolean }
  | { ok: false; error: string };

export async function saveGiftBox(
  id: string | "new",
  formData: FormData
): Promise<SaveGiftBoxResult> {
  const admin = await requireAdmin();

  // Zod parse can throw on bad input, catch so we return a typed
  // error to the client instead of a generic server-error digest.
  // The maison saw repeated "reload" errors when invalid form state
  // hit the action; this turns them into actionable messages.
  let data;
  try {
    data = parseFormData(formData);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Invalid form data";
    console.error("[saveGiftBox] parse failed:", { id, msg });
    return { ok: false, error: `Invalid form data: ${msg}` };
  }

  const supabase = createServiceRoleClient();
  const isCreate = id === "new";

  // One-customizable-per-category rule. Tick the box on at most one
  // gift box per category, that becomes the "Compose your own"
  // wizard entry for that category. Block the save with a typed error
  // when another box already owns the slot.
  if (data.isCustomizable) {
    const { data: existing, error: lookupErr } = await supabase
      .from("gift_boxes")
      .select("id, slug")
      .eq("category_id", data.categoryId)
      .eq("is_customizable", true);
    if (lookupErr) {
      console.error("[saveGiftBox] customizable lookup failed:", lookupErr);
      return { ok: false, error: `Could not verify the customizable slot: ${lookupErr.message}` };
    }
    const conflict = (existing ?? []).find((r: { id: string }) => r.id !== id);
    if (conflict) {
      return {
        ok: false,
        error: `Another box (${conflict.slug}) is already the "Compose your own" entry for this category. Untick its customizable flag first, or pick a different category.`,
      };
    }
  }

  // Surface the cross-field constraint client-side; the DB CHECK
  // (lead_time_weeks_max >= lead_time_weeks_min) is the final gate.
  if (data.leadTimeWeeksMax < data.leadTimeWeeksMin) {
    return {
      ok: false,
      error: "Lead time max must be at least the min value.",
    };
  }
  // Dedupe + sort the custom size options for storage. The DB CHECK
  // requires each value in {1..6}; Zod already validates that.
  // Curated (non-customizable) boxes don't render the checkbox UI so
  // the form submits an empty array; we omit the column from the
  // payload in that case to preserve whatever's in the DB.
  const sortedSizes = Array.from(new Set(data.customSizeOptions)).sort(
    (a, b) => a - b
  );
  // sort_order is managed by the list view's arrow buttons (reorderGiftBox).
  // We deliberately do NOT write it from the editor save path; otherwise
  // every edit would clobber the order the admin set in the list.
  const payload: Record<string, unknown> = {
    slug: data.slug,
    category_id: data.categoryId,
    hero_image_path: data.heroImagePath,
    default_quantity_min: data.defaultQuantityMin,
    lead_time_weeks_min: data.leadTimeWeeksMin,
    lead_time_weeks_max: data.leadTimeWeeksMax,
    is_customizable: data.isCustomizable,
    updated_by: admin.id,
  };
  if (data.isCustomizable) {
    payload.custom_size_options = sortedSizes;
  }

  let giftBoxId: string;
  if (isCreate) {
    const { data: row, error } = await supabase
      .from("gift_boxes")
      .insert({ ...payload, created_by: admin.id, status: "draft" })
      .select("id")
      .single();
    if (error || !row) {
      console.error("[saveGiftBox] insert failed:", error);
      return { ok: false, error: `Could not create gift box: ${error?.message ?? "unknown"}` };
    }
    giftBoxId = row.id;
  } else {
    const { error } = await supabase.from("gift_boxes").update(payload).eq("id", id);
    if (error) {
      console.error("[saveGiftBox] update failed:", { id, error });
      return { ok: false, error: `Could not update gift box: ${error.message}` };
    }
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
    if (error) {
      console.error("[saveGiftBox] translations failed:", { locale, error });
      return { ok: false, error: `Translations (${locale}) failed: ${error.message}` };
    }
  }

  // Items: wipe and replace based on the form's ordered list. For a
  // customizable box we explicitly keep gift_box_items empty, the
  // wizard generates each buyer's composition on demand.
  await supabase.from("gift_box_items").delete().eq("gift_box_id", giftBoxId);
  if (!data.isCustomizable && data.itemProductIds.length > 0) {
    const rows = data.itemProductIds.map((pid, i) => ({
      gift_box_id: giftBoxId,
      product_id: pid,
      sort_order: i,
    }));
    const { error } = await supabase.from("gift_box_items").insert(rows);
    if (error) {
      console.error("[saveGiftBox] items insert failed:", { giftBoxId, error });
      return { ok: false, error: `Items failed: ${error.message}` };
    }
  }

  revalidatePath("/en/products", "layout");
  revalidatePath("/fr/products", "layout");
  revalidatePath("/admin/gift-boxes");
  revalidatePath(`/admin/gift-boxes/${giftBoxId}`);
  // Box edits change what shows up in the public inquiry drawer (item
  // names + thumbnails are read through the cached catalogue map).
  // Without the tag bust those entries stay stale for the 10 min TTL.
  updateTag("products");

  // `redirect` throws NEXT_REDIRECT; the framework handles it and the
  // client never sees a "return" from this call. Keep CREATE on the
  // redirect path so the new draft lands on its detail URL with the
  // success pill; UPDATE returns the ok result so the client can show
  // an inline saved state without re-navigating.
  if (isCreate) redirect(`/admin/gift-boxes/${giftBoxId}?saved=1`);
  return { ok: true, id: giftBoxId, created: false };
}

export type GiftBoxActionResult =
  | { ok: true }
  | { ok: false; error: string };

export async function setGiftBoxStatus(
  id: string,
  status: "draft" | "published"
): Promise<GiftBoxActionResult> {
  const admin = await requireAdmin();
  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("gift_boxes")
    .update({
      status,
      published_at: status === "published" ? new Date().toISOString() : null,
      updated_by: admin.id,
    })
    .eq("id", id);
  if (error) {
    console.error("[setGiftBoxStatus] failed:", { id, status, error });
    return { ok: false, error: `Could not change status: ${error.message}` };
  }
  revalidatePath("/en/products", "layout");
  revalidatePath("/fr/products", "layout");
  revalidatePath(`/admin/gift-boxes/${id}`);
  revalidatePath("/admin/gift-boxes");
  updateTag("products");
  return { ok: true };
}

export async function deleteGiftBox(id: string): Promise<GiftBoxActionResult> {
  await requireAdmin();
  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("gift_boxes").delete().eq("id", id);
  if (error) {
    console.error("[deleteGiftBox] failed:", { id, error });
    return { ok: false, error: `Could not delete gift box: ${error.message}` };
  }
  revalidatePath("/en/products", "layout");
  revalidatePath("/fr/products", "layout");
  revalidatePath("/admin/gift-boxes");
  updateTag("products");
  // redirect throws NEXT_REDIRECT; this never actually returns. Kept
  // here so the client knows the action completed and the framework
  // navigates away from the now-deleted page.
  redirect("/admin/gift-boxes");
}
