import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { BASE_URL } from "@/lib/constants";

const LOCALES = ["fr", "en"] as const;
const STATIC_ROUTES = [
  "",
  "/products/cosmetiques",
  "/products/epicerie_fine",
  "/story",
  "/ateliers",
  "/journal",
  "/contact",
];

function url(locale: string, path: string): string {
  // FR is the default locale: bare path, no prefix. EN gets /en prefix.
  if (locale === "fr") {
    return path === "" ? BASE_URL : `${BASE_URL}${path}`;
  }
  return `${BASE_URL}/${locale}${path}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Sitemap runs without an HTTP request context; use a cookie-free anon client.
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
  const { data } = await supabase
    .from("products")
    .select("slug")
    .eq("status", "published");
  const slugs = (data ?? []).map((p: { slug: string }) => p.slug);

  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];
  for (const locale of LOCALES) {
    for (const r of STATIC_ROUTES) {
      entries.push({
        url: url(locale, r),
        lastModified: now,
        changeFrequency: "monthly",
        priority: r === "" ? 1 : 0.7,
      });
    }
    for (const slug of slugs) {
      entries.push({
        url: url(locale, `/product/${slug}`),
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }
  return entries;
}
