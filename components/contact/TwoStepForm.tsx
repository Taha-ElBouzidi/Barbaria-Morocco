"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useInquiry } from "@/lib/inquiry-context";
import { useProductCatalogue } from "@/lib/data/ProductCatalogueContext";
import { buildMailto, type MailtoLine, type InquiryFormData } from "@/lib/inquiry-mailto";
import type { OccasionOption } from "@/lib/data/occasions";
import Icon from "@/components/primitives/Icon";
import DisplayHeading from "@/components/primitives/DisplayHeading";

interface Props {
  locale: string;
  /** Sprint 2.7: occasions are admin-configurable. Server fetches them and
   *  passes resolved name + slug for the dropdown. */
  occasions: OccasionOption[];
}

// Inputs get a soft cream background + clear bottom border so they read as
// distinct fields when scrolling fast on mobile. Stays minimal on desktop.
const INPUT_CLASS =
  "w-full bg-bb-bg-low/60 border-0 border-b-2 border-bb-line py-3.5 px-4 font-sans text-[15px] text-bb-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary focus-visible:ring-offset-1 focus:border-bb-primary focus:bg-bb-bg-low placeholder:text-bb-on-surface-variant/50 transition-colors min-h-[48px]";

const LABEL_CLASS =
  "block font-sans text-[12px] uppercase tracking-[0.18em] text-bb-primary mb-2 font-medium";

const ERROR_CLASS = "text-[12px] text-bb-tertiary mt-1";

type FormData = Omit<InquiryFormData, "locale">;

const INITIAL: FormData = {
  company: "",
  contactName: "",
  email: "",
  phone: "",
  eventDate: "",
  occasion: "",
  message: "",
};

/**
 * Sprint 2.6 , Two-step inquiry form. Quantity moved to each box-line in
 * the inquiry sidebar (per-box stepper, MOQ-aware), so the form no longer
 * has a quantity field. The mailto body lists each box and its qty + MOQ;
 * custom boxes also list their composition by resolved piece names.
 */
export default function TwoStepForm({ locale, occasions }: Props) {
  const t = useTranslations("contact");
  const currentLocale = useLocale();
  const { lines } = useInquiry();
  const catalogue = useProductCatalogue();

  const [step, setStep] = useState<1 | 2>(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const successRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (submitted) {
      successRef.current?.focus();
    }
  }, [submitted]);

  const update = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateStep1 = (): boolean => {
    const next: Partial<Record<keyof FormData, string>> = {};
    if (!form.company.trim()) next.company = "Required";
    if (!form.contactName.trim()) next.contactName = "Required";
    if (!form.email.trim()) next.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Invalid email";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateStep2 = (): boolean => {
    const next: Partial<Record<keyof FormData, string>> = {};
    if (!form.occasion) next.occasion = "Required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) setStep(2);
  };

  const mailtoLines: MailtoLine[] = useMemo(
    () =>
      lines.map((line) => {
        const isCustom = !!line.custom;
        const compositionNames = isCustom
          ? line.custom!.productSlugs.map((slug) => catalogue.get(slug)?.name ?? slug)
          : undefined;
        return {
          name: line.nameSnapshot ?? line.giftBoxSlug,
          qty: line.qty,
          minQty: line.minQty,
          isCustom,
          compositionNames,
        };
      }),
    [lines, catalogue]
  );

  // For the mailto body we want the readable occasion name, not the slug.
  const occasionName = useMemo(
    () => occasions.find((o) => o.slug === form.occasion)?.name ?? form.occasion,
    [occasions, form.occasion]
  );

  const mailtoUrl = useMemo(
    () => buildMailto({ ...form, occasion: occasionName, locale: currentLocale || locale }, mailtoLines),
    [form, occasionName, currentLocale, locale, mailtoLines]
  );

  const { clear: clearInquiry } = useInquiry();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return;
    if (!validateStep2() || !validateStep1()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload = {
        company: form.company,
        contactName: form.contactName,
        email: form.email,
        phone: form.phone || null,
        occasion: occasionName || null,
        eventDate: form.eventDate || null,
        message: form.message || null,
        locale: currentLocale || locale,
        honeypot,
        lines: lines.map((line) => ({
          giftBoxSlug: line.giftBoxSlug,
          qty: line.qty,
          minQty: line.minQty,
          isCustom: !!line.custom,
          nameSnapshot: line.nameSnapshot,
          composition: line.custom ?? null,
        })),
      };
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setSubmitError(json.error ?? "Could not send your request. Please try again.");
        setSubmitting(false);
        return;
      }
      clearInquiry();
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Network error");
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-8 text-center">
        <span className="text-bb-secondary">
          <Icon name="check" size={64} strokeWidth={1.2} />
        </span>
        <h2
          ref={successRef}
          tabIndex={-1}
          className="font-serif font-normal text-bb-on-surface text-[clamp(32px,4vw,72px)] leading-[1.05] tracking-[-0.015em] outline-none"
        >
          {t("success_title")}
        </h2>
        <p className="font-sans text-[16px] text-bb-on-surface-variant max-w-[380px]">
          {t("success_body")}
        </p>
        <Link
          href="/"
          className="mt-4 font-sans text-[12px] uppercase tracking-[0.18em] text-bb-secondary hover:text-bb-primary transition-colors"
        >
          ← Back to home
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-12">
      <input
        name="company_website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        style={{ position: "absolute", left: "-9999px", height: 0, width: 0 }}
      />

      {step === 1 && (
        <div className="space-y-10">
          <div className="flex items-baseline gap-6">
            <span className="font-serif text-[48px] leading-none text-bb-primary">{t("step1_number")}</span>
            <DisplayHeading size="md" as="h2">{t("step1_title")}</DisplayHeading>
          </div>

          <div className="space-y-8">
            <div>
              <label htmlFor="field-company" className={LABEL_CLASS}>{t("f_company")}</label>
              <input
                id="field-company"
                type="text"
                value={form.company}
                onChange={(e) => update("company", e.target.value)}
                placeholder={t("f_company")}
                className={cn(INPUT_CLASS, errors.company && "border-bb-tertiary")}
                autoComplete="organization"
                aria-required="true"
                aria-invalid={!!errors.company}
                aria-describedby={errors.company ? "err-company" : undefined}
              />
              {errors.company && <p id="err-company" className={ERROR_CLASS}>{errors.company}</p>}
            </div>

            <div>
              <label htmlFor="field-contact-name" className={LABEL_CLASS}>{t("f_contact_name")}</label>
              <input
                id="field-contact-name"
                type="text"
                value={form.contactName}
                onChange={(e) => update("contactName", e.target.value)}
                placeholder={t("f_contact_name")}
                className={cn(INPUT_CLASS, errors.contactName && "border-bb-tertiary")}
                autoComplete="name"
                aria-required="true"
                aria-invalid={!!errors.contactName}
                aria-describedby={errors.contactName ? "err-contact-name" : undefined}
              />
              {errors.contactName && <p id="err-contact-name" className={ERROR_CLASS}>{errors.contactName}</p>}
            </div>

            <div>
              <label htmlFor="field-email" className={LABEL_CLASS}>{t("f_email")}</label>
              <input
                id="field-email"
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder={t("f_email")}
                className={cn(INPUT_CLASS, errors.email && "border-bb-tertiary")}
                autoComplete="email"
                aria-required="true"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "err-email" : undefined}
              />
              {errors.email && <p id="err-email" className={ERROR_CLASS}>{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="field-phone" className={LABEL_CLASS}>{t("f_phone")}</label>
              <input
                id="field-phone"
                type="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder={t("f_phone")}
                className={cn(INPUT_CLASS)}
                autoComplete="tel"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={handleNext}
              className="font-sans text-[12px] uppercase tracking-[0.18em] text-bb-on-surface hover:text-bb-secondary transition-colors flex items-center gap-2"
            >
              {t("next")} <Icon name="arrow-right" size={16} />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-10">
          <div className="flex items-baseline gap-6">
            <span className="font-serif text-[48px] leading-none text-bb-primary">{t("step2_number")}</span>
            <DisplayHeading size="md" as="h2">{t("step2_title")}</DisplayHeading>
          </div>

          <div className="space-y-8">
            <div>
              <label htmlFor="field-event-date" className={LABEL_CLASS}>{t("f_event_date")}</label>
              <input
                id="field-event-date"
                type="date"
                value={form.eventDate}
                onChange={(e) => update("eventDate", e.target.value)}
                className={cn(INPUT_CLASS)}
              />
            </div>

            <div>
              <label htmlFor="field-occasion" className={LABEL_CLASS}>{t("f_occasion")}</label>
              <select
                id="field-occasion"
                value={form.occasion}
                onChange={(e) => update("occasion", e.target.value)}
                className={cn(INPUT_CLASS, "cursor-pointer", errors.occasion && "border-bb-tertiary")}
                aria-required="true"
                aria-invalid={!!errors.occasion}
                aria-describedby={errors.occasion ? "err-occasion" : undefined}
              >
                <option value="">{t("f_occasion")}</option>
                {occasions.map((o) => (
                  <option key={o.slug} value={o.slug}>{o.name}</option>
                ))}
              </select>
              {errors.occasion && <p id="err-occasion" className={ERROR_CLASS}>{errors.occasion}</p>}
            </div>

            <div>
              <label htmlFor="field-message" className={LABEL_CLASS}>{t("f_message")}</label>
              <textarea
                id="field-message"
                value={form.message}
                onChange={(e) => update("message", e.target.value)}
                placeholder={t("f_message")}
                rows={5}
                className={cn(
                  INPUT_CLASS,
                  "resize-none border border-bb-line border-t-0 border-x-0 py-3"
                )}
              />
            </div>
          </div>

          {submitError && (
            <p
              role="alert"
              className="font-sans text-[13px] text-bb-tertiary border border-bb-tertiary/30 bg-bb-tertiary/5 px-4 py-3"
            >
              {submitError}{" "}
              <a href={mailtoUrl} className="underline">
                Send by email instead
              </a>
            </p>
          )}
          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="font-sans text-[12px] uppercase tracking-[0.18em] text-bb-on-surface-variant hover:text-bb-on-surface transition-colors"
            >
              ← {t("back")}
            </button>

            <button
              type="submit"
              disabled={submitting || submitted || lines.length === 0}
              className={cn(
                "font-sans text-[12px] uppercase tracking-[0.18em] bg-bb-primary text-bb-on-primary px-8 py-3.5 hover:bg-bb-secondary transition-colors flex items-center gap-2",
                (submitting || submitted || lines.length === 0) && "opacity-50 cursor-not-allowed"
              )}
            >
              {submitting ? "Sending…" : t("submit")} <Icon name="arrow-up-right" size={14} />
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
