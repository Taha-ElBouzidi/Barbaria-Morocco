"use client";

import { useEffect, useRef } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import Icon from "@/components/primitives/Icon";
import Photo from "@/components/primitives/Photo";
import Eyebrow from "@/components/primitives/Eyebrow";
import { useInquiry } from "@/lib/inquiry-context";
import { useProductCatalogue } from "@/lib/data/ProductCatalogueContext";
import { cn } from "@/lib/utils";

interface InquiryDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function InquiryDrawer({ open, onClose }: InquiryDrawerProps) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const lang: "en" | "fr" = locale === "fr" ? "fr" : "en";
  void lang; // locale resolved at query time; kept for potential future use
  const { cart, setQty, remove, clear } = useInquiry();
  const catalogue = useProductCatalogue();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Esc to close + focus trap + body scroll lock
  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeBtnRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "Tab" && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          "a, button, [tabindex]:not([tabindex='-1'])"
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  const items = [...cart.entries()];
  const hasItems = items.length > 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-[60] bg-bb-primary/40 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
        aria-hidden
      />
      {/* Panel. `inert` + `aria-hidden` are mirrored from MenuDrawer so when
          the drawer is closed (translated off-screen), its focusable elements
          do NOT remain in the tab order or accessible to AT. */}
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={t("inquiry_aria_drawer")}
        aria-hidden={!open}
        inert={!open}
        className={cn(
          "fixed inset-y-0 right-0 z-[61] flex w-[clamp(320px,80vw,480px)] flex-col bg-bb-bg shadow-2xl transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-bb-line px-8 py-6">
          <div className="flex items-baseline gap-3">
            <Eyebrow tone="green">{t("inquiry_title")}</Eyebrow>
            <span className="font-sans text-[11px] text-bb-on-surface-variant">
              ({cart.size})
            </span>
          </div>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            className="p-3 text-bb-on-surface"
            aria-label={t("inquiry_close")}
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        {/* Body, scrollable */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {!hasItems ? (
            /* Empty state */
            <div className="flex flex-col items-start gap-4 pt-8">
              <p className="font-serif italic text-[22px] leading-snug text-bb-on-surface">
                {t("inquiry_empty")}
              </p>
              <p className="font-sans text-[14px] text-bb-on-surface-variant">
                {t("inquiry_empty_lede")}
              </p>
              <Link
                href="/products/cosmetiques"
                onClick={onClose}
                className="mt-2 inline-block rounded-full border border-bb-primary px-6 py-3 font-sans text-[13px] uppercase tracking-[0.18em] text-bb-primary transition-colors hover:bg-bb-primary hover:text-bb-bg"
              >
                {t("inquiry_explore")}
              </Link>
            </div>
          ) : (
            /* Item list */
            <ul className="flex flex-col divide-y divide-bb-line">
              {items.map(([productId, qty]) => {
                const entry = catalogue.get(productId);
                const name = entry?.name ?? productId;
                const image = entry?.image ?? null;
                return (
                  <li key={productId} className="flex items-start gap-4 py-5">
                    {/* Thumbnail, Photo primitive applies deep-green gradient + noise fallback */}
                    <Photo
                      src={image}
                      alt={name}
                      containerClassName="h-20 w-20 shrink-0"
                    />

                    <div className="flex flex-1 flex-col gap-2">
                      {/* Name */}
                      <p className="font-sans text-[14px] font-medium tracking-[0.02em] text-bb-on-surface">
                        {name}
                      </p>
                      {/* MOQ pill removed pending real catalog map (was "ID: {slug}"
                          debug debris). Will re-add once the inquiry context
                          carries MOQ data from the catalogue. */}

                      <div className="flex items-center justify-between">
                        {/* Qty stepper */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setQty(productId, qty - 1)}
                            disabled={qty <= 1}
                            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-sm border border-bb-line text-bb-on-surface transition-opacity hover:opacity-70 disabled:opacity-30"
                            aria-label={t("inquiry_decrease", { name })}
                          >
                            <Icon name="minus" size={12} />
                          </button>
                          <span className="w-6 text-center font-sans text-[14px] text-bb-on-surface">
                            {qty}
                          </span>
                          <button
                            onClick={() => setQty(productId, qty + 1)}
                            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-sm border border-bb-line text-bb-on-surface transition-opacity hover:opacity-70"
                            aria-label={t("inquiry_increase", { name })}
                          >
                            <Icon name="plus" size={12} />
                          </button>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => remove(productId)}
                          className="p-1 text-bb-on-surface-variant transition-opacity hover:opacity-70"
                          aria-label={t("inquiry_remove", { name })}
                        >
                          <Icon name="close" size={16} />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer, sticky */}
        <div className="border-t border-bb-line px-8 py-6">
          <Link
            href="/contact"
            onClick={onClose}
            className="block w-full rounded-full bg-bb-primary px-8 py-4 text-center font-sans text-[13px] uppercase tracking-[0.18em] text-bb-bg transition-opacity hover:opacity-90"
          >
            {t("inquiry_request")}
          </Link>
          {hasItems && (
            <button
              onClick={clear}
              className="mt-3 w-full font-sans text-[13px] text-bb-on-surface-variant underline underline-offset-2 transition-opacity hover:opacity-70"
            >
              {t("inquiry_clear")}
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
