import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { BASE_URL } from "@/lib/constants";

const LOCALES = ["fr", "en"] as const;

/**
 * Static public routes (the locale prefix is added per-entry). Each
 * entry below gets a canonical FR + EN URL plus hreflang alternates.
 * Legacy short paths (e.g., /privacy) are 308-redirected by
 * next.config.ts, so we don't list them in the sitemap.
 */
const STATIC_ROUTES = [
  "",
  "/products/cosmetiques",
  "/products/epicerie_fine",
  "/story",
  "/ateliers",
  "/journal",
  "/contact",
  "/legal/legal-notice",
  "/legal/privacy",
  "/legal/terms",
  "/legal/cookies",
];

function url(locale: string, path: string): string {
  // Every URL carries its locale prefix so the sitemap matches the
  // canonical we emit in the page <link rel="canonical">. Crawl budget
  // shouldn't be spent on redirects from bare paths.
  return `${BASE_URL}/${locale}${path}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Sitemap runs without an HTTP request context; use a cookie-free anon client.
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
  const [{ data: products }, { data: boxes }] = await Promise.all([
    supabase.from("products").select("slug").eq("status", "published"),
    supabase
      .from("gift_boxes")
      .select("slug, categories(slug)")
      .eq("status", "published"),
  ]);
  const productSlugs = (products ?? []).map((p: { slug: string }) => p.slug);
  // gift-boxes nested category slug via the FK relationship
  const boxRows = ((boxes ?? []) as Array<{
    slug: string;
    categories: { slug: string } | { slug: string }[] | null;
  }>).map((b) => {
    const cat = Array.isArray(b.categories) ? b.categories[0] : b.categories;
    return cat?.slug ? { boxSlug: b.slug, categorySlug: cat.slug } : null;
  }).filter((b): b is { boxSlug: string; categorySlug: string } => !!b);

  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  // Each route gets one entry per locale, both carrying hreflang
  // alternates pointing at every locale variant of the same route.
  const allPaths = [
    ...STATIC_ROUTES,
    ...productSlugs.map((slug) => `/product/${slug}`),
    ...boxRows.map(({ categorySlug, boxSlug }) => `/products/${categorySlug}/${boxSlug}`),
  ];
  for (const path of allPaths) {
    const languages = Object.fromEntries(
      LOCALES.map((loc) => [loc, url(loc, path)])
    );
    for (const locale of LOCALES) {
      entries.push({
        url: url(locale, path),
        lastModified: now,
        changeFrequency: "monthly",
        priority: path === "" ? 1 : path.startsWith("/legal/") ? 0.3 : 0.7,
        alternates: { languages },
      });
    }
  }
  return entries;
}
