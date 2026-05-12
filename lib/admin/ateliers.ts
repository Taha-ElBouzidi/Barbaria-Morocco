import { createServiceRoleClient } from "@/lib/supabase/service";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Zod schema
// ---------------------------------------------------------------------------

export const AtelierSaveSchema = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  name: z.string().min(1),
  region: z.string().min(1),
  sinceYear: z.coerce.number().int().min(1900).max(2100),
  sortOrder: z.coerce.number().int().default(0),
  imagePath: z.string().nullable().default(null),
  translations: z.object({
    en: z.object({ description: z.string().min(1) }),
    fr: z.object({ description: z.string().min(1) }),
  }),
});

export type AtelierSaveInput = z.infer<typeof AtelierSaveSchema>;

// ---------------------------------------------------------------------------
// Admin list helper
// ---------------------------------------------------------------------------

export async function listAteliersForAdmin() {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("ateliers")
    .select(`
      id,
      slug,
      name,
      region,
      since_year,
      image_path,
      sort_order,
      updated_at,
      translations:atelier_translations ( locale, description )
    `)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(`listAteliersForAdmin: ${error.message}`);
  return data ?? [];
}

// ---------------------------------------------------------------------------
// Admin single-atelier helper
// ---------------------------------------------------------------------------

export async function getAtelierForEdit(id: string) {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("ateliers")
    .select(`*, translations:atelier_translations ( * )`)
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data;
}
