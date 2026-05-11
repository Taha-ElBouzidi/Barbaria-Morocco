import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";
import Photo from "@/components/primitives/Photo";
import Eyebrow from "@/components/primitives/Eyebrow";
import DisplayHeading from "@/components/primitives/DisplayHeading";
import Reveal from "@/components/primitives/Reveal";
import { JOURNAL, formatJournalDate } from "@/lib/editorial";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "fr" }];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "journal" });
  return {
    title: `${t("hero_headline")} | Barbaria Morocco`,
    description: t("hero_headline"),
  };
}

export default async function JournalPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "journal" });
  const lang = locale === "fr" ? "fr" : "en";

  const feature = JOURNAL.find((c) => c.feature);
  const standards = JOURNAL.filter((c) => !c.feature);

  return (
    <div className="pt-32 lg:pt-40 pb-20 lg:pb-32">
      {/* Page header */}
      <section className="mx-auto max-w-[1440px] px-[var(--bb-margin-edge)] mb-20 lg:mb-28">
        <div className="max-w-[820px] space-y-6">
          <Reveal>
            <Eyebrow tone="gold">{t("hero_eyebrow")}</Eyebrow>
          </Reveal>
          <Reveal delayMs={80}>
            <DisplayHeading size="xl" as="h1">
              {t("hero_headline")}
            </DisplayHeading>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-[var(--bb-margin-edge)] space-y-16">
        {/* Feature card — 4:3 landscape, article pages deferred */}
        {feature && (
          <Reveal
            as="article"
            className="block group cursor-not-allowed opacity-90 hover:opacity-100 transition-opacity"
            aria-disabled="true"
          >
            <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-12 lg:gap-16 items-end">
              <Photo
                src={feature.image}
                alt={feature.headline[lang]}
                width={1400}
                height={1050}
                needsShot={!feature.image}
                sizes="(min-width:1024px) 60vw, 100vw"
                containerClassName="aspect-[4/3]"
              />
              <div className="space-y-4">
                <Eyebrow tone="gold">{feature.kicker[lang]}</Eyebrow>
                <h2 className="font-serif text-[clamp(28px,3vw,40px)] leading-[1.2]">
                  {feature.headline[lang]}
                </h2>
                <p className="font-sans text-[12px] uppercase tracking-[0.18em] text-bb-on-surface-variant">
                  {formatJournalDate(feature.date, lang)}
                </p>
              </div>
            </div>
          </Reveal>
        )}

        {/* Standard cards — 4:5 portrait, article pages deferred */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {standards.map((c, i) => (
            <Reveal
              key={c.id}
              as="article"
              delayMs={(i % 3) * 80}
              className={cn(
                "space-y-4 cursor-not-allowed opacity-90 hover:opacity-100 transition-opacity"
              )}
              aria-disabled="true"
            >
              <Photo
                src={c.image}
                alt={c.headline[lang]}
                width={800}
                height={1000}
                needsShot={!c.image}
                sizes="(min-width:1024px) 30vw, (min-width:768px) 45vw, 100vw"
                containerClassName="aspect-[4/5]"
              />
              <div className="space-y-3">
                <Eyebrow tone="gold">{c.kicker[lang]}</Eyebrow>
                <h3 className="font-serif text-[22px] leading-[1.3]">{c.headline[lang]}</h3>
                <p className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-on-surface-variant">
                  {formatJournalDate(c.date, lang)}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
