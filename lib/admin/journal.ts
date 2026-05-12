import { createServiceRoleClient } from "@/lib/supabase/service";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Zod schema
// ---------------------------------------------------------------------------

export const JournalSaveSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  date: z.string().min(1),
  imagePath: z.string().nullable().default(null),
  feature: z.boolean().default(false),
  translations: z.object({
    en: z.object({ kicker: z.string().min(1), headline: z.string().min(1) }),
    fr: z.object({ kicker: z.string().min(1), headline: z.string().min(1) }),
  }),
});

export type JournalSaveInput = z.infer<typeof JournalSaveSchema>;

// ---------------------------------------------------------------------------
// Admin list helper
// ---------------------------------------------------------------------------

export async function listJournalCardsForAdmin(opts?: {
  search?: string;
  status?: "draft" | "published";
}) {
  const supabase = createServiceRoleClient();
  let q = supabase.from("journal_cards").select(`
    id,
    slug,
    date,
    image_path,
    feature,
    status,
    updated_at,
    translations:journal_card_translations ( locale, kicker, headline )
  `);

  if (opts?.status && opts.status !== ("all" as string)) {
    q = q.eq("status", opts.status);
  }

  const { data, error } = await q.order("date", { ascending: false });
  if (error) throw new Error(`listJournalCardsForAdmin: ${error.message}`);
  return data ?? [];
}

// ---------------------------------------------------------------------------
// Admin single-card helper
// ---------------------------------------------------------------------------

export async function getJournalCardForEdit(id: string) {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("journal_cards")
    .select(`*, translations:journal_card_translations ( * )`)
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data;
}
