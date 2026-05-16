import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import {
  INSTAGRAM_URL,
  LINKEDIN_URL,
  X_URL,
  WHATSAPP_NUMBER,
  CONTACT_EMAIL,
  CONTACT_PHONE,
} from "@/lib/constants";

export interface SiteSettings {
  instagramUrl: string;
  linkedinUrl: string;
  xUrl: string;
  whatsappUrl: string;
  contactEmail: string;
  contactPhone: string;
}

const FALLBACK: SiteSettings = {
  instagramUrl: INSTAGRAM_URL,
  linkedinUrl: LINKEDIN_URL,
  xUrl: X_URL,
  whatsappUrl: `https://wa.me/${WHATSAPP_NUMBER}`,
  contactEmail: CONTACT_EMAIL,
  contactPhone: CONTACT_PHONE,
};

/**
 * Read the live socials + contact info from site_settings. Falls back to
 * the placeholder constants if the DB row is missing (first deploy, or
 * the table hasn't been seeded yet).
 *
 * Cached via `unstable_cache` because every public page (Footer + drawer)
 * reads this. Tag "site-settings"; the /admin/settings save action calls
 * `revalidateTag("site-settings")` on update.
 */
export const getSiteSettings = unstable_cache(
  async (): Promise<SiteSettings> => {
    try {
      const supabase = createPublicClient();
      const { data } = await supabase
        .from("site_settings")
        .select("instagram_url, linkedin_url, x_url, whatsapp_url, contact_email, contact_phone")
        .eq("id", true)
        .maybeSingle();
      if (!data) return FALLBACK;
      return {
        instagramUrl: data.instagram_url ?? FALLBACK.instagramUrl,
        linkedinUrl: data.linkedin_url ?? FALLBACK.linkedinUrl,
        xUrl: data.x_url ?? FALLBACK.xUrl,
        whatsappUrl: data.whatsapp_url ?? FALLBACK.whatsappUrl,
        contactEmail: data.contact_email ?? FALLBACK.contactEmail,
        contactPhone: data.contact_phone ?? FALLBACK.contactPhone,
      };
    } catch {
      return FALLBACK;
    }
  },
  ["site-settings"],
  { tags: ["site-settings"], revalidate: 600 }
);
