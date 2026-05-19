import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { pageMetadata } from "@/lib/seo/page-metadata";
import Photo from "@/components/primitives/Photo";
import Eyebrow from "@/components/primitives/Eyebrow";
import DisplayHeading from "@/components/primitives/DisplayHeading";
import Reveal from "@/components/primitives/Reveal";
import { getAllAteliers } from "@/lib/data/ateliers";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "fr" }];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ateliers" });
  return pageMetadata({
    locale,
    path: "/ateliers",
    title: t("hero_headline"),
    description: t("hero_lede"),
  });
}

export default async function AteliersPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "ateliers" });

  const ateliers = await getAllAteliers(locale === "fr" ? "fr" : "en");

  return (
    <div className="pt-32 lg:pt-40 pb-20 lg:pb-32">
      {/* Page header, constrained to 820px for readability */}
      <div className="mx-auto max-w-[1440px] px-[var(--bb-margin-edge)] mb-20 lg:mb-28">
        <div className="max-w-[820px] space-y-6">
          <Reveal>
            <Eyebrow tone="green">{t("hero_eyebrow")}</Eyebrow>
          </Reveal>
          <Reveal delayMs={80}>
            <DisplayHeading size="xl" as="h1">
              {t("hero_headline")}
            </DisplayHeading>
          </Reveal>
          <Reveal delayMs={160}>
            <p className="text-bb-on-surface-variant leading-relaxed max-w-[640px]">{t("hero_lede")}</p>
          </Reveal>
        </div>
      </div>

      {/* 6-up cooperative grid */}
      <section
        className="mx-auto max-w-[1440px] px-[var(--bb-margin-edge)] grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-10 sm:gap-x-8 sm:gap-y-16"
        aria-label={t("hero_headline")}
      >
        {ateliers.map((a, i) => (
          <Reveal key={a.slug} delayMs={(i % 3) * 80} as="article" className="space-y-3 sm:space-y-4">
            <Photo
              src={a.image}
              alt={a.name}
              width={800}
              height={800}
              needsShot={!a.image}
              sizes="(min-width:1024px) 30vw, (min-width:768px) 45vw, 50vw"
              containerClassName="aspect-square"
            />
            <Eyebrow tone="green">
              {a.region} · {t("since", { year: a.sinceYear })}
            </Eyebrow>
            <h2 className="font-serif text-[18px] sm:text-[22px] lg:text-[28px] leading-[1.2] text-bb-on-surface">{a.name}</h2>
            <p className="text-bb-on-surface-variant leading-relaxed text-[12px] sm:text-[14px] line-clamp-4 sm:line-clamp-none">{a.description}</p>
          </Reveal>
        ))}
      </section>
    </div>
  );
}
