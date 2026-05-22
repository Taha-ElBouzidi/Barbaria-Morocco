import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export const revalidate = 60;
import Hero from "@/components/home/Hero";
import CredentialStrip from "@/components/home/CredentialStrip";
import EditorialBlock from "@/components/home/EditorialBlock";
import BentoCategories from "@/components/home/BentoCategories";
import Heritage3Up from "@/components/home/Heritage3Up";
import JsonLd from "@/components/JsonLd";
import { BASE_URL } from "@/lib/constants";
import { pageMetadata } from "@/lib/seo/page-metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  return pageMetadata({
    locale,
    path: "",
    // Use the SEO-optimised meta_title + meta_description (keyword
    // aware, brand suffix included), not the poetic hero copy. The
    // hero stays branded and emotional on the visible page; the meta
    // is engineered for buyer queries.
    title: t("meta_title"),
    description: t("meta_description"),
    ogImage: "/brand_photos/gift-box-open.jpg",
  });
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Barbaria Morocco",
          url: BASE_URL,
          inLanguage: locale,
          // No SearchAction: the site has no on-site search endpoint and
          // emitting a target Google cannot reach would 404 the Sitelinks
          // search-box query. Add this back if/when a /search route lands.
        }}
      />
      <Hero />
      <CredentialStrip />
      <div className="mx-auto max-w-[1440px] px-[var(--bb-margin-edge)] space-y-[var(--bb-section-gap)] py-[var(--bb-section-gap)]">
        <EditorialBlock />
        <BentoCategories />
        <Heritage3Up />
      </div>
    </>
  );
}
