import { createServiceRoleClient } from "@/lib/supabase/service";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------

export const RitualSaveSchema = z.object({
  sortOrder: z.coerce.number().int().default(0),
  heroImagePath: z.string().nullable().default(null),
  translations: z.object({
    en: z.object({
      eyebrow: z.string().min(1),
      name: z.string().min(1),
      tagline: z.string().min(1),
      lede: z.string().min(1),
    }),
    fr: z.object({
      eyebrow: z.string().min(1),
      name: z.string().min(1),
      tagline: z.string().min(1),
      lede: z.string().min(1),
    }),
  }),
});

export type RitualSaveInput = z.infer<typeof RitualSaveSchema>;

export const SubcatSaveSchema = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  nameEn: z.string().min(1),
  nameFr: z.string().min(1),
  sortOrder: z.coerce.number().int().default(0),
});

export type SubcatSaveInput = z.infer<typeof SubcatSaveSchema>;

// ---------------------------------------------------------------------------
// Admin list helper (all 3 rituals with translations)
// ---------------------------------------------------------------------------

export async function listRitualsForAdmin() {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("rituals")
    .select(`
      id,
      sort_order,
      hero_image_path,
      updated_at,
      translations:ritual_translations ( locale, eyebrow, name, tagline, lede )
    `)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(`listRitualsForAdmin: ${error.message}`);
  return data ?? [];
}

// ---------------------------------------------------------------------------
// Single ritual with subcategories + product counts
// ---------------------------------------------------------------------------

export async function getRitualForEdit(id: string) {
  const supabase = createServiceRoleClient();

  const { data: ritual, error } = await supabase
    .from("rituals")
    .select(`
      *,
      translations:ritual_translations ( * )
    `)
    .eq("id", id)
    .single();

  if (error || !ritual) return null;

  const { data: subcats } = await supabase
    .from("ritual_subcategories")
    .select(`
      id,
      slug,
      sort_order,
      translations:ritual_subcategory_translations ( locale, name )
    `)
    .eq("ritual_id", id)
    .order("sort_order", { ascending: true });

  // Get product count per subcat to show deletion protection info
  const subcatsWithCount = await Promise.all(
    (subcats ?? []).map(async (sc) => {
      const { count } = await supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("subcategory_id", sc.id);
      return { ...sc, productCount: count ?? 0 };
    })
  );

  return { ...ritual, subcategories: subcatsWithCount };
}
