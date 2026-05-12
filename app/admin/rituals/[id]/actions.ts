"use server";

import { revalidatePath } from "next/cache";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { requireAdmin } from "@/lib/admin/auth";
import { RitualSaveSchema, SubcatSaveSchema } from "@/lib/admin/rituals";

// ---------------------------------------------------------------------------
// saveRitual — update translations + hero + sort_order (cannot create/delete)
// ---------------------------------------------------------------------------

export async function saveRitual(
  id: string,
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();

  const raw = {
    sortOrder: formData.get("sortOrder"),
    heroImagePath: (formData.get("heroImagePath") as string) || null,
    translations: {
      en: {
        eyebrow: formData.get("en_eyebrow"),
        name: formData.get("en_name"),
        tagline: formData.get("en_tagline"),
        lede: formData.get("en_lede"),
      },
      fr: {
        eyebrow: formData.get("fr_eyebrow"),
        name: formData.get("fr_name"),
        tagline: formData.get("fr_tagline"),
        lede: formData.get("fr_lede"),
      },
    },
  };

  const parsed = RitualSaveSchema.safeParse(raw);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return { ok: false, error: `${firstIssue.path.join(".")}: ${firstIssue.message}` };
  }

  const data = parsed.data;
  const supabase = createServiceRoleClient();

  const { error: ritualError } = await supabase
    .from("rituals")
    .update({ sort_order: data.sortOrder, hero_image_path: data.heroImagePath })
    .eq("id", id);

  if (ritualError) return { ok: false, error: `Failed to update ritual: ${ritualError.message}` };

  // Upsert translations
  const translationRows = [
    { ritual_id: id, locale: "en", ...data.translations.en },
    { ritual_id: id, locale: "fr", ...data.translations.fr },
  ];

  const { error: translationError } = await supabase
    .from("ritual_translations")
    .upsert(translationRows, { onConflict: "ritual_id,locale" });

  if (translationError) {
    return { ok: false, error: `Failed to save translations: ${translationError.message}` };
  }

  revalidatePath("/en");
  revalidatePath("/fr");
  revalidatePath(`/en/rituals/${id}`);
  revalidatePath(`/fr/rituals/${id}`);

  return { ok: true };
}

// ---------------------------------------------------------------------------
// addSubcat — create a new sub-category under a ritual
// ---------------------------------------------------------------------------

export async function addSubcat(
  ritualId: string,
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();

  const raw = {
    slug: formData.get("slug"),
    nameEn: formData.get("nameEn"),
    nameFr: formData.get("nameFr"),
    sortOrder: formData.get("sortOrder"),
  };

  const parsed = SubcatSaveSchema.safeParse(raw);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return { ok: false, error: `${firstIssue.path.join(".")}: ${firstIssue.message}` };
  }

  const data = parsed.data;
  const supabase = createServiceRoleClient();

  const { data: inserted, error } = await supabase
    .from("ritual_subcategories")
    .insert({ ritual_id: ritualId, slug: data.slug, sort_order: data.sortOrder })
    .select("id")
    .single();

  if (error || !inserted) {
    return { ok: false, error: `Failed to create sub-category: ${error?.message ?? "unknown"}` };
  }

  const { error: translError } = await supabase
    .from("ritual_subcategory_translations")
    .insert([
      { subcategory_id: inserted.id, locale: "en", name: data.nameEn },
      { subcategory_id: inserted.id, locale: "fr", name: data.nameFr },
    ]);

  if (translError) {
    return { ok: false, error: `Failed to save sub-category translations: ${translError.message}` };
  }

  revalidatePath(`/en/rituals/${ritualId}`);
  revalidatePath(`/fr/rituals/${ritualId}`);

  return { ok: true };
}

// ---------------------------------------------------------------------------
// renameSubcat — update translations for an existing sub-category
// ---------------------------------------------------------------------------

export async function renameSubcat(
  subcatId: string,
  ritualId: string,
  nameEn: string,
  nameFr: string
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();

  if (!nameEn.trim() || !nameFr.trim()) {
    return { ok: false, error: "Both EN and FR names are required" };
  }

  const supabase = createServiceRoleClient();

  const { error } = await supabase
    .from("ritual_subcategory_translations")
    .upsert(
      [
        { subcategory_id: subcatId, locale: "en", name: nameEn.trim() },
        { subcategory_id: subcatId, locale: "fr", name: nameFr.trim() },
      ],
      { onConflict: "subcategory_id,locale" }
    );

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/en/rituals/${ritualId}`);
  revalidatePath(`/fr/rituals/${ritualId}`);

  return { ok: true };
}

// ---------------------------------------------------------------------------
// reorderSubcat — set sort_order on a subcat
// ---------------------------------------------------------------------------

export async function reorderSubcat(
  subcatId: string,
  ritualId: string,
  direction: "up" | "down",
  currentOrder: number
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const supabase = createServiceRoleClient();

  const newOrder = direction === "up" ? currentOrder - 1 : currentOrder + 1;
  if (newOrder < 0) return { ok: true };

  // Swap with the neighbour
  const { data: neighbour } = await supabase
    .from("ritual_subcategories")
    .select("id, sort_order")
    .eq("ritual_id", ritualId)
    .eq("sort_order", newOrder)
    .maybeSingle();

  if (neighbour) {
    await supabase
      .from("ritual_subcategories")
      .update({ sort_order: currentOrder })
      .eq("id", neighbour.id);
  }

  await supabase
    .from("ritual_subcategories")
    .update({ sort_order: newOrder })
    .eq("id", subcatId);

  revalidatePath(`/en/rituals/${ritualId}`);
  revalidatePath(`/fr/rituals/${ritualId}`);

  return { ok: true };
}

// ---------------------------------------------------------------------------
// deleteSubcat — blocked if any products reference it
// ---------------------------------------------------------------------------

export async function deleteSubcat(
  subcatId: string,
  ritualId: string
): Promise<{ ok: boolean; error?: string; productCount?: number }> {
  await requireAdmin();
  const supabase = createServiceRoleClient();

  const { count } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("subcategory_id", subcatId);

  if ((count ?? 0) > 0) {
    return {
      ok: false,
      productCount: count ?? 0,
      error: `Cannot delete: ${count} product${count === 1 ? "" : "s"} reference this sub-category. Re-assign them first.`,
    };
  }

  const { error } = await supabase
    .from("ritual_subcategories")
    .delete()
    .eq("id", subcatId);

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/en/rituals/${ritualId}`);
  revalidatePath(`/fr/rituals/${ritualId}`);

  return { ok: true };
}
