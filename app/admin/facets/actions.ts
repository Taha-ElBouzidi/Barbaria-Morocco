"use server";

import { revalidatePath, updateTag } from "next/cache";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { requireAdmin } from "@/lib/admin/auth";
import { FacetSaveSchema } from "@/lib/admin/facets";

// ---------------------------------------------------------------------------
// saveFacet, create or update a facet value
// ---------------------------------------------------------------------------

export async function saveFacet(
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();

  const raw = {
    id: (formData.get("id") as string) || undefined,
    type: formData.get("type"),
    valueEn: formData.get("valueEn"),
    valueFr: formData.get("valueFr"),
    sortOrder: formData.get("sortOrder"),
  };

  const parsed = FacetSaveSchema.safeParse(raw);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return { ok: false, error: `${firstIssue.path.join(".")}: ${firstIssue.message}` };
  }

  const data = parsed.data;
  const supabase = createServiceRoleClient();

  if (data.id) {
    // Update
    const { error } = await supabase
      .from("facets")
      .update({ value_en: data.valueEn, value_fr: data.valueFr, sort_order: data.sortOrder })
      .eq("id", data.id);

    if (error) return { ok: false, error: error.message };
  } else {
    // Insert
    const { error } = await supabase
      .from("facets")
      .insert({ type: data.type, value_en: data.valueEn, value_fr: data.valueFr, sort_order: data.sortOrder });

    if (error) return { ok: false, error: error.message };
  }

  // Revalidate ritual pages since they render filter chips
  revalidatePath("/en/rituals/hammam");
  revalidatePath("/fr/rituals/hammam");
  revalidatePath("/en/rituals/botanical");
  revalidatePath("/fr/rituals/botanical");
  revalidatePath("/en/rituals/heritage");
  revalidatePath("/fr/rituals/heritage");
  updateTag("facets");

  return { ok: true };
}

// ---------------------------------------------------------------------------
// deleteFacet, blocked if any products reference it
// ---------------------------------------------------------------------------

export async function deleteFacet(
  id: string
): Promise<{ ok: boolean; error?: string; productCount?: number }> {
  await requireAdmin();
  const supabase = createServiceRoleClient();

  const { count } = await supabase
    .from("product_facets")
    .select("facet_id", { count: "exact", head: true })
    .eq("facet_id", id);

  if ((count ?? 0) > 0) {
    return {
      ok: false,
      productCount: count ?? 0,
      error: `Cannot delete: ${count} product${count === 1 ? "" : "s"} use this facet value. Remove the tag from those products first.`,
    };
  }

  const { error } = await supabase.from("facets").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/en/rituals/hammam");
  revalidatePath("/fr/rituals/hammam");
  revalidatePath("/en/rituals/botanical");
  revalidatePath("/fr/rituals/botanical");
  revalidatePath("/en/rituals/heritage");
  revalidatePath("/fr/rituals/heritage");
  updateTag("facets");

  return { ok: true };
}

// ---------------------------------------------------------------------------
// reorderFacet, set sort_order
// ---------------------------------------------------------------------------

export async function reorderFacet(
  id: string,
  type: string,
  direction: "up" | "down",
  currentOrder: number
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const supabase = createServiceRoleClient();

  const newOrder = direction === "up" ? currentOrder - 1 : currentOrder + 1;
  if (newOrder < 0) return { ok: true };

  // Swap with neighbour in same type
  const { data: neighbour } = await supabase
    .from("facets")
    .select("id, sort_order")
    .eq("type", type)
    .eq("sort_order", newOrder)
    .maybeSingle();

  if (neighbour) {
    await supabase
      .from("facets")
      .update({ sort_order: currentOrder })
      .eq("id", neighbour.id);
  }

  await supabase.from("facets").update({ sort_order: newOrder }).eq("id", id);

  revalidatePath("/en/rituals/hammam");
  revalidatePath("/fr/rituals/hammam");
  revalidatePath("/en/rituals/botanical");
  revalidatePath("/fr/rituals/botanical");
  revalidatePath("/en/rituals/heritage");
  revalidatePath("/fr/rituals/heritage");
  updateTag("facets");

  return { ok: true };
}
