import type { Metadata } from "next";
import { BASE_URL } from "@/lib/constants";

interface PageMetadataInput {
  /** Active locale, "fr" or "en". */
  locale: string;
  /** Path WITHIN the locale, leading slash, no locale prefix. e.g. "/contact", "/legal/privacy". Use "" for the locale root. */
  path: string;
  /** Page title (just the page label; the layout template appends " | Barbaria Morocco"). */
  title?: string;
  /** Page description. */
  description?: string;
  /** Override the OG image (optional). */
  ogImage?: string;
}

/**
 * Produces the right `alternates.canonical` + `alternates.languages`
 * for a page, so Google sees one canonical per route and the FR/EN
 * variants paired by hreflang. Without this, the root layout was
 * emitting `canonical=/fr` on every page (the bug the audit flagged),
 * which tells Google every page is a duplicate of the home and
 * causes mass deindexing.
 *
 * Use in every page's generateMetadata:
 *
 *   return pageMetadata({ locale, path: "/contact", title: t("hero_headline") });
 *
 * For the layout's default metadata, call with path = "" to get the
 * locale root canonical.
 */
export function pageMetadata({
  locale,
  path,
  title,
  description,
  ogImage,
}: PageMetadataInput): Metadata {
  const normalisedPath = path === "" || path === "/" ? "" : path;
  const canonical = `${BASE_URL}/${locale}${normalisedPath}`;
  const meta: Metadata = {
    alternates: {
      canonical,
      languages: {
        fr: `${BASE_URL}/fr${normalisedPath}`,
        en: `${BASE_URL}/en${normalisedPath}`,
        "x-default": `${BASE_URL}/fr${normalisedPath}`,
      },
    },
  };
  if (title) meta.title = title;
  if (description) meta.description = description;
  if (ogImage) meta.openGraph = { images: [{ url: ogImage }] };
  return meta;
}
