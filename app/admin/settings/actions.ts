"use server";

import { revalidatePath, updateTag } from "next/cache";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { SiteSettingsSaveSchema } from "@/lib/admin/site-settings";
import { requireAdmin } from "@/lib/admin/auth";

export type SaveSiteSettingsResult =
  | { ok: true }
  | { ok: false; error: string };

export async function saveSiteSettings(formData: FormData): Promise<SaveSiteSettingsResult> {
  const admin = await requireAdmin();
  const parsed = SiteSettingsSaveSchema.safeParse({
    instagramUrl: String(formData.get("instagramUrl") ?? "").trim(),
    linkedinUrl: String(formData.get("linkedinUrl") ?? "").trim(),
    xUrl: String(formData.get("xUrl") ?? "").trim(),
    whatsappUrl: String(formData.get("whatsappUrl") ?? "").trim(),
    contactEmail: String(formData.get("contactEmail") ?? "").trim(),
    contactPhone: String(formData.get("contactPhone") ?? "").trim(),
  });
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: `${first.path.join(".")}: ${first.message}` };
  }
  const data = parsed.data;
  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("site_settings").upsert(
    {
      id: true,
      instagram_url: data.instagramUrl || null,
      linkedin_url: data.linkedinUrl || null,
      x_url: data.xUrl || null,
      whatsapp_url: data.whatsappUrl || null,
      contact_email: data.contactEmail || null,
      contact_phone: data.contactPhone || null,
      updated_by: admin.id,
    },
    { onConflict: "id" }
  );
  if (error) {
    console.error("[saveSiteSettings] failed:", error);
    return { ok: false, error: `Could not save settings: ${error.message}` };
  }

  // Public pages that surface socials: revalidate both locales + bust the
  // cached getSiteSettings reader.
  revalidatePath("/en", "layout");
  revalidatePath("/fr", "layout");
  revalidatePath("/admin/settings");
  updateTag("site-settings");
  return { ok: true };
}
