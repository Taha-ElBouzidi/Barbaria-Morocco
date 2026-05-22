"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useInquiry } from "@/lib/inquiry-context";
import Icon from "@/components/primitives/Icon";

interface Props {
  giftBoxSlug: string;
  name: string;
  minQty: number;
  /** Category slug so the post-add "Continue browsing" CTA can return the
   *  buyer to the right list (cosmetiques vs epicerie_fine) instead of
   *  the products index. */
  categorySlug: string;
}

/**
 * Curated-box "Add to inquiry" CTA with a typeable quantity input flanked
 * by stepper buttons. After the buyer adds a box, the control replaces
 * itself with a persistent confirmation card offering "Continue browsing"
 * (back to the category list) and "Review your inquiry" (jump to /contact).
 * Standard add-to-cart pattern, except the cart is a B2B inquiry sidebar.
 */
export default function BoxAddToInquiry({
  giftBoxSlug,
  name,
  minQty,
  categorySlug,
}: Props) {
  const t = useTranslations("products");
  const tNav = useTranslations("nav");
  const { addBox } = useInquiry();
  const [qty, setQty] = useState(minQty);
  const [added, setAdded] = useState(false);

  const handleQtyChange = (raw: string) => {
    const parsed = parseInt(raw, 10);
    if (Number.isNaN(parsed)) {
      // Allow the field to be visually empty during typing; setQty stays at
      // last valid value so re-submit still works. blur snaps to min.
      setQty(minQty);
      return;
    }
    setQty(Math.max(minQty, parsed));
  };

  const handleAdd = () => {
    addBox({ giftBoxSlug, minQty, initialQty: qty, nameSnapshot: name });
    setAdded(true);
  };

  if (added) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-bb-line pb-3 text-bb-secondary-deep">
          <Icon name="check" size={14} />
          <span className="font-sans text-[11px] uppercase tracking-[0.18em]">
            {t("added_to_inquiry")}
          </span>
        </div>
        <p className="font-display text-bb-on-surface text-[15px]">
          {name} <span className="text-bb-on-surface-variant">&middot;</span> {qty}
        </p>
        <Link
          href={`/products/${categorySlug}`}
          className="inline-flex w-full items-center justify-center gap-2 px-6 py-4 border border-bb-secondary text-bb-secondary-deep font-sans text-[12px] uppercase tracking-[0.18em] hover:bg-bb-secondary/5 transition-colors"
        >
          {t("continue_browsing")}
        </Link>
        <Link
          href="/contact"
          className="inline-flex w-full items-center justify-center gap-2 px-6 py-4 border border-bb-secondary bg-bb-secondary text-bb-primary font-sans text-[12px] uppercase tracking-[0.18em] hover:bg-bb-secondary-fixed-dim transition-colors"
        >
          {t("view_inquiry")} <Icon name="arrow-up-right" size={14} />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-bb-line pb-3">
        <span className="text-[11px] uppercase tracking-[0.18em] text-bb-on-surface-variant">
          {tNav("inquiry_min_pill", { n: minQty })}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(minQty, q - 1))}
            disabled={qty <= minQty}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center border border-bb-line text-bb-on-surface transition-opacity hover:opacity-70 disabled:opacity-30"
            aria-label={tNav("inquiry_decrease", { name })}
          >
            <Icon name="minus" size={12} />
          </button>
          <input
            type="number"
            inputMode="numeric"
            min={minQty}
            value={qty}
            onChange={(e) => handleQtyChange(e.target.value)}
            onBlur={(e) => {
              const parsed = parseInt(e.target.value, 10);
              if (Number.isNaN(parsed) || parsed < minQty) setQty(minQty);
            }}
            className="w-16 min-h-[44px] text-center font-sans text-[15px] text-bb-on-surface bg-transparent border border-bb-line px-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary"
            aria-label={tNav("inquiry_qty_input", { name })}
          />
          <button
            type="button"
            onClick={() => setQty((q) => q + 1)}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center border border-bb-line text-bb-on-surface transition-opacity hover:opacity-70"
            aria-label={tNav("inquiry_increase", { name })}
          >
            <Icon name="plus" size={12} />
          </button>
        </div>
      </div>
      <button
        type="button"
        onClick={handleAdd}
        className="inline-flex w-full items-center justify-center gap-2 px-6 py-4 border border-bb-secondary bg-bb-secondary text-bb-primary font-sans text-[12px] uppercase tracking-[0.18em] transition-colors hover:bg-bb-secondary-fixed-dim"
      >
        {t("add_to_inquiry")} <Icon name="arrow-up-right" size={14} />
      </button>
    </div>
  );
}
