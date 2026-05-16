"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface LocaleFields {
  name: string;
  short: string;
  lede: string;
}

interface TranslationTabsProps {
  en: LocaleFields;
  fr: LocaleFields;
  onChange: (locale: "en" | "fr", field: keyof LocaleFields, value: string) => void;
}

export default function TranslationTabs({ en, fr, onChange }: TranslationTabsProps) {
  const [active, setActive] = useState<"en" | "fr">("en");
  const values = active === "en" ? en : fr;

  return (
    <div className="space-y-4">
      <div
        role="tablist"
        aria-label="Translation locale"
        className="flex border-b border-bb-line gap-0"
      >
        {(["en", "fr"] as const).map((locale) => (
          <button
            key={locale}
            id={`tab-${locale}`}
            type="button"
            role="tab"
            aria-selected={active === locale}
            aria-controls={`panel-${locale}`}
            tabIndex={active === locale ? 0 : -1}
            onClick={() => setActive(locale)}
            className={cn(
              "px-6 py-3 font-sans text-[12px] uppercase tracking-[0.18em] border-b-2 -mb-px transition-colors",
              active === locale
                ? "border-bb-primary text-bb-primary"
                : "border-transparent text-bb-on-surface-variant hover:text-bb-on-surface"
            )}
          >
            {locale === "en" ? "English" : "Français"}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`panel-${active}`}
        aria-labelledby={`tab-${active}`}
        className="space-y-4"
      >
        <label className="block">
          <span className="block font-sans text-[11px] uppercase tracking-[0.18em] text-bb-on-surface-variant mb-2">
            Name *
          </span>
          <input
            type="text"
            name={`${active}_name`}
            value={values.name}
            onChange={(e) => onChange(active, "name", e.target.value)}
            required={active === "en"}
            className="w-full bg-transparent border-0 border-b border-bb-line py-2 text-bb-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary focus-visible:ring-offset-1 focus:border-bb-primary"
          />
        </label>

        <label className="block">
          <span className="block font-sans text-[11px] uppercase tracking-[0.18em] text-bb-on-surface-variant mb-2">
            Short description *
          </span>
          <input
            type="text"
            name={`${active}_short`}
            value={values.short}
            onChange={(e) => onChange(active, "short", e.target.value)}
            required={active === "en"}
            className="w-full bg-transparent border-0 border-b border-bb-line py-2 text-bb-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary focus-visible:ring-offset-1 focus:border-bb-primary"
          />
        </label>

        <label className="block">
          <span className="block font-sans text-[11px] uppercase tracking-[0.18em] text-bb-on-surface-variant mb-2">
            Lede (optional)
          </span>
          <textarea
            name={`${active}_lede`}
            value={values.lede}
            onChange={(e) => onChange(active, "lede", e.target.value)}
            rows={3}
            className="w-full bg-transparent border border-bb-line p-3 text-bb-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary focus-visible:ring-offset-1 focus:border-bb-primary resize-y"
          />
        </label>
      </div>

      {/* Hidden inputs for the non-active locale so form submission captures both */}
      {active === "en" ? (
        <>
          <input type="hidden" name="fr_name" value={fr.name} />
          <input type="hidden" name="fr_short" value={fr.short} />
          <input type="hidden" name="fr_lede" value={fr.lede} />
        </>
      ) : (
        <>
          <input type="hidden" name="en_name" value={en.name} />
          <input type="hidden" name="en_short" value={en.short} />
          <input type="hidden" name="en_lede" value={en.lede} />
        </>
      )}
    </div>
  );
}
