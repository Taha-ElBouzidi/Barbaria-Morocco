import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import TwoStepForm from "@/components/contact/TwoStepForm";
import InquirySidebar from "@/components/contact/InquirySidebar";
import Eyebrow from "@/components/primitives/Eyebrow";
import DisplayHeading from "@/components/primitives/DisplayHeading";
import Reveal from "@/components/primitives/Reveal";
import AmazighProverb from "@/components/primitives/AmazighProverb";

interface PageProps { params: Promise<{ locale: string }>; }

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "fr" }];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return {
    title: `${t("hero_headline")} | Barbaria Morocco`,
    description: t("hero_headline"),
  };
}

export default async function ContactPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "contact" });
  const lang = locale === "fr" ? "fr" : "en";

  return (
    <div className="pt-32 lg:pt-40 pb-24 lg:pb-32">
      <section className="mx-auto max-w-[1440px] px-[var(--bb-margin-edge)]">
        <div className="max-w-[820px] space-y-6 mb-16 lg:mb-20">
          <Reveal><Eyebrow tone="green">{t("hero_eyebrow")}</Eyebrow></Reveal>
          <Reveal delayMs={80}><DisplayHeading size="xl" as="h1">{t("hero_headline")}</DisplayHeading></Reveal>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-12 lg:gap-20">
          <TwoStepForm locale={locale} />
          <InquirySidebar lang={lang} />
        </div>
      </section>
      <section className="mx-auto max-w-[1440px] px-[var(--bb-margin-edge)] mt-16 lg:mt-24 border-t border-[var(--bb-line)]">
        <AmazighProverb locale={locale} />
      </section>
    </div>
  );
}
