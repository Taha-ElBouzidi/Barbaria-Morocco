"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { requireAdmin } from "@/lib/admin/auth";
import { AtelierSaveSchema } from "@/lib/admin/ateliers";

// ---------------------------------------------------------------------------
// saveAtelier — upsert atelier + translations
// ---------------------------------------------------------------------------

export async function saveAtelier(
  id: string | "new",
  formData: FormData
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  await requireAdmin();

  const raw = {
    slug: formData.get("slug"),
    name: formData.get("name"),
    region: formData.get("region"),
    sinceYear: formData.get("sinceYear"),
    sortOrder: formData.get("sortOrder"),
    imagePath: (formData.get("imagePath") as string) || null,
    translations: {
      en: { description: formData.get("en_description") },
      fr: { description: formData.get("fr_description") },
    },
  };

  const parsed = AtelierSaveSchema.safeParse(raw);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return { ok: false, error: `${firstIssue.path.join(".")}: ${firstIssue.message}` };
  }

  const data = parsed.data;
  const supabase = createServiceRoleClient();
  const isNew = id === "new";

  const atelierPayload = {
    slug: data.slug,
    name: data.name,
    region: data.region,
    since_year: data.sinceYear,
    sort_order: data.sortOrder,
    image_path: data.imagePath,
  };

  let atelierId: string;

  if (isNew) {
    const { data: inserted, error } = await supabase
      .from("ateliers")
      .insert(atelierPayload)
      .select("id")
      .single();
    if (error || !inserted) {
      return { ok: false, error: `Failed to create atelier: ${error?.message ?? "unknown"}` };
    }
    atelierId = inserted.id;
  } else {
    const { error } = await supabase.from("ateliers").update(atelierPayload).eq("id", id);
    if (error) {
      return { ok: false, error: `Failed to update atelier: ${error.message}` };
    }
    atelierId = id;
  }

  // Upsert translations
  const translationRows = [
    { atelier_id: atelierId, locale: "en", description: data.translations.en.description },
    { atelier_id: atelierId, locale: "fr", description: data.translations.fr.description },
  ];

  const { error: translationError } = await supabase
    .from("atelier_translations")
    .upsert(translationRows, { onConflict: "atelier_id,locale" });

  if (translationError) {
    return { ok: false, error: `Failed to save translations: ${translationError.message}` };
  }

  revalidatePath("/en/ateliers");
  revalidatePath("/fr/ateliers");

  return { ok: true, id: atelierId };
}

// ---------------------------------------------------------------------------
// deleteAtelier
// ---------------------------------------------------------------------------

export async function deleteAtelier(id: string): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const supabase = createServiceRoleClient();

  const { error } = await supabase.from("ateliers").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/en/ateliers");
  revalidatePath("/fr/ateliers");

  return { ok: true };
}

// ---------------------------------------------------------------------------
// redirectToAtelierEdit
// ---------------------------------------------------------------------------

export async function redirectToAtelierEdit(id: string) {
  redirect(`/admin/ateliers/${id}?saved=1`);
}
