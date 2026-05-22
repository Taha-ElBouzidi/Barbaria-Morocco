import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Eyebrow from "@/components/primitives/Eyebrow";
import DisplayHeading from "@/components/primitives/DisplayHeading";
import Reveal from "@/components/primitives/Reveal";
import Icon from "@/components/primitives/Icon";
import JsonLd from "@/components/JsonLd";
import { pageMetadata } from "@/lib/seo/page-metadata";
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
  const t = await getTranslations({ locale, namespace: "faq" });
  return pageMetadata({
    locale,
    path: "/faq",
    title: t("meta_title"),
    description: t("meta_description"),
  });
}

// Eight Q&A pairs, indexed by question key. Each pair is content-rich
// (50-100 words per answer) which matches the 2026 GEO citation
// threshold; one-line answers get ignored by AI extractors.
const FAQ_KEYS = ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8"] as const;

export default async function FaqPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, tProducts] = await Promise.all([
    getTranslations({ locale, namespace: "faq" }),
    getTranslations({ locale, namespace: "products" }),
  ]);

  const pageUrl = `${BASE_URL}/${locale}/faq`;

  // FAQPage schema. The single highest-impact GEO addition: pages with
  // 5-8 substantive Q&A pairs get cited ~3x more often by AI search
  // engines than identical pages without it.
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: locale,
    mainEntity: FAQ_KEYS.map((key) => ({
      "@type": "Question",
      name: t(`${key}_question`),
      acceptedAnswer: {
        "@type": "Answer",
        text: t(`${key}_answer`),
      },
    })),
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: tProducts("breadcrumb_home"), item: `${BASE_URL}/${locale}` },
      { "@type": "ListItem", position: 2, name: t("headline"), item: pageUrl },
    ],
  };

  return (
    <div className="pt-32 lg:pt-40 pb-20 lg:pb-32">
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />

      {/* Page header */}
      <section className="mx-auto max-w-[1440px] px-[var(--bb-margin-edge)] mb-16 lg:mb-24">
        <div className="max-w-[820px] space-y-6">
          <Reveal>
            <Eyebrow tone="gold">{t("eyebrow")}</Eyebrow>
          </Reveal>
          <Reveal delayMs={80}>
            <DisplayHeading size="xl" as="h1">
              {t("headline")}
            </DisplayHeading>
          </Reveal>
          <Reveal delayMs={160}>
            <p className="font-display italic text-bb-on-surface-variant leading-relaxed text-[clamp(16px,1.4vw,18px)]">
              {t("lede")}
            </p>
          </Reveal>
        </div>
      </section>

      {/* Q&A list. Native <details> for accessibility + zero JS cost,
          first item open so the page never feels empty above the fold. */}
      <section className="mx-auto max-w-[920px] px-[var(--bb-margin-edge)] space-y-4">
        {FAQ_KEYS.map((key, i) => (
          <Reveal key={key} delayMs={i * 60}>
            <details
              className="group border-b border-bb-line py-6 last:border-b-0"
              {...(i === 0 ? { open: true } : {})}
            >
              <summary className="flex items-start justify-between gap-6 cursor-pointer list-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary py-2">
                <h2 className="font-display text-[20px] sm:text-[22px] lg:text-[24px] leading-tight text-bb-primary pr-4">
                  {t(`${key}_question`)}
                </h2>
                <span className="flex-shrink-0 mt-1.5 transition-transform group-open:rotate-45">
                  <Icon name="plus" size={16} />
                </span>
              </summary>
              <div className="pt-4 pl-0 sm:pl-2 max-w-[720px]">
                <p className="font-display text-[15px] sm:text-[16px] leading-relaxed text-bb-on-surface">
                  {t(`${key}_answer`)}
                </p>
              </div>
            </details>
          </Reveal>
        ))}
      </section>

      {/* Closing CTA: any unanswered question routes to /contact, the
          same inquiry pipeline that powers the rest of the site. */}
      <section className="mx-auto max-w-[920px] px-[var(--bb-margin-edge)] mt-20 lg:mt-28">
        <Reveal>
          <div className="border border-bb-line p-10 lg:p-14 text-center space-y-5">
            <Eyebrow tone="gold">{t("cta_eyebrow")}</Eyebrow>
            <p className="font-display text-[20px] sm:text-[24px] lg:text-[28px] leading-tight text-bb-primary max-w-[560px] mx-auto">
              {t("cta_headline")}
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-bb-secondary bg-bb-secondary text-bb-primary font-sans text-[12px] uppercase tracking-[0.18em] hover:bg-bb-secondary-fixed-dim transition-colors"
            >
              {t("cta_button")} <Icon name="arrow-up-right" size={14} />
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
