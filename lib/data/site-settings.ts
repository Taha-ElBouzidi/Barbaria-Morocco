import { createServerClient } from "@/lib/supabase/server";
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
 * Designed to be called from every page that surfaces socials (Footer,
 * MenuDrawer, contact page sidebar). Each call is a single round-trip;
 * Next.js's data cache deduplicates within a request.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const supabase = await createServerClient();
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
}
