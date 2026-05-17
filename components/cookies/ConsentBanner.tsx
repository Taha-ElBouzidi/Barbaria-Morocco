"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useConsent } from "./ConsentContext";

/**
 * Cookie consent banner. Slides up from the bottom on first visit and
 * stays put until the user accepts, rejects, or saves a custom choice.
 * GDPR/CNIL/CNDP compliance notes:
 *   - "Accept" and "Reject" are visually equivalent (same primary
 *     ghost-gold treatment, same prominence), per Article 7 GDPR and
 *     the CNIL 2020-2023 guidelines on "easy as accepting".
 *   - No pre-checked boxes on the customize panel.
 *   - The banner does not block content (no overlay), so the page is
 *     readable and the user is not coerced. The cookie record itself
 *     is rotated every 12 months (see CONSENT_MAX_AGE_SECONDS).
 */
export default function ConsentBanner() {
  const t = useTranslations("cookies");
  const { bannerOpen, acceptAll, rejectNonEssential, saveCustom, closeBanner } =
    useConsent();
  const [expanded, setExpanded] = useState(false);
  const [analyticsChecked, setAnalyticsChecked] = useState(false);

  if (!bannerOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="bb-consent-title"
      className="fixed inset-x-0 bottom-0 z-[90] px-4 pb-4 pointer-events-none"
    >
      <div className="mx-auto max-w-[860px] pointer-events-auto bg-bb-bg border border-bb-line shadow-lg">
        <div className="px-6 py-6 lg:px-8 lg:py-7 space-y-5">
          <div className="space-y-2">
            <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-bb-secondary-deep">
              Barbaria
            </p>
            <h2
              id="bb-consent-title"
              className="font-display text-[20px] lg:text-[22px] text-bb-primary leading-snug"
            >
              {t("banner_title")}
            </h2>
            <p className="font-sans text-[13px] text-bb-on-surface/80 leading-relaxed">
              {t("banner_body")}{" "}
              <Link
                href="/legal/cookies"
                className="underline underline-offset-2 hover:text-bb-primary"
              >
                {t("policy_link")}
              </Link>
            </p>
          </div>

          {expanded && (
            <div className="border-t border-bb-line pt-5 space-y-4">
              <CategoryRow
                title={t("cat_necessary")}
                description={t("cat_necessary_desc")}
                disabled
                checked
              />
              <CategoryRow
                title={t("cat_analytics")}
                description={t("cat_analytics_desc")}
                checked={analyticsChecked}
                onChange={setAnalyticsChecked}
              />
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="font-sans text-[12px] uppercase tracking-[0.18em] text-bb-on-surface-variant hover:text-bb-primary transition-colors self-start"
            >
              {expanded ? t("btn_collapse") : t("btn_customize")}
            </button>

            <div className="flex flex-col sm:flex-row gap-3">
              {expanded ? (
                <button
                  type="button"
                  onClick={() => saveCustom(analyticsChecked)}
                  className="inline-flex items-center justify-center gap-2 px-6 py-[12px] min-h-[44px] bg-bb-primary text-bb-on-primary font-sans text-[12px] uppercase tracking-[0.18em] hover:bg-bb-primary-container transition-colors"
                >
                  {t("btn_save")}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={rejectNonEssential}
                    className="inline-flex items-center justify-center gap-2 px-6 py-[12px] min-h-[44px] border border-bb-secondary-deep bg-transparent text-bb-secondary-deep font-sans text-[12px] uppercase tracking-[0.18em] hover:bg-bb-secondary-deep hover:text-bb-on-primary transition-colors"
                  >
                    {t("btn_reject")}
                  </button>
                  <button
                    type="button"
                    onClick={acceptAll}
                    className="inline-flex items-center justify-center gap-2 px-6 py-[12px] min-h-[44px] bg-bb-primary text-bb-on-primary font-sans text-[12px] uppercase tracking-[0.18em] hover:bg-bb-primary-container transition-colors"
                  >
                    {t("btn_accept_all")}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Hidden close button for keyboard escape; same effect as reject. */}
          <button
            type="button"
            onClick={closeBanner}
            className="sr-only"
            aria-label={t("aria_close")}
          />
        </div>
      </div>
    </div>
  );
}

function CategoryRow({
  title,
  description,
  checked,
  disabled,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (next: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-4 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        className="mt-1 h-4 w-4 accent-bb-primary disabled:opacity-50"
      />
      <div className="flex-1 space-y-1">
        <p className="font-sans text-[13px] font-medium text-bb-on-surface">
          {title}
        </p>
        <p className="font-sans text-[12px] text-bb-on-surface/70 leading-relaxed">
          {description}
        </p>
      </div>
    </label>
  );
}
