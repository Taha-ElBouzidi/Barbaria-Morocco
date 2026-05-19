import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import TwoStepForm from "@/components/contact/TwoStepForm";
import InquirySidebar from "@/components/contact/InquirySidebar";
import Eyebrow from "@/components/primitives/Eyebrow";
import DisplayHeading from "@/components/primitives/DisplayHeading";
import Reveal from "@/components/primitives/Reveal";
import AmazighProverb from "@/components/primitives/AmazighProverb";
import { getOccasions } from "@/lib/data/occasions";
import { getSiteSettings } from "@/lib/data/site-settings";
import { pageMetadata } from "@/lib/seo/page-metadata";

interface PageProps { params: Promise<{ locale: string }>; }

export const revalidate = 60;

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "fr" }];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return pageMetadata({
    locale,
    path: "/contact",
    title: t("hero_headline"),
    description: t("hero_headline"),
  });
}

export default async function ContactPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "contact" });
  const lang = locale === "fr" ? "fr" : "en";
  const [occasions, settings] = await Promise.all([
    getOccasions(lang),
    getSiteSettings(),
  ]);

  return (
    <div className="pt-32 lg:pt-40 pb-24 lg:pb-32">
      <section className="mx-auto max-w-[1440px] px-[var(--bb-margin-edge)]">
        <div className="max-w-[820px] space-y-6 mb-16 lg:mb-20">
          <Reveal><Eyebrow tone="green">{t("hero_eyebrow")}</Eyebrow></Reveal>
          <Reveal delayMs={80}><DisplayHeading size="xl" as="h1">{t("hero_headline")}</DisplayHeading></Reveal>
        </div>
        {/* On mobile the inquiry summary renders FIRST so buyers see their
            selection before filling the form. On desktop it sits on the
            right as a persistent sidebar. */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-10 lg:gap-20">
          <div className="order-2 lg:order-1">
            <TwoStepForm locale={locale} occasions={occasions} />
          </div>
          <div className="order-1 lg:order-2">
            <InquirySidebar
              lang={lang}
              contactEmail={settings.contactEmail}
              contactPhone={settings.contactPhone}
              whatsappUrl={settings.whatsappUrl}
            />
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-[1440px] px-[var(--bb-margin-edge)] mt-16 lg:mt-24 border-t border-[var(--bb-line)]">
        <AmazighProverb locale={locale} />
      </section>
    </div>
  );
}
