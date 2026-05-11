import type { MetadataRoute } from "next";
import { PRODUCTS } from "@/lib/products";
import { BASE_URL } from "@/lib/constants";

const LOCALES = ["fr", "en"] as const;
const STATIC_ROUTES = [
  "",
  "/rituals/hammam",
  "/rituals/botanical",
  "/rituals/heritage",
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

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  for (const locale of LOCALES) {
    for (const r of STATIC_ROUTES) {
      entries.push({
        url: url(locale, r),
        changeFrequency: "monthly",
        priority: r === "" ? 1 : 0.7,
      });
    }
    for (const p of PRODUCTS) {
      entries.push({
        url: url(locale, `/product/${p.id}`),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }
  return entries;
}
