"use client";

import { useReducer, useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "@/i18n/navigation";
import Photo from "@/components/primitives/Photo";
import Eyebrow from "@/components/primitives/Eyebrow";
import DisplayHeading from "@/components/primitives/DisplayHeading";
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
  step_search_placeholder: string;
  step_search_count: string;
  step_filter_label: string;
  step_filter_clear: string;
  step_back: string;
  step_next: string;
  step_picked: string;
  step_more_details: string;
  step_view_details: string;
  step_choose_this: string;
  step_currently_chosen: string;
  detail_origin: string;
  detail_format: string;
  detail_lead: string;
  detail_close: string;
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
  done_compose_another: string;
  exit_aria: string;
  exit_confirm: string;
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
  const { addBox } = useInquiry();
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);
  const containerRef = useRef<HTMLElement>(null);
  const productBySlug = new Map(products.map((p) => [p.slug, p]));

  // Sprint 2.8 follow-up: the wizard intentionally does NOT persist its
  // state. Each mount starts fresh from INITIAL so a buyer composing
  // multiple boxes in one session sees a new flow each time they enter,
  // rather than landing on the previous "done" view or mid-composition.
  const [state, dispatch] = useReducer(reducer, {
    ...INITIAL,
    quantity: box.defaultQuantityMin,
  });

  // Active step set (or empty list before size is picked).
  const activeSteps: WizardStep[] = state.size
    ? stepsForSize(themeKey, state.size)
    : [];
  const totalSteps = activeSteps.length;
  const currentStepDef = state.view === "step" ? activeSteps[state.currentStep] : null;

  // Sprint 2.9: every step shows the full product pool. The pool is the
  // box's admin-assigned items if any, otherwise the category falls back
  // to all published products. No per-step subcategory filtering.

  // ---------- handlers ----------
  const handleBack = () => dispatch({ type: "back" });
  const handleSize = (s: BoxSize) => dispatch({ type: "pickSize", size: s });
  const handleQty = (q: number) => dispatch({ type: "setQty", qty: q });

  const handleEditStep = (idx: number) => {
    dispatch({ type: "hydrate", state: { ...state, view: "step", currentStep: idx } });
  };

  const handleProceedToQuantity = () => dispatch({ type: "goQuantity" });

  const handleSubmit = () => {
    // Sprint 2.6: the wizard produces ONE custom-box line, not N product
    // lines. The composition is the ordered list of picked product slugs;
    // empty/skipped slots are filtered out and the concierge fills them.
    const composedSlugs = Object.entries(state.picks)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([, slug]) => slug)
      .filter((s) => !!s);
    const categorySlug: "cosmetiques" | "epicerie_fine" =
      box.categorySlug === "epicerie_fine" ? "epicerie_fine" : "cosmetiques";
    addBox({
      giftBoxSlug: box.slug,
      minQty: box.defaultQuantityMin,
      initialQty: state.quantity,
      nameSnapshot: box.name,
      custom: { categorySlug, productSlugs: composedSlugs },
    });
    dispatch({ type: "done" });
  };

  const handleGoContact = () => {
    router.push("/contact");
  };

  // Sprint 2.8 full-screen takeover behaviour.
  // Lock the body scroll so the chrome behind the overlay can't scroll,
  // and route back to /products/[category] on Escape (with a confirm if
  // the composition has started).
  const handleExit = useCallback(() => {
    const inProgress = state.view !== "intro" && state.view !== "done";
    if (inProgress && !window.confirm(copy.exit_confirm)) return;
    router.push(`/products/${box.categorySlug}`);
  }, [state.view, router, box.categorySlug, copy.exit_confirm]);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (expandedSlug) {
          setExpandedSlug(null);
        } else {
          handleExit();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [handleExit, expandedSlug]);

  const expanded = expandedSlug ? productBySlug.get(expandedSlug) ?? null : null;
  const expandedIsChosen = expandedSlug
    ? state.picks[state.currentStep] === expandedSlug
    : false;

  const handleChooseFromModal = () => {
    if (!expandedSlug) return;
    dispatch({ type: "pick", productSlug: expandedSlug });
    setExpandedSlug(null);
    const next = state.currentStep + 1;
    if (next >= totalSteps) {
      dispatch({ type: "goReview" });
    } else {
      dispatch({
        type: "hydrate",
        state: { ...state, picks: { ...state.picks, [state.currentStep]: expandedSlug }, currentStep: next, view: "step" },
      });
    }
  };

  // ---------- render ----------
  return (
    <section
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label={copy.exit_aria}
      data-theme={themeKey}
      className={`fixed inset-0 z-[100] text-white overflow-hidden wizard-theme wizard-theme--${themeKey === "caravan_route" ? "caravan" : "sahara"}`}
    >
      {/* SaharaPrestige sits at the section level (fixed-not-scrolling)
          so the pepitas stay anchored to the viewport as the buyer scrolls
          through long steps. Earlier we had overflow-y-auto on the
          section and absolute SaharaPrestige inside it; the absolute
          layer scrolled with the content and the pepitas disappeared
          off the top of the screen mid-scroll. The fix is to separate
          the chrome (SaharaPrestige + close X) from the scrolling
          content area below. */}
      <SaharaPrestige count={60} />
      <button
        type="button"
        onClick={handleExit}
        aria-label={copy.exit_aria}
        className="fixed top-5 right-5 z-[110] flex h-12 w-12 items-center justify-center rounded-full border border-bb-secondary/40 bg-bb-primary/80 text-bb-secondary backdrop-blur-sm transition-colors hover:border-bb-secondary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-bb-primary"
      >
        <Icon name="close" size={18} />
      </button>
      <div className="absolute inset-0 overflow-y-auto overflow-x-hidden">
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
              products={products}
              activeSlug={state.picks[state.currentStep]}
              copy={copy}
              onOpen={(slug) => setExpandedSlug(slug)}
              onBack={handleBack}
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
            <DoneView
              copy={copy}
              onContinue={handleGoContact}
              onComposeAnother={() => dispatch({ type: "reset" })}
            />
          )}
        </WizardView>
      </div>
      </div>

      {expanded && (
        <ProductZoomModal
          product={expanded}
          copy={copy}
          isChosen={expandedIsChosen}
          onClose={() => setExpandedSlug(null)}
          onChoose={handleChooseFromModal}
        />
      )}
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
      className="motion-safe:animate-[slideInRight_500ms_cubic-bezier(0.16,1,0.3,1)] motion-safe:opacity-0"
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
  onOpen,
  onBack,
}: {
  step: WizardStep;
  stepIndex: number;
  totalSteps: number;
  locale: LocaleCode;
  products: ProductSummary[];
  activeSlug: string | undefined;
  copy: WizardCopy;
  onOpen: (slug: string) => void;
  onBack: () => void;
}) {
  const lang = locale;
  const eyebrow = step.eyebrow[lang];
  const title = step.title[lang];
  const story = step.story[lang];
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Build the filter-chip list from the union of tags across the visible
  // pool. Each tag is a facet value (ingredient / use / format / etc.).
  // The maison can toggle multiple chips; a product matches if it carries
  // at least one of the selected tags (OR-within-axis). Search and tag
  // filters compose with AND.
  const allTags = Array.from(
    new Set(products.flatMap((p) => p.tags))
  ).sort((a, b) => a.localeCompare(b));

  const toggleTag = (tag: string) =>
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  const clearFilters = () => {
    setSearch("");
    setSelectedTags([]);
  };
  const hasFilters = !!search.trim() || selectedTags.length > 0;

  const filteredProducts = products.filter((p) => {
    if (selectedTags.length > 0 && !selectedTags.some((t) => p.tags.includes(t))) {
      return false;
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        (p.short ?? "").toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

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
        <>
          <div className="max-w-[640px] mx-auto space-y-4">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={copy.step_search_placeholder}
              aria-label={copy.step_search_placeholder}
              className="w-full bg-bb-primary-container/40 border border-bb-secondary/30 px-4 py-3 min-h-[44px] text-bb-secondary placeholder:text-bb-secondary/40 font-sans text-[14px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary"
            />
            {allTags.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="font-sans text-[10px] uppercase tracking-[0.18em] text-bb-secondary/60 mr-1">
                  {copy.step_filter_label}
                </span>
                {allTags.map((tag) => {
                  const active = selectedTags.includes(tag);
                  return (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      aria-pressed={active}
                      className={`px-2.5 py-1 min-h-[32px] border text-[11px] uppercase tracking-[0.12em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary ${
                        active
                          ? "border-bb-secondary bg-bb-secondary text-bb-primary"
                          : "border-bb-secondary/30 text-bb-secondary/80 hover:border-bb-secondary"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
                {hasFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="ml-1 px-2.5 py-1 min-h-[32px] text-[11px] uppercase tracking-[0.12em] text-bb-secondary/60 hover:text-bb-secondary"
                  >
                    {copy.step_filter_clear}
                  </button>
                )}
              </div>
            )}
            {(search || selectedTags.length > 0) && (
              <p className="text-[11px] uppercase tracking-[0.18em] text-bb-secondary/60 text-center">
                {copy.step_search_count.replace("{n}", String(filteredProducts.length))}
              </p>
            )}
          </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {filteredProducts.map((p) => {
            const selected = p.slug === activeSlug;
            return (
              <button
                type="button"
                key={p.slug}
                onClick={() => onOpen(p.slug)}
                aria-label={`${copy.step_view_details}: ${p.name}`}
                className={`group relative text-left border bg-bb-primary transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-bb-primary ${
                  selected
                    ? "border-bb-secondary ring-2 ring-bb-secondary/40 bg-bb-primary-container"
                    : "border-bb-secondary/15 hover:border-bb-secondary/60"
                }`}
                style={{ viewTransitionName: `wizard-product-${p.slug}` }}
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
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-gradient-to-t from-bb-primary via-bb-primary/80 to-transparent px-3 py-3 text-bb-secondary opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="text-[11px] uppercase tracking-[0.18em]">
                      {copy.step_more_details}
                    </span>
                    <Icon name="arrow-up-right" size={12} />
                  </div>
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
        </>
      )}

      {/* Footer actions. Skip removed per user direction: every wizard
          slot is paid for, no buyer should land on a half-empty box. The
          zoom modal auto-advances on Choose, and Back walks back. Exit
          via the close X requires a confirm. */}
      <div className="flex items-center justify-start pt-4">
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
                    ···
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

function DoneView({
  copy,
  onContinue,
  onComposeAnother,
}: {
  copy: WizardCopy;
  onContinue: () => void;
  onComposeAnother: () => void;
}) {
  return (
    <div className="max-w-[640px] mx-auto text-center space-y-8">
      <Eyebrow tone="gold">{copy.done_eyebrow}</Eyebrow>
      <DisplayHeading size="xl" as="h2" className="text-bb-secondary">
        {copy.done_title}
      </DisplayHeading>
      <p className="font-display italic text-white/85 text-[clamp(16px,1.5vw,20px)]">
        {copy.done_lede}
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={onContinue}
          className="inline-flex items-center gap-3 px-10 py-5 border border-bb-secondary bg-bb-secondary text-bb-primary font-sans text-[13px] uppercase tracking-[0.18em] hover:bg-bb-secondary-fixed-dim transition-colors"
        >
          {copy.done_cta}
          <Icon name="arrow-up-right" size={16} />
        </button>
        <button
          type="button"
          onClick={onComposeAnother}
          className="inline-flex items-center gap-3 px-10 py-5 border border-bb-secondary bg-transparent text-bb-secondary font-sans text-[13px] uppercase tracking-[0.18em] hover:bg-bb-secondary hover:text-bb-primary transition-colors"
        >
          {copy.done_compose_another}
        </button>
      </div>
    </div>
  );
}

/**
 * Sprint 2.8 click-to-zoom product detail. Renders as an in-place modal
 * over the wizard surface (no real navigation). Closing returns to the
 * exact wizard step without losing the composition state. Choosing picks
 * the product and auto-advances.
 */
function ProductZoomModal({
  product,
  copy,
  isChosen,
  onClose,
  onChoose,
}: {
  product: ProductSummary;
  copy: WizardCopy;
  isChosen: boolean;
  onClose: () => void;
  onChoose: () => void;
}) {
  // Mobile (< md): bottom sheet that slides up from the bottom, takes
  // ~94vh, scrollable inside. Desktop: centered modal at max 1080px.
  // The bottom-sheet pattern avoids the iOS-Safari nested-scroll bugs
  // that the centered modal had on phones (user-reported: content too
  // big to view, no scroll).
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={product.name}
      className="fixed inset-0 z-[120] flex items-end justify-center md:items-center md:justify-center bg-bb-primary/85 backdrop-blur-md md:px-4 md:py-8 motion-safe:animate-[fadeInUp_240ms_ease-out]"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex flex-col w-full max-w-full md:max-w-[1080px] h-[94vh] md:h-auto md:max-h-[92vh] bg-bb-primary border-t border-bb-secondary/30 md:border md:border-bb-secondary/30 overflow-y-auto overscroll-contain md:grid md:grid-cols-2 md:gap-0"
        style={{ viewTransitionName: `wizard-product-${product.slug}`, WebkitOverflowScrolling: "touch" }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={copy.detail_close}
          className="absolute top-3 right-3 md:top-4 md:right-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-bb-secondary/40 bg-bb-primary/90 text-bb-secondary backdrop-blur-sm transition-colors hover:border-bb-secondary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary"
        >
          <Icon name="close" size={16} />
        </button>

        <div className="relative aspect-[5/4] md:aspect-auto md:min-h-[440px] shrink-0 overflow-hidden bg-bb-primary-container">
          <Photo
            src={product.heroImage}
            alt={product.name}
            fill
            sizes="(min-width:768px) 50vw, 100vw"
            containerClassName="absolute inset-0"
          />
        </div>

        <div className="flex flex-col gap-4 md:gap-5 p-5 sm:p-6 md:p-10">
          {product.ritualLabel && (
            <Eyebrow tone="gold">{product.ritualLabel}</Eyebrow>
          )}
          <DisplayHeading size="lg" as="h3" className="text-bb-secondary leading-tight">
            {product.name}
          </DisplayHeading>
          {product.short && (
            <p className="font-display italic text-bb-secondary/85 text-[clamp(15px,1.4vw,20px)] leading-snug">
              {product.short}
            </p>
          )}
          {product.lede && (
            <p className="text-white/80 leading-relaxed text-[14px] md:text-[15px]">
              {product.lede}
            </p>
          )}
          {(product.origin || product.formats[0]) && (
            <dl className="grid grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-3 border-y border-bb-secondary/20 py-4 text-[12px]">
              {product.origin && (
                <>
                  <dt className="uppercase tracking-[0.18em] text-bb-secondary/60">{copy.detail_origin}</dt>
                  <dd className="text-bb-secondary">{product.origin}</dd>
                </>
              )}
              {product.formats[0] && (
                <>
                  <dt className="uppercase tracking-[0.18em] text-bb-secondary/60">{copy.detail_format}</dt>
                  <dd className="text-bb-secondary">{product.formats.join(", ")}</dd>
                </>
              )}
            </dl>
          )}
          {product.tags.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {product.tags.slice(0, 8).map((tag) => (
                <li
                  key={tag}
                  className="inline-flex items-center px-2.5 py-1 border border-bb-secondary/30 text-[11px] uppercase tracking-[0.12em] text-bb-secondary/85"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-auto pt-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3 sticky bottom-0 md:static bg-bb-primary md:bg-transparent -mx-5 sm:-mx-6 md:mx-0 -mb-5 sm:-mb-6 md:mb-0 px-5 sm:px-6 md:px-0 pb-5 sm:pb-6 md:pb-0 border-t border-bb-secondary/20 md:border-0">
            <button
              type="button"
              onClick={onClose}
              className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-secondary/70 hover:text-bb-secondary px-4 py-3 sm:py-2 min-h-[44px]"
            >
              ← {copy.detail_close}
            </button>
            <button
              type="button"
              onClick={onChoose}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-7 py-4 min-h-[48px] border border-bb-secondary bg-bb-secondary text-bb-primary font-sans text-[12px] uppercase tracking-[0.18em] hover:bg-bb-secondary-fixed-dim transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-bb-primary"
            >
              {isChosen ? copy.step_currently_chosen : copy.step_choose_this}
              <Icon name="arrow-up-right" size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
