import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { cn } from "@/lib/utils";
import Photo from "@/components/primitives/Photo";
import Eyebrow from "@/components/primitives/Eyebrow";
import DisplayHeading from "@/components/primitives/DisplayHeading";
import Reveal from "@/components/primitives/Reveal";
import JsonLd from "@/components/JsonLd";
import { getAllJournalCards } from "@/lib/data/journal";
import { BASE_URL } from "@/lib/constants";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "fr" }];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "journal" });
  return pageMetadata({
    locale,
    path: "/journal",
    title: t("meta_title"),
    description: t("meta_description"),
  });
}

function formatJournalDate(iso: string, locale: "en" | "fr"): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

export default async function JournalPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "journal" });
  const lang = locale === "fr" ? "fr" : "en";

  const cards = await getAllJournalCards(lang);
  const feature = cards.find((c) => c.feature);
  const standards = cards.filter((c) => !c.feature);

  // SEO: Blog + BlogPosting entries so AI engines can extract the
  // editorial cadence even before per-post detail pages exist.
  // `mainEntityOfPage` points at the list URL until each post gets
  // its own route; `dateModified` defaults to the post's date.
  const pageUrl = `${BASE_URL}/${locale}/journal`;
  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: t("hero_headline"),
    description: t("meta_description"),
    url: pageUrl,
    inLanguage: locale,
    publisher: {
      "@type": "Organization",
      name: "Barbaria Morocco",
      url: BASE_URL,
      logo: `${BASE_URL}/brand_photos/barbaria-logo-new.jpg`,
    },
    blogPost: cards.map((card) => ({
      "@type": "BlogPosting",
      headline: card.headline,
      image: card.image ? `${BASE_URL}${card.image}` : undefined,
      datePublished: card.date,
      dateModified: card.date,
      author: { "@type": "Organization", name: "Barbaria Morocco" },
      publisher: { "@type": "Organization", name: "Barbaria Morocco" },
      articleSection: card.kicker,
      mainEntityOfPage: pageUrl,
      inLanguage: locale,
    })),
  };
  const t2 = await getTranslations({ locale, namespace: "products" });
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: t2("breadcrumb_home"), item: `${BASE_URL}/${locale}` },
      { "@type": "ListItem", position: 2, name: t("hero_headline"), item: pageUrl },
    ],
  };

  return (
    <div className="pt-32 lg:pt-40 pb-20 lg:pb-32">
      <JsonLd data={blogSchema} />
      <JsonLd data={breadcrumbSchema} />
      {/* Page header */}
      <section className="mx-auto max-w-[1440px] px-[var(--bb-margin-edge)] mb-20 lg:mb-28">
        <div className="max-w-[820px] space-y-6">
          <Reveal>
            <Eyebrow tone="green">{t("hero_eyebrow")}</Eyebrow>
          </Reveal>
          <Reveal delayMs={80}>
            <DisplayHeading size="xl" as="h1">
              {t("hero_headline")}
            </DisplayHeading>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-[var(--bb-margin-edge)] space-y-16">
        {cards.length === 0 && (
          <p className="font-display italic text-center text-bb-on-surface-variant py-12">
            {lang === "fr" ? "À venir." : "Coming soon."}
          </p>
        )}

        {/* Feature card, 4:3 landscape, article pages deferred */}
        {feature && (
          <Reveal
            as="article"
            className="block opacity-90"
          >
            <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-12 lg:gap-16 items-end">
              <Photo
                src={feature.image}
                alt={feature.headline}
                width={1400}
                height={1050}
                needsShot={!feature.image}
                sizes="(min-width:1024px) 60vw, 100vw"
                containerClassName="aspect-[4/3]"
              />
              <div className="space-y-4">
                <Eyebrow tone="green">{feature.kicker}</Eyebrow>
                <h2 className="font-serif text-[clamp(28px,3vw,40px)] leading-[1.2]">
                  {feature.headline}
                </h2>
                <p className="font-sans text-[12px] uppercase tracking-[0.18em] text-bb-on-surface-variant">
                  {formatJournalDate(feature.date, lang)}
                </p>
              </div>
            </div>
          </Reveal>
        )}

        {/* Standard cards, 4:5 portrait, article pages deferred */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-10 sm:gap-x-8 sm:gap-y-16">
          {standards.map((c, i) => (
            <Reveal
              key={c.slug}
              as="article"
              delayMs={(i % 3) * 80}
              className={cn(
                "space-y-3 sm:space-y-4 cursor-not-allowed opacity-90 hover:opacity-100 transition-opacity"
              )}
              aria-disabled="true"
            >
              <Photo
                src={c.image}
                alt={c.headline}
                width={800}
                height={1000}
                needsShot={!c.image}
                sizes="(min-width:1024px) 30vw, (min-width:768px) 45vw, 50vw"
                containerClassName="aspect-[4/5]"
              />
              <div className="space-y-2 sm:space-y-3">
                <Eyebrow tone="green">{c.kicker}</Eyebrow>
                <h3 className="font-serif text-[16px] sm:text-[20px] lg:text-[22px] leading-[1.3]">{c.headline}</h3>
                <p className="font-sans text-[10px] sm:text-[11px] uppercase tracking-[0.16em] sm:tracking-[0.18em] text-bb-on-surface-variant">
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
