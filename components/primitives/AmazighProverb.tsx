import { getTranslations } from "next-intl/server";
import TifinaghMark from "./TifinaghMark";
import Reveal from "./Reveal";

/**
 * Amazigh proverb block.
 *
 * Renders « Nul n'est étranger sur la terre de ses ancêtres. » attributed
 * to PROVERBE AMAZIGH, framed by a centered Tifinagh ⵣ ambient mark.
 *
 * Translations live under the `common.amazigh_proverb` namespace so the
 * block can be reused on Story, Contact, and anywhere else the brand voice
 * needs to surface the closing line. Server component so getTranslations
 * resolves at render time without hydration cost.
 */
export default async function AmazighProverb({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "common.amazigh_proverb" });

  return (
    <div className="mx-auto max-w-[820px] py-16 lg:py-24 text-center">
      <Reveal>
        <TifinaghMark size={40} className="mb-6" />
      </Reveal>
      <Reveal delayMs={80}>
        <blockquote className="font-display italic text-[clamp(22px,2.4vw,32px)] leading-[1.4] text-bb-on-surface">
          &laquo;&nbsp;{t("quote")}&nbsp;&raquo;
        </blockquote>
      </Reveal>
      <Reveal delayMs={160}>
        <p className="mt-4 text-[11px] uppercase tracking-[0.18em] text-bb-secondary">
          {t("attribution")}
        </p>
      </Reveal>
    </div>
  );
}
