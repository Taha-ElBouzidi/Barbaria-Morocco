import { createServerClient } from "@/lib/supabase/server";

export interface OccasionOption {
  slug: string;
  name: string;
}

type LocaleCode = "en" | "fr";

/** Sprint 2.7 — Published occasions for the contact form dropdown. */
export async function getOccasions(locale: LocaleCode): Promise<OccasionOption[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("occasions")
    .select(`slug, sort_order, translations:occasion_translations!inner ( locale, name )`)
    .eq("status", "published")
    .eq("translations.locale", locale)
    .order("sort_order");
  if (error || !data) return [];
  type Row = {
    slug: string;
    sort_order: number;
    translations: Array<{ locale: string; name: string }>;
  };
  return (data as unknown as Row[]).map((r) => ({
    slug: r.slug,
    name: r.translations[0]?.name ?? r.slug,
  }));
}
