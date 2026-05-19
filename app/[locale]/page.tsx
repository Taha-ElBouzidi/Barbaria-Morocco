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
    title: t("hero.headline"),
    description: t("hero.lede"),
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
          potentialAction: {
            "@type": "SearchAction",
            target: `${BASE_URL}/fr?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
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
