"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import Eyebrow from "@/components/primitives/Eyebrow";
import { cn } from "@/lib/utils";

export default function Footer() {
  const t = useTranslations("footer");
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <footer className="border-t border-bb-line bg-bb-bg">
      <div
        className="mx-auto max-w-[1440px] px-[var(--bb-margin-edge)]"
        style={{ paddingTop: "96px", paddingBottom: "48px" }}
      >
        {/* Three-column grid */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3 lg:gap-16">
          {/* Column 1 — Maison */}
          <div className="flex flex-col gap-6">
            <Eyebrow tone="gold">{t("maison")}</Eyebrow>
            <nav className="flex flex-col gap-4">
              <Link
                href="/story"
                className="font-sans text-[14px] tracking-[0.04em] text-bb-on-surface transition-opacity hover:opacity-70"
              >
                {t("story")}
              </Link>
              <Link
                href="/ateliers"
                className="font-sans text-[14px] tracking-[0.04em] text-bb-on-surface transition-opacity hover:opacity-70"
              >
                {t("ateliers")}
              </Link>
              <Link
                href="/journal"
                className="font-sans text-[14px] tracking-[0.04em] text-bb-on-surface transition-opacity hover:opacity-70"
              >
                {t("journal")}
              </Link>
            </nav>
          </div>

          {/* Column 2 — Catalogue */}
          <div className="flex flex-col gap-6">
            <Eyebrow tone="gold">{t("catalogue")}</Eyebrow>
            <nav className="flex flex-col gap-4">
              <Link
                href="/rituals/hammam"
                className="font-sans text-[14px] tracking-[0.04em] text-bb-on-surface transition-opacity hover:opacity-70"
              >
                {t("hammam")}
              </Link>
              <Link
                href="/rituals/botanical"
                className="font-sans text-[14px] tracking-[0.04em] text-bb-on-surface transition-opacity hover:opacity-70"
              >
                {t("botanical")}
              </Link>
              <Link
                href="/rituals/heritage"
                className="font-sans text-[14px] tracking-[0.04em] text-bb-on-surface transition-opacity hover:opacity-70"
              >
                {t("heritage")}
              </Link>
            </nav>
          </div>

          {/* Column 3 — Concierge */}
          <div className="flex flex-col gap-6">
            <Eyebrow tone="gold">{t("concierge")}</Eyebrow>
            <nav className="flex flex-col gap-4">
              <Link
                href="/contact"
                className="font-sans text-[14px] tracking-[0.04em] text-bb-on-surface transition-opacity hover:opacity-70"
              >
                {t("contact")}
              </Link>
              <a
                href="mailto:concierge@barbariamorocco.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-sans text-[14px] tracking-[0.04em] text-bb-on-surface transition-opacity hover:opacity-70"
              >
                {t("email")}
              </a>
              <a
                href="https://wa.me/212659658863"
                target="_blank"
                rel="noopener noreferrer"
                className="font-sans text-[14px] tracking-[0.04em] text-bb-on-surface transition-opacity hover:opacity-70"
              >
                {t("whatsapp")}
              </a>
              <a
                href="https://instagram.com/barbaria_00"
                target="_blank"
                rel="noopener noreferrer"
                className="font-sans text-[14px] tracking-[0.04em] text-bb-on-surface transition-opacity hover:opacity-70"
              >
                {t("instagram")}
              </a>
              <address className="not-italic font-serif text-[13px] italic text-bb-on-surface-variant">
                {t("address")}
              </address>
            </nav>
          </div>
        </div>

        {/* Legal row */}
        <div className="mt-16 border-t border-bb-line pt-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Eyebrow tone="muted">{t("rights")}</Eyebrow>

            {/* Lang toggle — active locale marked for sighted and AT users */}
            <div className="flex items-center gap-3 font-sans text-[12px] uppercase tracking-[0.18em]">
              {(["en", "fr"] as const).map((l) => {
                const isActive = l === locale;
                return (
                  <Link
                    key={l}
                    href={pathname}
                    locale={l}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "transition-colors",
                      isActive
                        ? "text-bb-primary font-medium"
                        : "text-bb-on-surface-variant hover:text-bb-primary"
                    )}
                  >
                    {l.toUpperCase()}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
