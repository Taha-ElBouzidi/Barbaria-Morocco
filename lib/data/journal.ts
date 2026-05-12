/**
 * SLICE 12 NOTE: Returns locale-resolved flat shapes.
 * `kicker` and `headline` are plain strings for the requested locale, NOT
 * the nested `{ en, fr }` objects from lib/editorial.ts.
 */

import { createServerClient } from "@/lib/supabase/server";
import type { LocaleCode, JournalEntry } from "./types";

export async function getAllJournalCards(locale: LocaleCode): Promise<JournalEntry[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("journal_cards")
    .select(`
      slug,
      date,
      image_path,
      feature,
      translations:journal_card_translations!inner ( locale, kicker, headline )
    `)
    .eq("status", "published")
    .eq("translations.locale", locale)
    .order("date", { ascending: false });

  if (error || !data) return [];
  return data.map((row: any) => ({
    slug: row.slug,
    date: row.date,
    image: row.image_path,
    feature: !!row.feature,
    kicker: row.translations[0]?.kicker ?? "",
    headline: row.translations[0]?.headline ?? row.slug,
  }));
}
