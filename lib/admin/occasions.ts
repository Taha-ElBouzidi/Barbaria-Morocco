import { createServiceRoleClient } from "@/lib/supabase/service";
import { z } from "zod";

export const OccasionSaveSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  sortOrder: z.coerce.number().int().min(0).default(0),
  translations: z.object({
    en: z.object({ name: z.string().min(1) }),
    fr: z.object({ name: z.string().min(1) }),
  }),
});

export type OccasionSaveInput = z.infer<typeof OccasionSaveSchema>;

export interface OccasionAdminRow {
  id: string;
  slug: string;
  status: "draft" | "published";
  sortOrder: number;
  nameEn: string;
  nameFr: string;
}

export async function listOccasionsForAdmin(): Promise<OccasionAdminRow[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("occasions")
    .select(`id, slug, status, sort_order, translations:occasion_translations ( locale, name )`)
    .order("sort_order");
  if (error || !data) return [];
  type Row = {
    id: string;
    slug: string;
    status: "draft" | "published";
    sort_order: number;
    translations: Array<{ locale: string; name: string }>;
  };
  return (data as unknown as Row[]).map((r) => {
    const en = r.translations.find((t) => t.locale === "en");
    const fr = r.translations.find((t) => t.locale === "fr");
    return {
      id: r.id,
      slug: r.slug,
      status: r.status,
      sortOrder: r.sort_order,
      nameEn: en?.name ?? r.slug,
      nameFr: fr?.name ?? r.slug,
    };
  });
}

export interface OccasionAdminDetail extends OccasionAdminRow {
  translations: { en: { name: string }; fr: { name: string } };
}

export async function getOccasionForAdmin(id: string): Promise<OccasionAdminDetail | null> {
  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from("occasions")
    .select(`id, slug, status, sort_order, translations:occasion_translations ( locale, name )`)
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  type Row = {
    id: string;
    slug: string;
    status: "draft" | "published";
    sort_order: number;
    translations: Array<{ locale: string; name: string }>;
  };
  const r = data as unknown as Row;
  const en = r.translations.find((t) => t.locale === "en") ?? { name: r.slug };
  const fr = r.translations.find((t) => t.locale === "fr") ?? { name: r.slug };
  return {
    id: r.id,
    slug: r.slug,
    status: r.status,
    sortOrder: r.sort_order,
    nameEn: en.name,
    nameFr: fr.name,
    translations: { en: { name: en.name }, fr: { name: fr.name } },
  };
}
