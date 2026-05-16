"use server";

import { revalidatePath, updateTag } from "next/cache";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { SiteSettingsSaveSchema } from "@/lib/admin/site-settings";
import { requireAdmin } from "@/lib/admin/auth";

export async function saveSiteSettings(formData: FormData) {
  const admin = await requireAdmin();
  const data = SiteSettingsSaveSchema.parse({
    instagramUrl: String(formData.get("instagramUrl") ?? "").trim(),
    linkedinUrl: String(formData.get("linkedinUrl") ?? "").trim(),
    xUrl: String(formData.get("xUrl") ?? "").trim(),
    whatsappUrl: String(formData.get("whatsappUrl") ?? "").trim(),
    contactEmail: String(formData.get("contactEmail") ?? "").trim(),
    contactPhone: String(formData.get("contactPhone") ?? "").trim(),
  });
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
  if (error) throw new Error(`site_settings save: ${error.message}`);

  // Public pages that surface socials: revalidate both locales + bust the
  // cached getSiteSettings reader.
  revalidatePath("/en", "layout");
  revalidatePath("/fr", "layout");
  revalidatePath("/admin/settings");
  updateTag("site-settings");
}
