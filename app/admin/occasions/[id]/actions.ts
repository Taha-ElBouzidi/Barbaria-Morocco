"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { OccasionSaveSchema } from "@/lib/admin/occasions";
import { requireAdmin } from "@/lib/admin/auth";

export type SaveOccasionResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export type OccasionActionResult =
  | { ok: true }
  | { ok: false; error: string };

export async function saveOccasion(
  id: string | "new",
  formData: FormData
): Promise<SaveOccasionResult> {
  const admin = await requireAdmin();

  const parsed = OccasionSaveSchema.safeParse({
    slug: String(formData.get("slug") ?? "").trim(),
    sortOrder: formData.get("sortOrder") ?? 0,
    translations: {
      en: { name: String(formData.get("name_en") ?? "").trim() },
      fr: { name: String(formData.get("name_fr") ?? "").trim() },
    },
  });
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: `${first.path.join(".")}: ${first.message}` };
  }
  const data = parsed.data;

  const supabase = createServiceRoleClient();
  const isCreate = id === "new";
  const payload = {
    slug: data.slug,
    sort_order: data.sortOrder,
    updated_by: admin.id,
  };

  let occasionId: string;
  if (isCreate) {
    const { data: row, error } = await supabase
      .from("occasions")
      .insert({
        ...payload,
        created_by: admin.id,
        status: "published",
        published_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (error || !row) {
      console.error("[saveOccasion] insert failed:", error);
      return { ok: false, error: `Could not create occasion: ${error?.message ?? "unknown"}` };
    }
    occasionId = row.id;
  } else {
    const { error } = await supabase.from("occasions").update(payload).eq("id", id);
    if (error) {
      console.error("[saveOccasion] update failed:", { id, error });
      return { ok: false, error: `Could not update occasion: ${error.message}` };
    }
    occasionId = id;
  }

  for (const locale of ["en", "fr"] as const) {
    const t = data.translations[locale];
    const { error } = await supabase.from("occasion_translations").upsert(
      { occasion_id: occasionId, locale, name: t.name },
      { onConflict: "occasion_id,locale" }
    );
    if (error) {
      console.error("[saveOccasion] translations failed:", { locale, error });
      return { ok: false, error: `Translations (${locale}) failed: ${error.message}` };
    }
  }

  revalidatePath("/en/contact");
  revalidatePath("/fr/contact");
  revalidatePath("/admin/occasions");
  revalidatePath(`/admin/occasions/${occasionId}`);

  if (isCreate) redirect(`/admin/occasions/${occasionId}?saved=1`);
  return { ok: true, id: occasionId };
}

export async function setOccasionStatus(
  id: string,
  status: "draft" | "published"
): Promise<OccasionActionResult> {
  await requireAdmin();
  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("occasions")
    .update({
      status,
      published_at: status === "published" ? new Date().toISOString() : null,
    })
    .eq("id", id);
  if (error) {
    console.error("[setOccasionStatus] failed:", { id, status, error });
    return { ok: false, error: `Could not change status: ${error.message}` };
  }
  revalidatePath("/en/contact");
  revalidatePath("/fr/contact");
  revalidatePath(`/admin/occasions/${id}`);
  revalidatePath("/admin/occasions");
  return { ok: true };
}

export async function deleteOccasion(id: string): Promise<OccasionActionResult> {
  await requireAdmin();
  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("occasions").delete().eq("id", id);
  if (error) {
    console.error("[deleteOccasion] failed:", { id, error });
    return { ok: false, error: `Could not delete occasion: ${error.message}` };
  }
  revalidatePath("/en/contact");
  revalidatePath("/fr/contact");
  revalidatePath("/admin/occasions");
  redirect("/admin/occasions");
}
