import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import Photo from "@/components/primitives/Photo";
import Eyebrow from "@/components/primitives/Eyebrow";
import DisplayHeading from "@/components/primitives/DisplayHeading";
import Reveal from "@/components/primitives/Reveal";
import { ATELIERS } from "@/lib/editorial";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "fr" }];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ateliers" });
  return {
    title: `${t("hero_headline")} | Barbaria Morocco`,
    description: t("hero_lede"),
  };
}

export default async function AteliersPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "ateliers" });
  const lang = locale === "fr" ? "fr" : "en";

  return (
    <div className="pt-32 lg:pt-40 pb-20 lg:pb-32">
      {/* Page header — constrained to 820px for readability */}
      <div className="mx-auto max-w-[1440px] px-[var(--bb-margin-edge)] mb-20 lg:mb-28">
        <div className="max-w-[820px] space-y-6">
          <Reveal>
            <Eyebrow tone="gold">{t("hero_eyebrow")}</Eyebrow>
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
        className="mx-auto max-w-[1440px] px-[var(--bb-margin-edge)] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16"
        aria-label={t("hero_headline")}
      >
        {ATELIERS.map((a, i) => (
          <Reveal key={a.id} delayMs={(i % 3) * 80} as="article" className="space-y-4">
            <Photo
              src={a.image}
              alt={a.name}
              width={800}
              height={800}
              needsShot={!a.image}
              sizes="(min-width:1024px) 30vw, (min-width:768px) 45vw, 100vw"
              containerClassName="aspect-square"
            />
            <Eyebrow tone="gold">
              {a.region} · {t("since", { year: a.since })}
            </Eyebrow>
            <h2 className="font-serif text-[28px] leading-[1.2] text-bb-on-surface">{a.name}</h2>
            <p className="text-bb-on-surface-variant leading-relaxed text-[14px]">{a.description[lang]}</p>
          </Reveal>
        ))}
      </section>
    </div>
  );
}
