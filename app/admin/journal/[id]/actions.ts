"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { requireAdmin } from "@/lib/admin/auth";
import { JournalSaveSchema } from "@/lib/admin/journal";

// ---------------------------------------------------------------------------
// saveJournalCard, upsert card + translations
// ---------------------------------------------------------------------------

export async function saveJournalCard(
  id: string | "new",
  formData: FormData
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  await requireAdmin();

  const raw = {
    slug: formData.get("slug"),
    date: formData.get("date"),
    imagePath: (formData.get("imagePath") as string) || null,
    feature: formData.get("feature") === "true",
    translations: {
      en: {
        kicker: formData.get("en_kicker"),
        headline: formData.get("en_headline"),
      },
      fr: {
        kicker: formData.get("fr_kicker"),
        headline: formData.get("fr_headline"),
      },
    },
  };

  const parsed = JournalSaveSchema.safeParse(raw);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return { ok: false, error: `${firstIssue.path.join(".")}: ${firstIssue.message}` };
  }

  const data = parsed.data;
  const supabase = createServiceRoleClient();
  const isNew = id === "new";

  const cardPayload = {
    slug: data.slug,
    date: data.date,
    image_path: data.imagePath,
    feature: data.feature,
  };

  let cardId: string;

  if (isNew) {
    const { data: inserted, error } = await supabase
      .from("journal_cards")
      .insert({ ...cardPayload, status: "draft" })
      .select("id")
      .single();
    if (error || !inserted) {
      return { ok: false, error: `Failed to create card: ${error?.message ?? "unknown"}` };
    }
    cardId = inserted.id;
  } else {
    const { error } = await supabase.from("journal_cards").update(cardPayload).eq("id", id);
    if (error) {
      return { ok: false, error: `Failed to update card: ${error.message}` };
    }
    cardId = id;
  }

  // Upsert translations
  const translationRows = [
    { card_id: cardId, locale: "en", kicker: data.translations.en.kicker, headline: data.translations.en.headline },
    { card_id: cardId, locale: "fr", kicker: data.translations.fr.kicker, headline: data.translations.fr.headline },
  ];

  const { error: translationError } = await supabase
    .from("journal_card_translations")
    .upsert(translationRows, { onConflict: "card_id,locale" });

  if (translationError) {
    return { ok: false, error: `Failed to save translations: ${translationError.message}` };
  }

  revalidatePath("/en/journal");
  revalidatePath("/fr/journal");

  return { ok: true, id: cardId };
}

// ---------------------------------------------------------------------------
// setJournalStatus, publish / unpublish
// ---------------------------------------------------------------------------

export async function setJournalStatus(
  id: string,
  status: "draft" | "published"
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const supabase = createServiceRoleClient();

  const { error } = await supabase
    .from("journal_cards")
    .update({ status })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/en/journal");
  revalidatePath("/fr/journal");

  return { ok: true };
}

// ---------------------------------------------------------------------------
// deleteJournalCard
// ---------------------------------------------------------------------------

export async function deleteJournalCard(id: string): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const supabase = createServiceRoleClient();

  const { error } = await supabase.from("journal_cards").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/en/journal");
  revalidatePath("/fr/journal");

  return { ok: true };
}

// ---------------------------------------------------------------------------
// redirectToJournalEdit
// ---------------------------------------------------------------------------

export async function redirectToJournalEdit(id: string) {
  redirect(`/admin/journal/${id}?saved=1`);
}
