import { createServiceRoleClient } from "@/lib/supabase/service";
import { z } from "zod";

export const SiteSettingsSaveSchema = z.object({
  instagramUrl: z.string().trim().url().or(z.literal("")).default(""),
  linkedinUrl: z.string().trim().url().or(z.literal("")).default(""),
  xUrl: z.string().trim().url().or(z.literal("")).default(""),
  whatsappUrl: z.string().trim().url().or(z.literal("")).default(""),
  contactEmail: z.string().trim().email().or(z.literal("")).default(""),
  contactPhone: z.string().trim().max(40).default(""),
});

export type SiteSettingsSaveInput = z.infer<typeof SiteSettingsSaveSchema>;

export interface SiteSettingsAdminRow {
  instagramUrl: string;
  linkedinUrl: string;
  xUrl: string;
  whatsappUrl: string;
  contactEmail: string;
  contactPhone: string;
  updatedAt: string | null;
}

export async function getSiteSettingsForAdmin(): Promise<SiteSettingsAdminRow> {
  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from("site_settings")
    .select("instagram_url, linkedin_url, x_url, whatsapp_url, contact_email, contact_phone, updated_at")
    .eq("id", true)
    .maybeSingle();
  return {
    instagramUrl: data?.instagram_url ?? "",
    linkedinUrl: data?.linkedin_url ?? "",
    xUrl: data?.x_url ?? "",
    whatsappUrl: data?.whatsapp_url ?? "",
    contactEmail: data?.contact_email ?? "",
    contactPhone: data?.contact_phone ?? "",
    updatedAt: data?.updated_at ?? null,
  };
}
