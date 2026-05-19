import { createServiceRoleClient } from "@/lib/supabase/service";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Zod schema, shared between create and update
// ---------------------------------------------------------------------------

export const ProductSaveSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  // Public storefront classifies on category only (sprint 6 retired
  // the rituals taxonomy). Required now, every product belongs to
  // one of the two categories.
  categoryId: z.string().uuid(),
  moq: z.coerce.number().int().min(1),
  formats: z.array(z.string()).default([]),
  lead: z.string().min(1),
  origin: z.string().nullable().default(null),
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
  categoryId?: string;
  status?: "draft" | "published";
}) {
  const supabase = createServiceRoleClient();
  let q = supabase.from("products").select(`
    id,
    slug,
    category_id,
    moq,
    status,
    updated_at,
    translations:product_translations ( locale, name ),
    images:product_images ( path, sort_order ),
    category:categories ( slug )
  `);

  if (opts?.categoryId && opts.categoryId !== "all") q = q.eq("category_id", opts.categoryId);
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
// Facets + categories for dropdowns
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

// Category options live in lib/admin/gift-boxes.ts (single source of
// truth across the two admin editors that need them). Import from
// there.

// ---------------------------------------------------------------------------
// Public storage URL helper
// ---------------------------------------------------------------------------

/**
 * Resolve an image path stored in the DB to a renderable URL.
 *
 * Path values come from two sources:
 * - Sprint 1.5 seed populated rows with `/brand_photos/...` paths that
 *   point at files shipped in the Next.js `/public` folder.
 * - The admin uploader writes to Supabase Storage and stores the
 *   storage object path (no leading slash).
 *
 * A leading `/` is the discriminator: treat those as local public
 * paths and return as-is. Anything else gets prefixed with the
 * Supabase Storage public URL. Without this check, seeded rows
 * resolve to `/storage/v1/object/public/product-images//brand_photos/...`
 * which 404s, the house reported broken thumbnails on the admin
 * product list before this fix.
 */
export function getPublicImageUrl(path: string): string {
  if (path.startsWith("/")) return path;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return `${url}/storage/v1/object/public/product-images/${path}`;
}
