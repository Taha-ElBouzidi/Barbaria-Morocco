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
}

/**
 * Sprint 2.6 , Curated-box "Add to inquiry" CTA with admin-MOQ-respecting
 * qty stepper. Replaces the bare "Send us a request" Link to /contact; the
 * inquiry is now box-level, so the buyer adds the box itself (not its
 * pieces) to their inquiry list.
 */
export default function BoxAddToInquiry({ giftBoxSlug, name, minQty }: Props) {
  const t = useTranslations("products");
  const tNav = useTranslations("nav");
  const { addBox } = useInquiry();
  const [qty, setQty] = useState(minQty);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addBox({ giftBoxSlug, minQty, initialQty: qty, nameSnapshot: name });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2400);
  };

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
          <span className="w-10 text-center font-sans text-[15px] text-bb-on-surface">{qty}</span>
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
        disabled={added}
        className="inline-flex w-full items-center justify-center gap-2 px-6 py-4 border border-bb-secondary bg-bb-secondary text-bb-primary font-sans text-[12px] uppercase tracking-[0.18em] transition-colors hover:bg-bb-secondary-fixed-dim disabled:opacity-70"
      >
        {added ? (
          <>
            <Icon name="check" size={14} /> {t("added")}
          </>
        ) : (
          <>
            {t("add_to_inquiry")} <Icon name="arrow-up-right" size={14} />
          </>
        )}
      </button>
      <Link
        href="/contact"
        className="block text-center font-sans text-[11px] uppercase tracking-[0.18em] text-bb-secondary-deep hover:text-bb-primary transition-colors"
      >
        {t("view_inquiry")}
      </Link>
    </div>
  );
}
