"use client";
import { useTranslations } from "next-intl";
import { useInquiry } from "@/lib/inquiry-context";
import Eyebrow from "@/components/primitives/Eyebrow";
import Icon from "@/components/primitives/Icon";
import { WHATSAPP_NUMBER } from "@/lib/constants";

interface Props { lang: "en" | "fr"; }

/**
 * Sprint 2.6 box-level sidebar. Each inquiry line carries its own qty
 * stepper that respects the admin-set MOQ, plus a remove button. Custom
 * boxes show a "Custom box · N pieces" subline; curated show the
 * snapshot name and a "Curated box" tag.
 */
export default function InquirySidebar({ lang: _lang }: Props) {
  const t = useTranslations("contact");
  const tNav = useTranslations("nav");
  const { lines, setQty, remove, totalBoxes, totalUnits } = useInquiry();

  return (
    <aside className="lg:sticky lg:top-[88px] lg:self-start space-y-10">
      <div className="space-y-4">
        <Eyebrow tone="green">{t("sidebar_title")}</Eyebrow>
        <p className="font-sans text-[12px] uppercase tracking-[0.18em] text-bb-on-surface-variant">
          {totalBoxes === 0
            ? "0"
            : `${t("sidebar_count", { count: totalBoxes })} · ${totalUnits} ${tNav("inquiry_pieces")}`}
        </p>
      </div>

      {lines.length === 0 ? (
        <p className="font-display italic text-[18px] text-bb-on-surface-variant">
          {t("sidebar_empty")}
        </p>
      ) : (
        <ul className="space-y-4 lg:max-h-[480px] lg:overflow-y-auto lg:pr-2">
          {lines.map((line) => {
            const isCustom = !!line.custom;
            const name = line.nameSnapshot ?? line.giftBoxSlug;
            const subline = isCustom
              ? `${tNav("inquiry_box_custom")} · ${line.custom!.productSlugs.length} ${tNav("inquiry_pieces")}`
              : tNav("inquiry_box_curated");
            return (
              <li key={line.id} className="flex items-start gap-3 py-3 border-b border-bb-line/50">
                <div
                  className="h-16 w-16 shrink-0 flex items-center justify-center bg-bb-bg-low text-bb-secondary-deep"
                  aria-hidden
                >
                  <Icon name={isCustom ? "diamond" : "leaf"} size={24} />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <h4 className="font-serif text-[14px] text-bb-on-surface truncate">{name}</h4>
                  <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-bb-secondary-deep">
                    {subline}
                  </p>
                  <p className="font-sans text-[11px] text-bb-on-surface-variant">
                    {tNav("inquiry_min_pill", { n: line.minQty })}
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setQty(line.id, line.qty - 1)}
                      disabled={line.qty <= line.minQty}
                      className="flex h-11 w-11 items-center justify-center border border-bb-line text-bb-on-surface hover:opacity-70 disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary"
                      aria-label={tNav("inquiry_decrease", { name })}
                    >
                      <Icon name="minus" size={12} />
                    </button>
                    <span className="w-8 text-center font-sans text-[14px] text-bb-on-surface">{line.qty}</span>
                    <button
                      type="button"
                      onClick={() => setQty(line.id, line.qty + 1)}
                      className="flex h-11 w-11 items-center justify-center border border-bb-line text-bb-on-surface hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary"
                      aria-label={tNav("inquiry_increase", { name })}
                    >
                      <Icon name="plus" size={12} />
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => remove(line.id)}
                  aria-label={tNav("inquiry_remove", { name })}
                  className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-bb-on-surface-variant hover:text-bb-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary"
                >
                  <Icon name="close" size={14} />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="border-t border-bb-line pt-8 space-y-4">
        <Eyebrow tone="green">{t("direct_lines")}</Eyebrow>
        <ul className="space-y-2 font-sans text-[14px] text-bb-on-surface">
          <li>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-bb-secondary-deep transition-colors inline-flex items-center gap-2"
            >
              WhatsApp <Icon name="arrow-up-right" size={12} />
            </a>
          </li>
          <li>
            <a
              href="mailto:concierge@barbariamorocco.com"
              className="hover:text-bb-secondary-deep transition-colors"
            >
              concierge@barbariamorocco.com
            </a>
          </li>
        </ul>
      </div>
      <div className="space-y-2">
        <Eyebrow tone="green">{t("atelier")}</Eyebrow>
        <address className="not-italic font-sans text-[14px] text-bb-on-surface-variant leading-relaxed">
          Avenue Hassan II<br />
          Marrakech, Morocco
        </address>
      </div>
    </aside>
  );
}
