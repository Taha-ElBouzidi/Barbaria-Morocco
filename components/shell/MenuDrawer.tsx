"use client";

import { useEffect, useRef } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import Icon from "@/components/primitives/Icon";
import Eyebrow from "@/components/primitives/Eyebrow";
import { cn } from "@/lib/utils";
import { WHATSAPP_NUMBER } from "@/lib/constants";

interface MenuDrawerProps {
  open: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  { slug: "cosmetiques", icon: "leaf", key: "menu_cosmetiques" },
  { slug: "epicerie_fine", icon: "diamond", key: "menu_epicerie" },
] as const;

export default function MenuDrawer({ open, onClose }: MenuDrawerProps) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
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

      {/* Panel, inert when closed so off-screen links are excluded from tab order and AT */}
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={t("menu_aria")}
        aria-hidden={!open}
        // inert removes the element from the accessibility tree when closed
        inert={!open}
        className={cn(
          "fixed inset-y-0 right-0 z-[61] flex w-[min(86vw,440px)] sm:w-[clamp(360px,70vw,480px)] flex-col bg-bb-bg shadow-2xl transition-transform duration-300 overflow-hidden",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Scrollable body */}
        <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">

          {/* Close button, top-right */}
          <div className="flex justify-end px-6 pt-6 pb-2 shrink-0">
            <button
              ref={closeBtnRef}
              onClick={onClose}
              className="p-2 text-bb-on-surface hover:text-bb-primary transition-colors"
              aria-label={t("menu_close")}
            >
              <Icon name="close" size={20} />
            </button>
          </div>

          {/* Rituals header */}
          <div className="px-8 pb-6 shrink-0">
            <Eyebrow tone="green" className="mb-3">{t("menu_eyebrow")}</Eyebrow>
            <p className="font-display italic text-[clamp(28px,5vw,38px)] leading-[1.1] tracking-[-0.01em] text-bb-on-surface">
              {t("menu_heading")}
            </p>
            <p className="mt-2 font-sans text-[13px] text-bb-on-surface-variant">
              {t("menu_subtitle")}
            </p>
          </div>

          {/* Hairline */}
          <div className="h-px bg-bb-line mx-8 shrink-0" />

          {/* Category links with icons */}
          <nav aria-label={t("menu_eyebrow")}>
            {CATEGORIES.map(({ slug, icon, key }) => (
              <div key={slug}>
                <Link
                  href={`/products/${slug}`}
                  onClick={onClose}
                  className="flex items-center gap-4 px-8 py-5 text-bb-on-surface hover:text-bb-primary transition-colors group"
                >
                  <Icon name={icon} size={20} className="shrink-0 text-bb-secondary group-hover:text-bb-primary transition-colors" />
                  <span className="font-sans text-[15px] tracking-[0.03em]">{t(key)}</span>
                </Link>
                <div className="h-px bg-bb-line mx-8" />
              </div>
            ))}
          </nav>

          {/* Discover section */}
          <div className="px-8 pt-6 pb-2 shrink-0">
            <Eyebrow tone="green">{t("menu_discover")}</Eyebrow>
          </div>
          <nav aria-label={t("menu_discover")} className="px-8 pb-6 flex flex-col gap-3">
            <Link
              href="/story"
              onClick={onClose}
              className="font-sans text-[14px] tracking-[0.02em] text-bb-on-surface hover:text-bb-primary transition-colors"
            >
              {t("discover_story")}
            </Link>
            <Link
              href="/ateliers"
              onClick={onClose}
              className="font-sans text-[14px] tracking-[0.02em] text-bb-on-surface hover:text-bb-primary transition-colors"
            >
              {t("discover_ateliers")}
            </Link>
            <Link
              href="/journal"
              onClick={onClose}
              className="font-sans text-[14px] tracking-[0.02em] text-bb-on-surface hover:text-bb-primary transition-colors"
            >
              {t("discover_journal")}
            </Link>
          </nav>

          {/* Corporate section */}
          <div className="px-8 pt-2 pb-2 shrink-0">
            <Eyebrow tone="green">{t("menu_corporate")}</Eyebrow>
          </div>
          <nav aria-label={t("menu_corporate")} className="px-8 pb-6 flex flex-col gap-3">
            <Link
              href="/contact"
              onClick={onClose}
              className="font-sans text-[14px] tracking-[0.02em] text-bb-on-surface hover:text-bb-primary transition-colors"
            >
              {t("corporate_b2b")}
            </Link>
          </nav>

          {/* Spacer pushes CTA toward bottom */}
          <div className="flex-1" />

          {/* CTA button */}
          <div className="px-8 pb-6 shrink-0">
            <Link
              href="/contact"
              onClick={onClose}
              className="flex w-full items-center justify-center gap-2 bg-bb-primary text-white font-sans text-[12px] uppercase tracking-[0.18em] px-6 py-4 hover:bg-bb-primary-container transition-colors"
            >
              {t("menu_cta")}
              <Icon name="arrow-right" size={14} />
            </Link>
          </div>

          {/* Footer row. Lang toggle gets prominence on mobile since it's
              hidden from the header there. WhatsApp + email sit below on
              their own row for cleaner stacking. */}
          <div className="h-px bg-bb-line mx-8 shrink-0" />
          <div className="px-6 sm:px-8 py-5 flex flex-col gap-4 shrink-0">
            <div className="flex items-center gap-2 font-sans text-[11px] uppercase tracking-[0.18em]">
              <Icon name="globe" size={14} className="text-bb-on-surface-variant shrink-0" />
              {(["en", "fr"] as const).map((l) => {
                const isActive = l === locale;
                return (
                  <Link
                    key={l}
                    href={pathname}
                    locale={l}
                    onClick={onClose}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "px-2 py-1 transition-colors",
                      isActive
                        ? "text-bb-primary font-semibold"
                        : "text-bb-on-surface-variant hover:text-bb-primary"
                    )}
                  >
                    {l.toUpperCase()}
                  </Link>
                );
              })}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 font-sans text-[11px] uppercase tracking-[0.18em] text-bb-on-surface-variant hover:text-bb-primary transition-colors"
              >
                <Icon name="whatsapp" size={14} />
                {t("menu_whatsapp")}
              </a>
              <a
                href="mailto:concierge@barbariamorocco.com"
                className="flex items-center gap-1.5 font-sans text-[11px] uppercase tracking-[0.18em] text-bb-on-surface-variant hover:text-bb-primary transition-colors"
              >
                <Icon name="mail" size={14} />
                {t("menu_email")}
              </a>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
