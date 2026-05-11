"use client";

import { useTranslations } from "next-intl";
import Reveal from "@/components/primitives/Reveal";
import Icon from "@/components/primitives/Icon";

const cells = [
  { icon: "leaf" as const, key: "c1" },
  { icon: "concierge" as const, key: "c2" },
  { icon: "diamond" as const, key: "c3" },
] as const;

export default function Heritage3Up() {
  const t = useTranslations("home");

  return (
    <section>
      {/* Unattributed brand quote — the voice of the Maison itself. No cite element. */}
      <blockquote className="text-center max-w-[820px] mx-auto">
        <p className="font-display italic text-[clamp(24px,3vw,32px)] leading-[1.4] text-bb-primary">
          &ldquo;{t("heritage_3up.quote")}&rdquo;
        </p>
      </blockquote>

      {/* 3-cell icon grid */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
        {cells.map(({ icon, key }, i) => (
          <Reveal key={key} delayMs={i * 80} className="text-center space-y-4">
            <div className="inline-flex h-14 w-14 items-center justify-center text-bb-secondary">
              <Icon name={icon} size={36} />
            </div>
            <h3 className="font-serif text-[24px] leading-[1.3] text-bb-on-surface">
              {t(`heritage_3up.${key}_title`)}
            </h3>
            <p className="text-bb-on-surface-variant leading-relaxed">
              {t(`heritage_3up.${key}_body`)}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
