"use client";
import { useTranslations } from "next-intl";
import { useInquiry } from "@/lib/inquiry-context";
import { useProductCatalogue } from "@/lib/data/ProductCatalogueContext";
import Photo from "@/components/primitives/Photo";
import Eyebrow from "@/components/primitives/Eyebrow";
import Icon from "@/components/primitives/Icon";
import { WHATSAPP_NUMBER } from "@/lib/constants";

interface Props { lang: "en" | "fr"; }

export default function InquirySidebar({ lang: _lang }: Props) {
  const t = useTranslations("contact");
  const tNav = useTranslations("nav");
  const { cart, remove } = useInquiry();
  const catalogue = useProductCatalogue();

  const items = [...cart.entries()].map(([id, qty]) => {
    const entry = catalogue.get(id);
    return { id, name: entry?.name ?? id, image: entry?.image ?? null, qty };
  });

  return (
    <aside className="lg:sticky lg:top-[88px] lg:self-start space-y-10">
      <div className="space-y-4">
        <Eyebrow tone="green">{t("sidebar_title")}</Eyebrow>
        <p className="font-sans text-[12px] uppercase tracking-[0.18em] text-bb-on-surface-variant">
          {cart.size === 0 ? "0" : t("sidebar_count", { count: cart.size })}
        </p>
      </div>

      {items.length === 0 ? (
        <p className="font-display italic text-[18px] text-bb-on-surface-variant">
          {t("sidebar_empty")}
        </p>
      ) : (
        <ul className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          {items.map(({ id, name, image, qty }) => (
            <li key={id} className="flex items-start gap-3 py-3 border-b border-bb-line/50">
              <Photo src={image} alt={name} width={64} height={64} sizes="64px" containerClassName="h-16 w-16 shrink-0" />
              <div className="flex-1 min-w-0 space-y-1">
                <h4 className="font-serif text-[14px] text-bb-on-surface truncate">{name}</h4>
                <p className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-on-surface-variant">× {qty}</p>
              </div>
              <button onClick={() => remove(id)} aria-label={tNav("inquiry_remove", { name })} className="p-2 text-bb-on-surface-variant hover:text-bb-primary">
                <Icon name="close" size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="border-t border-bb-line pt-8 space-y-4">
        <Eyebrow tone="green">{t("direct_lines")}</Eyebrow>
        <ul className="space-y-2 font-sans text-[14px] text-bb-on-surface">
          <li><a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="hover:text-bb-secondary transition-colors inline-flex items-center gap-2">WhatsApp <Icon name="arrow-up-right" size={12} /></a></li>
          <li><a href="mailto:concierge@barbariamorocco.com" className="hover:text-bb-secondary transition-colors">concierge@barbariamorocco.com</a></li>
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
