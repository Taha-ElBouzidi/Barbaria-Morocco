"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import Icon from "@/components/primitives/Icon";
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
  const { totalItems } = useInquiry();
  const [scrolled, setScrolled] = useState(false);

  // Hero pages have full-bleed top imagery that the header overlays transparently.
  // After Task 8/9/10 lands, this list expands to /rituals/[world], /product/[id], /story.
  const isHero = pathname === "/" || pathname.startsWith("/rituals") || pathname.startsWith("/story");

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
        <Link
          href="/"
          className={cn("font-serif text-[20px] tracking-[0.02em]", isDark ? "text-white" : "text-bb-primary")}
        >
          Barbaria
        </Link>

        <nav className="hidden lg:flex items-center gap-10 font-sans text-[13px] tracking-[0.04em] uppercase">
          {(["hammam", "botanical", "heritage"] as const).map((world) => (
            <Link
              key={world}
              href={`/rituals/${world}`}
              className={cn("transition-opacity hover:opacity-70", textColor)}
            >
              {t(world)}
            </Link>
          ))}
          <Link href="/story" className={cn(textColor)}>{t("story")}</Link>
          <Link href="/journal" className={cn(textColor)}>{t("journal")}</Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={pathname}
            locale={otherLocale}
            className={cn("p-2 font-sans text-[12px] uppercase tracking-[0.18em]", textColor)}
            aria-label={`Switch to ${otherLocale === "fr" ? "Français" : "English"}`}
          >
            {otherLocale.toUpperCase()}
          </Link>
          <button
            onClick={onOpenInquiry}
            className={cn("p-2 flex items-center gap-2 font-sans text-[12px] uppercase tracking-[0.18em]", textColor)}
            aria-label={t("inquiry_aria", { count: totalItems })}
          >
            {t("inquiry")} ({totalItems})
          </button>
          <button
            onClick={onOpenMenu}
            className={cn("p-3", textColor)}
            aria-label={t("menu")}
          >
            <Icon name="menu" size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
