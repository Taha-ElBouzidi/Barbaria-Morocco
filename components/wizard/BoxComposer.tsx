"use client";

import { useReducer, useEffect, useState, useCallback } from "react";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import Photo from "@/components/primitives/Photo";
import Eyebrow from "@/components/primitives/Eyebrow";
import DisplayHeading from "@/components/primitives/DisplayHeading";
import Reveal from "@/components/primitives/Reveal";
import SaharaPrestige from "@/components/primitives/SaharaPrestige";
import Icon from "@/components/primitives/Icon";
import { useInquiry } from "@/lib/inquiry-context";
import {
  stepsForSize,
  BOX_SIZES,
  type BoxSize,
  type WizardStep,
} from "@/lib/wizard-content";
import type {
  GiftBoxDetail,
  ProductSummary,
  StoryThemeKey,
} from "@/lib/data/types";

type LocaleCode = "en" | "fr";

interface Props {
  box: GiftBoxDetail;
  products: ProductSummary[];
  themeKey: StoryThemeKey;
  locale: LocaleCode;
  copy: WizardCopy;
}

/** All localised UI strings, passed from the server component which uses
 *  next-intl. Keeping a single bundle avoids hydration issues from
 *  per-render translation lookups in the wizard. */
export interface WizardCopy {
  intro_eyebrow: string;
  intro_begin: string;
  size_eyebrow: string;
  size_title: string;
  size_lede: string;
  size_3_label: string;
  size_3_desc: string;
  size_5_label: string;
  size_5_desc: string;
  size_6_label: string;
  size_6_desc: string;
  step_eyebrow_progress: string; // "Step {n} of {total}"
  step_no_products: string;
  step_skip: string;
  step_back: string;
  step_next: string;
  step_picked: string;
  review_eyebrow: string;
  review_title: string;
  review_lede: string;
  review_slot_empty: string;
  review_continue: string;
  review_edit: string;
  quantity_eyebrow: string;
  quantity_title: string;
  quantity_lede: string;
  quantity_min_label: string;
  quantity_below_min_note: string;
  quantity_submit: string;
  done_eyebrow: string;
  done_title: string;
  done_lede: string;
  done_cta: string;
}

type View = "intro" | "size" | "step" | "review" | "quantity" | "done";

interface State {
  view: View;
  currentStep: number;
  size: BoxSize | null;
  /** Map step-index → product slug ("" means skipped) */
  picks: Record<number, string>;
  quantity: number;
}

const INITIAL: State = {
  view: "intro",
  currentStep: 0,
  size: null,
  picks: {},
  quantity: 5,
};

type Action =
  | { type: "begin" }
  | { type: "pickSize"; size: BoxSize }
  | { type: "pick"; productSlug: string }
  | { type: "skip" }
  | { type: "back" }
  | { type: "goReview" }
  | { type: "goQuantity" }
  | { type: "setQty"; qty: number }
  | { type: "done" }
  | { type: "reset" }
  | { type: "hydrate"; state: State };

function reducer(state: State, action: Action): State {
  // Step count always equals box size by construction (see stepsForSize).
  const stepCount = state.size ?? 0;
  switch (action.type) {
    case "begin":
      return { ...state, view: "size" };
    case "pickSize":
      return { ...state, size: action.size, view: "step", currentStep: 0 };
    case "pick": {
      const picks = { ...state.picks, [state.currentStep]: action.productSlug };
      return { ...state, picks };
    }
    case "skip": {
      const picks = { ...state.picks, [state.currentStep]: "" };
      const next = state.currentStep + 1;
      if (next >= stepCount) return { ...state, picks, view: "review" };
      return { ...state, picks, currentStep: next };
    }
    case "back": {
      if (state.view === "review") {
        return { ...state, view: "step", currentStep: Math.max(0, stepCount - 1) };
      }
      if (state.view === "quantity") return { ...state, view: "review" };
      if (state.view === "step" && state.currentStep > 0) {
        return { ...state, currentStep: state.currentStep - 1 };
      }
      if (state.view === "step") return { ...state, view: "size" };
      if (state.view === "size") return { ...state, view: "intro" };
      return state;
    }
    case "goReview":
      return { ...state, view: "review" };
    case "goQuantity":
      return { ...state, view: "quantity" };
    case "setQty":
      return { ...state, quantity: Math.max(1, action.qty) };
    case "done":
      return { ...state, view: "done" };
    case "reset":
      return INITIAL;
    case "hydrate":
      return action.state;
  }
}

export default function BoxComposer({ box, products, themeKey, locale, copy }: Props) {
  const router = useRouter();
  const { setQty } = useInquiry();
  const storageKey = `bb.wizard.${box.slug}`;

  const [state, dispatch] = useReducer(reducer, {
    ...INITIAL,
    quantity: box.defaultQuantityMin,
  });
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as State;
        dispatch({ type: "hydrate", state: parsed });
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, [storageKey]);

  // Persist on change.
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state, storageKey, hydrated]);

  // Active step set (or empty list before size is picked).
  const activeSteps: WizardStep[] = state.size
    ? stepsForSize(themeKey, state.size)
    : [];
  const totalSteps = activeSteps.length;
  const currentStepDef = state.view === "step" ? activeSteps[state.currentStep] : null;

  const filteredProducts = useCallback(
    (filter: string | null): ProductSummary[] => {
      if (filter === null) return products;
      return products.filter((p) => p.subcategorySlug === filter);
    },
    [products]
  );

  // ---------- handlers ----------
  const handleSkip = () => dispatch({ type: "skip" });
  const handleBack = () => dispatch({ type: "back" });
  const handleSize = (s: BoxSize) => dispatch({ type: "pickSize", size: s });
  const handleQty = (q: number) => dispatch({ type: "setQty", qty: q });

  const handleEditStep = (idx: number) => {
    dispatch({ type: "hydrate", state: { ...state, view: "step", currentStep: idx } });
  };

  const handleProceedToQuantity = () => dispatch({ type: "goQuantity" });

  const handleSubmit = () => {
    // Push each picked product into the inquiry context with the chosen
    // quantity, then route to /contact where the existing TwoStepForm
    // takes over.
    Object.values(state.picks)
      .filter((slug) => !!slug)
      .forEach((slug) => setQty(slug, state.quantity));
    dispatch({ type: "done" });
    // Clear the wizard's local state so re-opening starts fresh.
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
  };

  const handleGoContact = () => {
    router.push("/contact");
  };

  // ---------- render ----------
  return (
    <section className="relative min-h-[80vh] bg-bb-primary text-white overflow-hidden">
      <SaharaPrestige count={60} />
      <div className="relative z-10 mx-auto max-w-[1280px] px-[var(--bb-margin-edge)] py-16 lg:py-24">
        <ProgressDots
          total={totalSteps}
          current={state.view === "step" ? state.currentStep : -1}
          done={state.view === "review" || state.view === "quantity" || state.view === "done"}
        />

        <WizardView keyId={`${state.view}-${state.currentStep}`}>
          {state.view === "intro" && (
            <IntroView
              box={box}
              copy={copy}
              onBegin={() => dispatch({ type: "begin" })}
            />
          )}

          {state.view === "size" && (
            <SizeView copy={copy} onPick={handleSize} onBack={handleBack} />
          )}

          {state.view === "step" && currentStepDef && (
            <StepView
              step={currentStepDef}
              stepIndex={state.currentStep}
              totalSteps={totalSteps}
              locale={locale}
              products={filteredProducts(currentStepDef.filter)}
              activeSlug={state.picks[state.currentStep]}
              copy={copy}
              onPick={(slug) => {
                dispatch({ type: "pick", productSlug: slug });
              }}
              onSkip={handleSkip}
              onBack={handleBack}
              onNext={() => {
                // If user picked something, "Next" advances the step.
                const next = state.currentStep + 1;
                if (next >= totalSteps) {
                  dispatch({ type: "goReview" });
                } else {
                  // Reuse skip's index-advance but DO NOT overwrite the
                  // pick: dispatch a manual hydrate.
                  dispatch({
                    type: "hydrate",
                    state: { ...state, currentStep: next, view: "step" },
                  });
                }
              }}
            />
          )}

          {state.view === "review" && (
            <ReviewView
              steps={activeSteps}
              picks={state.picks}
              products={products}
              locale={locale}
              copy={copy}
              onEdit={handleEditStep}
              onContinue={handleProceedToQuantity}
              onBack={handleBack}
            />
          )}

          {state.view === "quantity" && (
            <QuantityView
              defaultMin={box.defaultQuantityMin}
              value={state.quantity}
              copy={copy}
              onChange={handleQty}
              onSubmit={handleSubmit}
              onBack={handleBack}
            />
          )}

          {state.view === "done" && (
            <DoneView copy={copy} onContinue={handleGoContact} />
          )}
        </WizardView>
      </div>
    </section>
  );
}

// =========================================================================
// Sub-views
// =========================================================================

function WizardView({ keyId, children }: { keyId: string; children: React.ReactNode }) {
  return (
    <div
      key={keyId}
      className="motion-safe:animate-[fadeInUp_400ms_ease-out] motion-safe:opacity-0"
      style={{ animationFillMode: "forwards" }}
    >
      {children}
    </div>
  );
}

function ProgressDots({
  total,
  current,
  done,
}: {
  total: number;
  current: number;
  done: boolean;
}) {
  if (total === 0) return null;
  return (
    <div className="flex justify-center gap-2 mb-12 lg:mb-16">
      {Array.from({ length: total }).map((_, i) => {
        const isActive = i === current;
        const isComplete = done || i < current;
        return (
          <span
            key={i}
            className={`h-[2px] w-12 transition-colors duration-300 ${
              isComplete
                ? "bg-bb-secondary"
                : isActive
                  ? "bg-bb-secondary/60"
                  : "bg-bb-secondary/15"
            }`}
            aria-hidden
          />
        );
      })}
    </div>
  );
}

function IntroView({
  box,
  copy,
  onBegin,
}: {
  box: GiftBoxDetail;
  copy: WizardCopy;
  onBegin: () => void;
}) {
  return (
    <div className="max-w-[820px] mx-auto text-center space-y-8">
      <Eyebrow tone="gold">{copy.intro_eyebrow}</Eyebrow>
      <DisplayHeading size="xl" as="h1" className="text-bb-secondary">
        {box.name}
      </DisplayHeading>
      {box.storyIntro && (
        <p className="font-display italic text-white/85 leading-relaxed text-[clamp(18px,1.8vw,24px)]">
          {box.storyIntro}
        </p>
      )}
      <div className="pt-4">
        <button type="button"
          onClick={onBegin}
          className="inline-flex items-center gap-3 px-10 py-5 border border-bb-secondary bg-bb-secondary text-bb-primary font-sans text-[13px] uppercase tracking-[0.18em] hover:bg-bb-secondary-fixed-dim transition-colors"
        >
          {copy.intro_begin}
          <Icon name="arrow-up-right" size={16} />
        </button>
      </div>
    </div>
  );
}

function SizeView({
  copy,
  onPick,
  onBack,
}: {
  copy: WizardCopy;
  onPick: (size: BoxSize) => void;
  onBack: () => void;
}) {
  const options: Array<{ size: BoxSize; label: string; desc: string }> = [
    { size: 3, label: copy.size_3_label, desc: copy.size_3_desc },
    { size: 5, label: copy.size_5_label, desc: copy.size_5_desc },
    { size: 6, label: copy.size_6_label, desc: copy.size_6_desc },
  ];

  return (
    <div className="max-w-[1040px] mx-auto space-y-10">
      <div className="text-center space-y-3">
        <Eyebrow tone="gold">{copy.size_eyebrow}</Eyebrow>
        <DisplayHeading size="lg" as="h2" className="text-bb-secondary">
          {copy.size_title}
        </DisplayHeading>
        <p className="font-display italic text-white/75 max-w-[640px] mx-auto">
          {copy.size_lede}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {options.map((opt) => (
          <button type="button"
            key={opt.size}
            onClick={() => onPick(opt.size)}
            className="group relative border border-bb-secondary/30 bg-bb-primary p-8 text-left hover:border-bb-secondary hover:bg-bb-primary-container transition-colors"
          >
            <div className="font-display text-[64px] text-bb-secondary leading-none mb-4">
              {opt.size}
            </div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-bb-secondary mb-2">
              {opt.label}
            </div>
            <p className="text-[14px] text-white/70 leading-relaxed">{opt.desc}</p>
            <span className="absolute top-6 right-6 inline-flex h-10 w-10 items-center justify-center border border-bb-secondary/40 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
              <Icon name="arrow-up-right" size={14} className="text-bb-secondary" />
            </span>
          </button>
        ))}
      </div>
      <div className="text-center">
        <button type="button"
          onClick={onBack}
          className="text-[11px] uppercase tracking-[0.18em] text-bb-secondary/70 hover:text-bb-secondary"
        >
          ← {copy.step_back}
        </button>
      </div>
    </div>
  );
}

function StepView({
  step,
  stepIndex,
  totalSteps,
  locale,
  products,
  activeSlug,
  copy,
  onPick,
  onSkip,
  onBack,
  onNext,
}: {
  step: WizardStep;
  stepIndex: number;
  totalSteps: number;
  locale: LocaleCode;
  products: ProductSummary[];
  activeSlug: string | undefined;
  copy: WizardCopy;
  onPick: (slug: string) => void;
  onSkip: () => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const lang = locale;
  const eyebrow = step.eyebrow[lang];
  const title = step.title[lang];
  const story = step.story[lang];
  const isPicked = activeSlug !== undefined && activeSlug !== "";

  return (
    <div className="space-y-12">
      <div className="max-w-[820px] mx-auto text-center space-y-4">
        <Eyebrow tone="gold">{eyebrow}</Eyebrow>
        <DisplayHeading size="lg" as="h2" className="font-display italic text-bb-secondary">
          {title}
        </DisplayHeading>
        <p className="font-display italic text-white/85 leading-relaxed text-[clamp(16px,1.5vw,20px)]">
          {story}
        </p>
        <p className="text-[11px] uppercase tracking-[0.18em] text-bb-secondary/60">
          {copy.step_eyebrow_progress
            .replace("{n}", String(stepIndex + 1))
            .replace("{total}", String(totalSteps))}
        </p>
      </div>

      {products.length === 0 ? (
        <div className="max-w-[640px] mx-auto text-center border border-bb-secondary/20 p-10">
          <p className="text-bb-secondary/80 italic font-display">{copy.step_no_products}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {products.map((p) => {
            const selected = p.slug === activeSlug;
            return (
              <button type="button"
                key={p.slug}
                onClick={() => onPick(p.slug)}
                className={`group relative text-left border bg-bb-primary transition-all ${
                  selected
                    ? "border-bb-secondary ring-2 ring-bb-secondary/40 bg-bb-primary-container"
                    : "border-bb-secondary/15 hover:border-bb-secondary/60"
                }`}
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Photo
                    src={p.heroImage}
                    alt={p.name}
                    fill
                    sizes="(min-width:1024px) 25vw, (min-width:768px) 33vw, 50vw"
                    containerClassName="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                  {selected && (
                    <div className="absolute top-3 right-3 inline-flex h-8 w-8 items-center justify-center bg-bb-secondary text-bb-primary">
                      <Icon name="check" size={14} />
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-1">
                  <p className="font-display text-[15px] leading-tight text-bb-secondary">
                    {p.name}
                  </p>
                  {p.short && (
                    <p className="text-[12px] text-white/55 line-clamp-2">{p.short}</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Footer actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
        <button type="button"
          onClick={onBack}
          className="text-[11px] uppercase tracking-[0.18em] text-bb-secondary/70 hover:text-bb-secondary"
        >
          ← {copy.step_back}
        </button>
        <div className="flex items-center gap-3">
          <button type="button"
            onClick={onSkip}
            className="text-[11px] uppercase tracking-[0.18em] text-bb-secondary/70 hover:text-bb-secondary px-4 py-3"
          >
            {copy.step_skip}
          </button>
          <button type="button"
            onClick={onNext}
            disabled={!isPicked}
            className="inline-flex items-center gap-2 px-6 py-3 border border-bb-secondary bg-transparent text-bb-secondary text-[12px] uppercase tracking-[0.18em] hover:bg-bb-secondary hover:text-bb-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {copy.step_next}
            <Icon name="arrow-up-right" size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function ReviewView({
  steps,
  picks,
  products,
  locale,
  copy,
  onEdit,
  onContinue,
  onBack,
}: {
  steps: WizardStep[];
  picks: Record<number, string>;
  products: ProductSummary[];
  locale: LocaleCode;
  copy: WizardCopy;
  onEdit: (idx: number) => void;
  onContinue: () => void;
  onBack: () => void;
}) {
  const lang = locale;
  const productBySlug = new Map(products.map((p) => [p.slug, p]));

  return (
    <div className="max-w-[860px] mx-auto space-y-10">
      <div className="text-center space-y-3">
        <Eyebrow tone="gold">{copy.review_eyebrow}</Eyebrow>
        <DisplayHeading size="lg" as="h2" className="text-bb-secondary">
          {copy.review_title}
        </DisplayHeading>
        <p className="font-display italic text-white/75">{copy.review_lede}</p>
      </div>
      <ol className="border-t border-bb-secondary/20">
        {steps.map((step, i) => {
          const slug = picks[i];
          const product = slug ? productBySlug.get(slug) : undefined;
          return (
            <li
              key={i}
              className="grid grid-cols-[64px_1fr_auto] sm:grid-cols-[80px_1fr_auto] items-start sm:items-center gap-3 sm:gap-4 border-b border-bb-secondary/20 py-5"
            >
              <div className="relative aspect-square bg-bb-primary-container overflow-hidden">
                {product?.heroImage ? (
                  <Photo
                    src={product.heroImage}
                    alt={product.name}
                    fill
                    sizes="80px"
                    containerClassName="absolute inset-0"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-bb-secondary/40 text-[14px] font-display italic">
                    —
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.18em] text-bb-secondary/70 mb-1">
                  {step.eyebrow[lang]}
                </p>
                <p className="font-display text-[18px] text-bb-secondary truncate">
                  {product ? product.name : copy.review_slot_empty}
                </p>
              </div>
              <button type="button"
                onClick={() => onEdit(i)}
                className="text-[11px] uppercase tracking-[0.18em] text-bb-secondary/70 hover:text-bb-secondary px-3 py-2"
              >
                {copy.review_edit}
              </button>
            </li>
          );
        })}
      </ol>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button type="button"
          onClick={onBack}
          className="text-[11px] uppercase tracking-[0.18em] text-bb-secondary/70 hover:text-bb-secondary"
        >
          ← {copy.step_back}
        </button>
        <button type="button"
          onClick={onContinue}
          className="inline-flex items-center gap-3 px-8 py-4 border border-bb-secondary bg-bb-secondary text-bb-primary font-sans text-[13px] uppercase tracking-[0.18em] hover:bg-bb-secondary-fixed-dim transition-colors"
        >
          {copy.review_continue}
          <Icon name="arrow-up-right" size={14} />
        </button>
      </div>
    </div>
  );
}

function QuantityView({
  defaultMin,
  value,
  copy,
  onChange,
  onSubmit,
  onBack,
}: {
  defaultMin: number;
  value: number;
  copy: WizardCopy;
  onChange: (n: number) => void;
  onSubmit: () => void;
  onBack: () => void;
}) {
  const belowMin = value < defaultMin;

  return (
    <div className="max-w-[640px] mx-auto space-y-10">
      <div className="text-center space-y-3">
        <Eyebrow tone="gold">{copy.quantity_eyebrow}</Eyebrow>
        <DisplayHeading size="lg" as="h2" className="text-bb-secondary">
          {copy.quantity_title}
        </DisplayHeading>
        <p className="font-display italic text-white/75">{copy.quantity_lede}</p>
      </div>
      <div className="bg-bb-primary-container border border-bb-secondary/30 p-10 space-y-6">
        <div>
          <label
            htmlFor="qty"
            className="text-[11px] uppercase tracking-[0.18em] text-bb-secondary/80 block mb-3"
          >
            {copy.quantity_min_label.replace("{n}", String(defaultMin))}
          </label>
          <input
            id="qty"
            type="number"
            min={1}
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value, 10) || 1)}
            className="w-full bg-transparent border border-bb-secondary/40 px-6 py-4 text-bb-secondary text-[24px] font-display focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary focus-visible:ring-offset-1 focus:border-bb-secondary"
          />
          {belowMin && (
            <p className="text-[12px] text-bb-tertiary mt-2 italic">
              {copy.quantity_below_min_note.replace("{n}", String(defaultMin))}
            </p>
          )}
        </div>
        <button type="button"
          onClick={onSubmit}
          className="w-full inline-flex items-center justify-center gap-3 px-6 py-4 border border-bb-secondary bg-bb-secondary text-bb-primary font-sans text-[13px] uppercase tracking-[0.18em] hover:bg-bb-secondary-fixed-dim transition-colors"
        >
          {copy.quantity_submit}
          <Icon name="arrow-up-right" size={14} />
        </button>
      </div>
      <div className="text-center">
        <button type="button"
          onClick={onBack}
          className="text-[11px] uppercase tracking-[0.18em] text-bb-secondary/70 hover:text-bb-secondary"
        >
          ← {copy.step_back}
        </button>
      </div>
    </div>
  );
}

function DoneView({ copy, onContinue }: { copy: WizardCopy; onContinue: () => void }) {
  return (
    <div className="max-w-[640px] mx-auto text-center space-y-8">
      <Eyebrow tone="gold">{copy.done_eyebrow}</Eyebrow>
      <DisplayHeading size="xl" as="h2" className="text-bb-secondary">
        {copy.done_title}
      </DisplayHeading>
      <p className="font-display italic text-white/85 text-[clamp(16px,1.5vw,20px)]">
        {copy.done_lede}
      </p>
      <button type="button"
        onClick={onContinue}
        className="inline-flex items-center gap-3 px-10 py-5 border border-bb-secondary bg-bb-secondary text-bb-primary font-sans text-[13px] uppercase tracking-[0.18em] hover:bg-bb-secondary-fixed-dim transition-colors"
      >
        {copy.done_cta}
        <Icon name="arrow-up-right" size={16} />
      </button>
    </div>
  );
}
