import { getTranslations } from "next-intl/server";
import Eyebrow from "@/components/primitives/Eyebrow";
import DisplayHeading from "@/components/primitives/DisplayHeading";
import Reveal from "@/components/primitives/Reveal";
import type { Product } from "@/lib/products";

interface Props { product: Product; lang: "en" | "fr"; }

const PLACEHOLDER: Record<"en" | "fr", Array<[string, string]>> = {
  en: [
    ["Open", "Unwrap the piece and read the artisan's mark."],
    ["Apply", "Use as recommended by the atelier."],
    ["Care", "Store in a dry, cool place to preserve the formulation."],
  ],
  fr: [
    ["Ouvrir", "Déballez la pièce et lisez la marque de l'artisan."],
    ["Appliquer", "Utilisez comme recommandé par l'atelier."],
    ["Préserver", "Conservez dans un endroit sec et frais pour préserver la formulation."],
  ],
};

export default async function ApplicationRitual({ product, lang }: Props) {
  const t = await getTranslations("product");

  const steps: Array<[string, string]> =
    product.application && product.application.length >= 3
      ? product.application.slice(0, 3).map((s) => s[lang])
      : PLACEHOLDER[lang];

  return (
    <section className="mx-auto max-w-[1440px] px-[var(--bb-margin-edge)] py-20 lg:py-28">
      <div className="space-y-3 mb-12 text-center">
        <Eyebrow tone="gold">{t("ritual_eyebrow")}</Eyebrow>
        <DisplayHeading size="lg" as="h2">
          <em className="font-display italic">{t("ritual_headline")}</em>
        </DisplayHeading>
      </div>
      <ol className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {steps.map(([title, body], i) => (
          <Reveal key={i} delayMs={i * 80} as="li" className="space-y-4">
            <span className="font-display text-[clamp(48px,5vw,72px)] leading-none text-bb-secondary">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="font-serif text-[22px] leading-[1.3] text-bb-on-surface">{title}</h3>
            <p className="text-bb-on-surface-variant leading-relaxed">{body}</p>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
