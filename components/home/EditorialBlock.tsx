"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Photo from "@/components/primitives/Photo";
import Reveal from "@/components/primitives/Reveal";
import Eyebrow from "@/components/primitives/Eyebrow";
import DisplayHeading from "@/components/primitives/DisplayHeading";
import Icon from "@/components/primitives/Icon";

export default function EditorialBlock() {
  const t = useTranslations("home");

  return (
    <section className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-20 items-center">
      <Reveal>
        <Photo
          src="/brand_photos/brand-lifestyle-1.jpg"
          alt={t("editorial.photo_alt")}
          width={1100}
          height={1380}
          sizes="(min-width: 1024px) 55vw, 100vw"
          containerClassName="aspect-[4/5]"
        />
      </Reveal>

      <div className="space-y-6 lg:pl-8">
        <Reveal delayMs={80}>
          <Eyebrow tone="green">{t("editorial.eyebrow")}</Eyebrow>
        </Reveal>

        <Reveal delayMs={160}>
          <DisplayHeading size="lg">{t("editorial.headline")}</DisplayHeading>
        </Reveal>

        <Reveal
          delayMs={240}
          className="space-y-4 text-bb-on-surface-variant leading-relaxed max-w-[520px]"
        >
          <p>{t("editorial.p1")}</p>
          <p>{t("editorial.p2")}</p>
        </Reveal>

        <Reveal delayMs={320}>
          <Link
            href="/story"
            className="inline-flex items-center gap-2 font-sans text-[12px] uppercase tracking-[0.18em] text-bb-primary border-b border-bb-line pb-1 hover:border-bb-secondary transition-colors"
          >
            {t("editorial.cta")} <Icon name="arrow-right" size={16} />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
