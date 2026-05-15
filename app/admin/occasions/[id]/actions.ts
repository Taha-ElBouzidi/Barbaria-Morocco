"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { OccasionSaveSchema, type OccasionSaveInput } from "@/lib/admin/occasions";
import { requireAdmin } from "@/lib/admin/auth";

function parseFormData(formData: FormData): OccasionSaveInput {
  const raw = {
    slug: String(formData.get("slug") ?? "").trim(),
    sortOrder: formData.get("sortOrder") ?? 0,
    translations: {
      en: { name: String(formData.get("name_en") ?? "").trim() },
      fr: { name: String(formData.get("name_fr") ?? "").trim() },
    },
  };
  return OccasionSaveSchema.parse(raw);
}

export async function saveOccasion(id: string | "new", formData: FormData) {
  const admin = await requireAdmin();
  const data = parseFormData(formData);
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
    if (error || !row) throw new Error(`occasion insert: ${error?.message}`);
    occasionId = row.id;
  } else {
    const { error } = await supabase.from("occasions").update(payload).eq("id", id);
    if (error) throw new Error(`occasion update: ${error.message}`);
    occasionId = id;
  }

  for (const locale of ["en", "fr"] as const) {
    const t = data.translations[locale];
    const { error } = await supabase.from("occasion_translations").upsert(
      { occasion_id: occasionId, locale, name: t.name },
      { onConflict: "occasion_id,locale" }
    );
    if (error) throw new Error(`occasion_translations ${locale}: ${error.message}`);
  }

  revalidatePath("/en/contact");
  revalidatePath("/fr/contact");
  revalidatePath("/admin/occasions");

  if (isCreate) redirect(`/admin/occasions/${occasionId}?saved=1`);
}

export async function setOccasionStatus(id: string, status: "draft" | "published") {
  await requireAdmin();
  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("occasions")
    .update({
      status,
      published_at: status === "published" ? new Date().toISOString() : null,
    })
    .eq("id", id);
  if (error) throw new Error(`occasion status: ${error.message}`);
  revalidatePath("/en/contact");
  revalidatePath("/fr/contact");
  revalidatePath(`/admin/occasions/${id}`);
  revalidatePath("/admin/occasions");
}

export async function deleteOccasion(id: string) {
  await requireAdmin();
  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("occasions").delete().eq("id", id);
  if (error) throw new Error(`occasion delete: ${error.message}`);
  revalidatePath("/en/contact");
  revalidatePath("/fr/contact");
  revalidatePath("/admin/occasions");
  redirect("/admin/occasions");
}
