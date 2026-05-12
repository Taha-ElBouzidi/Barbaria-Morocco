import { createServiceRoleClient } from "@/lib/supabase/service";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Zod schema — shared between create and update
// ---------------------------------------------------------------------------

export const ProductSaveSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  ritualId: z.enum(["hammam", "botanical", "heritage"]),
  subcategoryId: z.string().uuid().nullable().default(null),
  moq: z.coerce.number().int().min(1),
  formats: z.array(z.string()).default([]),
  lead: z.string().min(1),
  origin: z.string().nullable().default(null),
  ritualLabel: z.string().nullable().default(null),
  hero: z.boolean().default(false),
  translations: z.object({
    en: z.object({
      name: z.string().min(1),
      short: z.string().min(1),
      lede: z.string().nullable().default(null),
    }),
    fr: z.object({
      name: z.string().min(1),
      short: z.string().min(1),
      lede: z.string().nullable().default(null),
    }),
  }),
  facetIds: z.array(z.string().uuid()).default([]),
  applicationSteps: z
    .array(
      z.object({
        stepNumber: z.number().int().min(1).max(3),
        en: z.object({ title: z.string(), body: z.string() }),
        fr: z.object({ title: z.string(), body: z.string() }),
      })
    )
    .max(3)
    .default([]),
});

export type ProductSaveInput = z.infer<typeof ProductSaveSchema>;

// ---------------------------------------------------------------------------
// Admin list helper
// ---------------------------------------------------------------------------

export async function listProductsForAdmin(opts?: {
  search?: string;
  ritual?: string;
  status?: "draft" | "published";
}) {
  const supabase = createServiceRoleClient();
  let q = supabase.from("products").select(`
    id,
    slug,
    ritual_id,
    moq,
    status,
    updated_at,
    translations:product_translations ( locale, name ),
    images:product_images ( path, sort_order )
  `);

  if (opts?.ritual && opts.ritual !== "all") q = q.eq("ritual_id", opts.ritual);
  if (opts?.status && opts.status !== ("all" as string))
    q = q.eq("status", opts.status);
  if (opts?.search) {
    q = q.or(`slug.ilike.%${opts.search}%`);
  }

  const { data, error } = await q.order("updated_at", { ascending: false });
  if (error) throw new Error(`listProductsForAdmin: ${error.message}`);
  return data ?? [];
}

// ---------------------------------------------------------------------------
// Admin single-product helper (all locales + relations)
// ---------------------------------------------------------------------------

export async function getProductForEdit(id: string) {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      translations:product_translations ( * ),
      images:product_images ( id, path, alt_text, sort_order ),
      steps:product_application_steps ( * ),
      facets:product_facets ( facet_id )
    `)
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data;
}

// ---------------------------------------------------------------------------
// Facets + rituals for dropdowns
// ---------------------------------------------------------------------------

export async function getAllFacetsForAdmin() {
  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from("facets")
    .select("id, type, value_en, value_fr")
    .order("type")
    .order("sort_order");
  return data ?? [];
}

export async function getRitualOptions() {
  const supabase = createServiceRoleClient();
  const { data } = await supabase.from("rituals").select("id").order("sort_order");
  return data?.map((r: { id: string }) => r.id) ?? [];
}

export async function getSubcatOptions(ritualId: string) {
  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from("ritual_subcategories")
    .select(`id, slug, translations:ritual_subcategory_translations ( locale, name )`)
    .eq("ritual_id", ritualId)
    .order("sort_order");
  return data ?? [];
}

// ---------------------------------------------------------------------------
// Public storage URL helper
// ---------------------------------------------------------------------------

export function getPublicImageUrl(path: string): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return `${url}/storage/v1/object/public/product-images/${path}`;
}
