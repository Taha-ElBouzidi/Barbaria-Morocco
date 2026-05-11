"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useInquiry } from "@/lib/inquiry-context";
import { getProduct } from "@/lib/products";
import { buildMailto, type MailtoItem, type InquiryFormData } from "@/lib/inquiry-mailto";
import Icon from "@/components/primitives/Icon";
import DisplayHeading from "@/components/primitives/DisplayHeading";

interface Props {
  locale: string;
}

const INPUT_CLASS =
  "w-full bg-transparent border-0 border-b border-bb-line py-3 font-sans text-bb-on-surface focus:outline-none focus:border-bb-primary placeholder:text-bb-on-surface-variant/60";

const LABEL_CLASS =
  "block font-sans text-[11px] uppercase tracking-[0.18em] text-bb-on-surface-variant mb-2";

const ERROR_CLASS = "text-[12px] text-bb-tertiary mt-1";

type FormData = Omit<InquiryFormData, "locale">;

const INITIAL: FormData = {
  company: "",
  contactName: "",
  email: "",
  phone: "",
  quantity: "",
  eventDate: "",
  occasion: "",
  message: "",
};

export default function TwoStepForm({ locale }: Props) {
  const t = useTranslations("contact");
  const currentLocale = useLocale();
  const { cart } = useInquiry();

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
    if (!form.quantity.trim()) next.quantity = "Required";
    if (!form.occasion) next.occasion = "Required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) setStep(2);
  };

  const inquiryItems: MailtoItem[] = useMemo(
    () =>
      [...cart.entries()]
        .map(([id, qty]) => ({ product: getProduct(id), qty }))
        .filter((x): x is MailtoItem => Boolean(x.product)),
    [cart]
  );

  const mailtoUrl = useMemo(
    () => buildMailto({ ...form, locale: currentLocale || locale }, inquiryItems),
    [form, currentLocale, locale, inquiryItems]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return;
    if (!validateStep2() || !validateStep1()) return;
    setSubmitting(true);
    window.location.href = mailtoUrl;
    setTimeout(() => setSubmitted(true), 80);
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
      {/* Honeypot — invisible to humans, catches bots */}
      <input
        name="company_website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        style={{ position: "absolute", left: "-9999px", height: 0, width: 0 }}
      />

      {/* ── Step 01 ─────────────────────────────────────── */}
      {step === 1 && (
        <div className="space-y-10">
          <div className="flex items-baseline gap-6">
            <span className="font-serif text-[48px] leading-none text-bb-secondary">{t("step1_number")}</span>
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

      {/* ── Step 02 ─────────────────────────────────────── */}
      {step === 2 && (
        <div className="space-y-10">
          <div className="flex items-baseline gap-6">
            <span className="font-serif text-[48px] leading-none text-bb-secondary">{t("step2_number")}</span>
            <DisplayHeading size="md" as="h2">{t("step2_title")}</DisplayHeading>
          </div>

          <div className="space-y-8">
            <div>
              <label htmlFor="field-quantity" className={LABEL_CLASS}>{t("f_quantity")}</label>
              <input
                id="field-quantity"
                type="number"
                min={1}
                value={form.quantity}
                onChange={(e) => update("quantity", e.target.value)}
                placeholder={t("f_quantity")}
                className={cn(INPUT_CLASS, errors.quantity && "border-bb-tertiary")}
                aria-required="true"
                aria-invalid={!!errors.quantity}
                aria-describedby={errors.quantity ? "err-quantity" : undefined}
              />
              {errors.quantity && <p id="err-quantity" className={ERROR_CLASS}>{errors.quantity}</p>}
            </div>

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
                <option value="yearend">{t("f_occasion_yearend")}</option>
                <option value="onboarding">{t("f_occasion_onboarding")}</option>
                <option value="anniversary">{t("f_occasion_anniversary")}</option>
                <option value="press">{t("f_occasion_press")}</option>
                <option value="wedding">{t("f_occasion_wedding")}</option>
                <option value="other">{t("f_occasion_other")}</option>
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
              disabled={submitting || submitted}
              data-mailto={mailtoUrl}
              className={cn(
                "font-sans text-[12px] uppercase tracking-[0.18em] bg-bb-primary text-bb-on-primary px-8 py-3.5 hover:bg-bb-secondary transition-colors flex items-center gap-2",
                (submitting || submitted) && "opacity-50 cursor-not-allowed"
              )}
            >
              {t("submit")} <Icon name="arrow-up-right" size={14} />
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
