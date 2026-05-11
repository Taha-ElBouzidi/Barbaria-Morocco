import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import Hero from "@/components/home/Hero";
import CredentialStrip from "@/components/home/CredentialStrip";
import EditorialBlock from "@/components/home/EditorialBlock";
import BentoRituals from "@/components/home/BentoRituals";
import Heritage3Up from "@/components/home/Heritage3Up";
import JsonLd from "@/components/JsonLd";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  return {
    title: "Barbaria Morocco | " + t("hero.headline"),
    description: t("hero.lede"),
    openGraph: { images: [{ url: "/brand_photos/gift-box-open.jpg" }] },
  };
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
          url: "https://barbaria-morocco.vercel.app",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://barbaria-morocco.vercel.app/fr?q={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        }}
      />
      <Hero />
      <CredentialStrip />
      <div className="mx-auto max-w-[1440px] px-[var(--bb-margin-edge)] space-y-[var(--bb-section-gap)] py-[var(--bb-section-gap)]">
        <EditorialBlock />
        <BentoRituals />
        <Heritage3Up />
      </div>
    </>
  );
}
