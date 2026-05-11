"use client";

import { useTranslations } from "next-intl";

export default function CredentialStrip() {
  const t = useTranslations("home");
  const items = [
    t("strip.item_1"),
    t("strip.item_2"),
    t("strip.item_3"),
    t("strip.item_4"),
  ] as const;

  return (
    <section className="bg-bb-bg-low border-y border-bb-line overflow-hidden">
      <div className="mx-auto max-w-[1440px] px-[var(--bb-margin-edge)] py-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 font-sans text-[11px] uppercase tracking-[0.18em] text-bb-on-surface-variant">
        {items.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-8">
            {item}
            {i < items.length - 1 && (
              <span aria-hidden className="opacity-50">
                ·
              </span>
            )}
          </span>
        ))}
      </div>
    </section>
  );
}
