"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import Icon from "@/components/primitives/Icon";
import Wordmark from "@/components/primitives/Wordmark";
import { useInquiry } from "@/lib/inquiry-context";
import { cn } from "@/lib/utils";

interface HeaderProps {
  locale: string;
  onOpenMenu: () => void;
  onOpenInquiry: () => void;
}

export default function Header({ locale, onOpenMenu, onOpenInquiry }: HeaderProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const { totalBoxes } = useInquiry();
  const [scrolled, setScrolled] = useState(false);

  // Hero pages have full-bleed top imagery that the header overlays transparently.
  const isHero =
    pathname === "/" ||
    pathname.startsWith("/products") ||
    pathname.startsWith("/story");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isDark = isHero && !scrolled;
  const otherLocale = locale === "fr" ? "en" : "fr";
  const textColor = isDark ? "text-white" : "text-bb-on-surface";

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled || !isHero ? "bg-bb-bg border-b border-bb-line" : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-[var(--bb-margin-edge)]">
        <Link href="/" aria-label="Barbaria Morocco, home" className="transition-opacity hover:opacity-80">
          <Wordmark variant="compact" tone={isDark ? "light" : "dark"} />
        </Link>

        <nav className="hidden lg:flex items-center gap-10 font-sans text-[13px] tracking-[0.04em] uppercase">
          {(["cosmetiques", "epicerie_fine"] as const).map((slug) => {
            const href = `/products/${slug}`;
            const isActive = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={slug}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "pb-0.5 border-b transition-opacity hover:opacity-70",
                  isActive ? "border-bb-secondary" : "border-transparent",
                  textColor
                )}
              >
                {t(slug)}
              </Link>
            );
          })}
          {(["story", "ateliers", "journal"] as const).map((key) => {
            const href = `/${key}`;
            const isActive = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={key}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "pb-0.5 border-b transition-opacity hover:opacity-70",
                  isActive ? "border-bb-secondary" : "border-transparent",
                  textColor
                )}
              >
                {t(key)}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Language toggle hidden on mobile per user request, kept in the
              MenuDrawer instead so the mobile header stays clean. */}
          <Link
            href={pathname}
            locale={otherLocale}
            className={cn(
              "hidden lg:inline-flex p-2 font-sans text-[12px] uppercase tracking-[0.18em]",
              textColor
            )}
            aria-label={`Switch to ${otherLocale === "fr" ? "Français" : "English"}`}
          >
            {otherLocale.toUpperCase()}
          </Link>
          <button
            onClick={onOpenInquiry}
            className={cn(
              "p-2 inline-flex items-center gap-1.5 font-sans text-[12px] uppercase tracking-[0.18em] min-h-[44px] min-w-[44px] justify-center",
              textColor
            )}
            aria-label={t("inquiry_aria", { count: totalBoxes })}
          >
            <Icon name="diamond" size={16} className="sm:hidden" />
            <span className="hidden sm:inline">{t("inquiry")}</span>
            <span className="text-[11px] tabular-nums">({totalBoxes})</span>
          </button>
          <button
            onClick={onOpenMenu}
            className={cn("p-3 min-h-[44px] min-w-[44px] flex items-center justify-center", textColor)}
            aria-label={t("menu")}
          >
            <Icon name="menu" size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
