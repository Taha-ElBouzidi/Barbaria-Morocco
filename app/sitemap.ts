import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { BASE_URL } from "@/lib/constants";

const LOCALES = ["fr", "en"] as const;

/**
 * Static public routes (the locale prefix is added per-entry). Each
 * entry below gets a canonical FR + EN URL plus hreflang alternates
 * including x-default. Legacy short paths (e.g., /privacy) are
 * 308-redirected by next.config.ts, so we don't list them.
 */
const STATIC_ROUTES = [
  "",
  "/products/cosmetiques",
  "/products/epicerie_fine",
  "/story",
  "/ateliers",
  "/journal",
  "/faq",
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

function absoluteImageUrl(path: string | null): string | undefined {
  if (!path) return undefined;
  if (path.startsWith("http")) return path;
  return path.startsWith("/") ? `${BASE_URL}${path}` : `${BASE_URL}/${path}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Sitemap runs without an HTTP request context; use a cookie-free anon client.
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  // Pull hero images so we can emit <image:image> entries alongside
  // each product and gift box URL. Google Image Search relies on
  // sitemap image annotations to discover product imagery without
  // having to fetch + parse every product page.
  const [{ data: products }, { data: boxes }] = await Promise.all([
    supabase
      .from("products")
      .select("slug, product_images(path, sort_order)")
      .eq("status", "published"),
    supabase
      .from("gift_boxes")
      .select("slug, hero_image_path, categories(slug)")
      .eq("status", "published"),
  ]);

  type ProductRow = { slug: string; product_images: Array<{ path: string; sort_order: number }> | null };
  type BoxRow = {
    slug: string;
    hero_image_path: string | null;
    categories: { slug: string } | { slug: string }[] | null;
  };

  const productRows = ((products ?? []) as ProductRow[]).map((p) => {
    const firstImage = (p.product_images ?? [])
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)[0]?.path ?? null;
    return { slug: p.slug, heroImage: firstImage };
  });

  const boxRows = ((boxes ?? []) as BoxRow[])
    .map((b) => {
      const cat = Array.isArray(b.categories) ? b.categories[0] : b.categories;
      if (!cat?.slug) return null;
      return {
        boxSlug: b.slug,
        categorySlug: cat.slug,
        heroImage: b.hero_image_path ?? null,
      };
    })
    .filter((b): b is { boxSlug: string; categorySlug: string; heroImage: string | null } => !!b);

  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  // Each route gets one entry per locale. Hreflang alternates include
  // both locales and x-default (Google requires x-default for any site
  // that supports multiple languages; pointing it at FR matches the
  // brand's primary audience: Morocco + France).
  type SitemapEntry = {
    path: string;
    images?: string[];
  };

  const allEntries: SitemapEntry[] = [
    ...STATIC_ROUTES.map((path) => ({ path })),
    ...productRows.map(({ slug, heroImage }) => ({
      path: `/product/${slug}`,
      images: heroImage ? [absoluteImageUrl(heroImage)!] : undefined,
    })),
    ...boxRows.map(({ categorySlug, boxSlug, heroImage }) => ({
      path: `/products/${categorySlug}/${boxSlug}`,
      images: heroImage ? [absoluteImageUrl(heroImage)!] : undefined,
    })),
  ];

  for (const { path, images } of allEntries) {
    const languages: Record<string, string> = {
      "x-default": url("fr", path),
    };
    for (const loc of LOCALES) languages[loc] = url(loc, path);

    for (const locale of LOCALES) {
      entries.push({
        url: url(locale, path),
        lastModified: now,
        changeFrequency: "monthly",
        priority: path === "" ? 1 : path.startsWith("/legal/") ? 0.3 : 0.7,
        alternates: { languages },
        ...(images ? { images } : {}),
      });
    }
  }
  return entries;
}
