"use client";

import { useTranslations } from "next-intl";

export default function CredentialStrip() {
  const t = useTranslations("home");
  const items = [
    t("strip.item_1"),
    t("strip.item_2"),
    t("strip.item_3"),
    t("strip.item_4"),
  ];

  // Content is doubled so translateX(-50%) creates a seamless loop.
  return (
    <section
      className="bg-bb-bg-low border-y border-bb-line overflow-hidden py-4"
      aria-label={t("strip.aria")}
    >
      <div className="bb-marquee flex whitespace-nowrap font-sans text-[11px] uppercase tracking-[0.18em] text-bb-secondary-deep">
        {[...items, ...items].map((item, i) => (
          <span key={i} aria-hidden className="inline-flex items-center gap-8 px-8">
            <span>{item}</span>
            <span className="opacity-50">·</span>
          </span>
        ))}
      </div>
    </section>
  );
}
