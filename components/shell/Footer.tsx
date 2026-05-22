"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import Eyebrow from "@/components/primitives/Eyebrow";
import Wordmark from "@/components/primitives/Wordmark";
import { cn } from "@/lib/utils";
import Icon from "@/components/primitives/Icon";
import type { SiteSettings } from "@/lib/data/site-settings";
import { useConsent } from "@/components/cookies/ConsentContext";

interface FooterProps {
  socials: SiteSettings;
}

export default function Footer({ socials }: FooterProps) {
  const t = useTranslations("footer");
  const tCookies = useTranslations("cookies");
  const locale = useLocale();
  const pathname = usePathname();
  const { openBanner } = useConsent();
  const SOCIAL_LINKS = [
    { label: "Instagram", icon: "instagram" as const, href: socials.instagramUrl },
    { label: "LinkedIn", icon: "linkedin" as const, href: socials.linkedinUrl },
    { label: "X", icon: "x-twitter" as const, href: socials.xUrl },
  ].filter((s) => s.href);

  return (
    <footer className="border-t border-bb-line bg-bb-bg">
      <div
        className="mx-auto max-w-[1440px] px-[var(--bb-margin-edge)]"
        style={{ paddingTop: "96px", paddingBottom: "48px" }}
      >
        {/* Brand wordmark, centered above the column grid */}
        <Link href="/" aria-label="Barbaria Morocco, home" className="block transition-opacity hover:opacity-80">
          <Wordmark variant="stacked" tone="dark" className="mx-auto mb-16 lg:mb-20" />
        </Link>

        {/* Three-column grid */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3 lg:gap-16">
          {/* Column 1, Maison */}
          <div className="flex flex-col gap-6">
            <Eyebrow tone="green">{t("maison")}</Eyebrow>
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

          {/* Column 2, Catalogue */}
          <div className="flex flex-col gap-6">
            <Eyebrow tone="green">{t("catalogue")}</Eyebrow>
            <nav className="flex flex-col gap-4">
              <Link
                href="/products/cosmetiques"
                className="font-sans text-[14px] tracking-[0.04em] text-bb-on-surface transition-opacity hover:opacity-70 inline-flex min-h-[44px] items-center"
              >
                {t("cosmetiques")}
              </Link>
              <Link
                href="/products/epicerie_fine"
                className="font-sans text-[14px] tracking-[0.04em] text-bb-on-surface transition-opacity hover:opacity-70 inline-flex min-h-[44px] items-center"
              >
                {t("epicerie_fine")}
              </Link>
            </nav>
          </div>

          {/* Column 3, Concierge */}
          <div className="flex flex-col gap-6">
            <Eyebrow tone="green">{t("concierge")}</Eyebrow>
            <nav className="flex flex-col gap-4">
              <Link
                href="/contact"
                className="font-sans text-[14px] tracking-[0.04em] text-bb-on-surface transition-opacity hover:opacity-70"
              >
                {t("contact")}
              </Link>
              <Link
                href="/faq"
                className="font-sans text-[14px] tracking-[0.04em] text-bb-on-surface transition-opacity hover:opacity-70"
              >
                {t("faq")}
              </Link>
              <a
                href={`mailto:${socials.contactEmail}`}
                className="font-sans text-[14px] tracking-[0.04em] text-bb-on-surface transition-opacity hover:opacity-70"
              >
                {socials.contactEmail}
              </a>
              {socials.contactPhone &&
                socials.contactPhone
                  .split(/\s*\/\s*/)
                  .filter(Boolean)
                  .map((number) => (
                    <a
                      key={number}
                      href={`tel:${number.replace(/[^+\d]/g, "")}`}
                      className="font-sans text-[14px] tracking-[0.04em] text-bb-on-surface transition-opacity hover:opacity-70"
                    >
                      {number}
                    </a>
                  ))}
              {socials.whatsappUrl && (
                <a
                  href={socials.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-sans text-[14px] tracking-[0.04em] text-bb-on-surface transition-opacity hover:opacity-70"
                >
                  {t("whatsapp")}
                </a>
              )}
              {socials.instagramUrl && (
                <a
                  href={socials.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-sans text-[14px] tracking-[0.04em] text-bb-on-surface transition-opacity hover:opacity-70"
                >
                  {t("instagram")}
                </a>
              )}
            </nav>
            <address className="mt-4 font-serif text-[13px] italic text-bb-on-surface-variant">
              {t("address")}
            </address>
          </div>
        </div>

        {/* Social row, full width. Placeholders for now. */}
        <div className="mt-12 lg:mt-16 flex flex-col items-center gap-4 border-t border-bb-line pt-10">
          <Eyebrow tone="green">{t("follow")}</Eyebrow>
          <ul className="flex items-center gap-3">
            {SOCIAL_LINKS.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-bb-line text-bb-on-surface hover:border-bb-primary hover:text-bb-primary transition-colors"
                >
                  <Icon name={s.icon} size={18} />
                </a>
              </li>
            ))}
            {socials.whatsappUrl && (
              <li>
                <a
                  href={socials.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-bb-line text-bb-on-surface hover:border-bb-primary hover:text-bb-primary transition-colors"
                >
                  <Icon name="whatsapp" size={18} />
                </a>
              </li>
            )}
          </ul>
        </div>

        {/* Legal row, full width above the copyright bar */}
        <nav
          aria-label={t("legal_aria")}
          className="mt-10 border-t border-bb-line pt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
        >
          <Link
            href="/legal/legal-notice"
            className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-on-surface-variant hover:text-bb-primary transition-colors"
          >
            {t("legal_notice")}
          </Link>
          <span aria-hidden="true" className="text-bb-line">·</span>
          <Link
            href="/legal/privacy"
            className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-on-surface-variant hover:text-bb-primary transition-colors"
          >
            {t("privacy")}
          </Link>
          <span aria-hidden="true" className="text-bb-line">·</span>
          <Link
            href="/legal/terms"
            className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-on-surface-variant hover:text-bb-primary transition-colors"
          >
            {t("terms")}
          </Link>
          <span aria-hidden="true" className="text-bb-line">·</span>
          <Link
            href="/legal/cookies"
            className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-on-surface-variant hover:text-bb-primary transition-colors"
          >
            {t("cookies")}
          </Link>
          <span aria-hidden="true" className="text-bb-line">·</span>
          <button
            type="button"
            onClick={openBanner}
            className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-on-surface-variant hover:text-bb-primary transition-colors"
          >
            {tCookies("manage_link")}
          </button>
        </nav>

        <div className="mt-8 border-t border-bb-line pt-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Eyebrow tone="muted">{t("rights")}</Eyebrow>

            {/* Lang toggle, active locale marked for sighted and AT users */}
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
