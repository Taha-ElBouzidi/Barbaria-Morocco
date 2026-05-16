# Stitch Redesign Port Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the Google Stitch "Modern Maghreb Rituals" design to the existing Next.js 16 Barbaria codebase. Three rituals (Hammam / Botanical / Heritage), full IA (Home, ritual categories, PDP, Story, Ateliers, Journal, Contact), B2B inquiry flow via `mailto:`, design tokens + typography ported verbatim from the handoff, existing photography in `public/brand_photos/` mapped through new components.

**Architecture:** Single-PR frontend port. Products live in a typed TS data file (`lib/products.ts`) , no CMS this sprint. Inquiry persists in localStorage (renaming `cart-context` → `inquiry-context`). Old routes (`/cosmetics`, `/food`, `/textile`, `/order`, `/about`) 301-redirect to new ones via Next 16 `next.config.js` `redirects` config. Design tokens land as CSS custom properties referenced by Tailwind 4 `@theme`. EN/FR via existing `next-intl` setup.

**Tech Stack:** Next.js 16.2.1 (App Router, Turbopack), React 19.2, TypeScript 5, Tailwind 4, next-intl 4, next/font/google, Playwright (test, added by this plan), motion (already a dep, used sparingly).

**Spec:** `.project/specs/2026-05-11-stitch-redesign-port-design.md`
**Branch:** `feat/stitch-redesign` (already cut from `master`, first commit landed: spec + governance + turbopack root fix)

---

## File Structure (locked in here)

### New files
```
app/[locale]/rituals/[world]/page.tsx       Category page (parameterized world)
app/[locale]/product/[id]/page.tsx          Product detail page
app/[locale]/story/page.tsx                 Brand story (3 chapters)
app/[locale]/ateliers/page.tsx              Cooperative partners 6-up
app/[locale]/journal/page.tsx               Editorial index 6 cards

components/shell/Header.tsx                 Sticky transparent→sand header
components/shell/Footer.tsx                 3-col editorial footer
components/shell/MenuDrawer.tsx             Right-side menu drawer
components/shell/InquiryDrawer.tsx          Right-side inquiry list drawer

components/primitives/Reveal.tsx            IntersectionObserver fade-up wrapper
components/primitives/Eyebrow.tsx           11px caps tracked label
components/primitives/DisplayHeading.tsx    Cormorant display H1/H2 atom
components/primitives/Photo.tsx             next/image wrapper + gradient fallback
components/primitives/Icon.tsx              Inline SVG icon set (20 icons)

components/home/Hero.tsx                    90vh hero with dark wash + stagger
components/home/CredentialStrip.tsx         Sand band with credentials marquee
components/home/EditorialBlock.tsx          Asymmetric 2-col block
components/home/BentoRituals.tsx            3-photo + 1-text bento grid
components/home/Heritage3Up.tsx             3 icon cells + gold quote

components/category/CategoryHero.tsx        Full-bleed cinematic 70vh hero
components/category/SubChips.tsx            Horizontal sub-cat links
components/category/FilterRail.tsx          280px collapsible facet rail
components/category/ProductGrid.tsx         3/2/1 column responsive grid
components/category/ProductCard.tsx         Photo+MOQ+name+ghost CTA card

components/product/ImageStack.tsx           Sticky left thumb-swap stack
components/product/SpecColumn.tsx           Right spec column with separators
components/product/ProofStrip.tsx           3-cell hairline strip
components/product/ApplicationRitual.tsx    Numbered steps with icons
components/product/CooperativeBand.tsx      Full-bleed green stat band
components/product/RelatedRow.tsx           3-up related products

components/contact/TwoStepForm.tsx          Two-step inquiry form
components/contact/InquirySidebar.tsx       Sticky inquiry list sidebar

lib/inquiry-context.tsx                     Renamed from cart-context.tsx
lib/products.ts                             Typed product catalogue (~17 items)
lib/rituals.ts                              WORLDS + SUBCATS + FACETS data
lib/tokens.ts                               Re-exports CSS var names for JS

tests/smoke.spec.ts                         Playwright route smoke tests
tests/functional.spec.ts                    Inquiry flow + locale switch tests
tests/a11y.spec.ts                          axe-core scans

playwright.config.ts                        Playwright config
```

### Modified files
```
app/[locale]/layout.tsx                     Wire fonts, providers, header/footer
app/[locale]/page.tsx                       Rewritten Home composition
app/[locale]/contact/page.tsx               Replaced with new TwoStepForm
app/globals.css                             Add --bb-* tokens, Tailwind @theme
app/sitemap.ts                              Update routes list
next.config.ts                              Add `redirects` config (no proxy edit)
messages/en.json                            Extend with new copy
messages/fr.json                            Extend with new copy
components/Navbar.tsx                       DELETED (replaced by shell/Header)
components/Footer.tsx                       DELETED (replaced by shell/Footer)
package.json                                Add Playwright + axe-core devDeps
```

### Deleted directories (last task, with redirects in place)
```
app/[locale]/about/
app/[locale]/cosmetics/
app/[locale]/food/
app/[locale]/textile/
app/[locale]/order/
components/cosmetics/
components/order/
```

---

## Verification policy

- After EVERY task: `npm run build` must exit 0. No new TS errors. No new ESLint warnings.
- Per global rule: never `--no-verify`. If a hook fails, fix the cause.
- Each task ends with a single git commit. Commit message format: `<type>(<scope>): <summary>` (e.g., `feat(home): hero + credential strip`, `chore(deps): add playwright`, `refactor(state): cart-context → inquiry-context`).
- Each commit body lists files touched and one sentence per major change.
- After each commit: append a one-line entry to `.project/CHANGELOG.md` (timestamp + summary).
- No subagent may push to origin without PM (Claude/Taha) approval. Only the final task pushes.

---

## Task 1: Design tokens + typography setup

**Goal:** Get the warm-sand color palette and Cormorant/Playfair/Montserrat stack rendering on every page. After this task, the existing UI looks intentionally "wrong" (current components on new colors) , that's expected.

**Files:**
- Modify: `app/[locale]/layout.tsx` (wire next/font/google)
- Modify: `app/globals.css` (add `--bb-*` CSS vars, Tailwind `@theme`)
- Create: `lib/tokens.ts` (TS exports for JS consumers , minimal)

**Reference docs to read first:**
- `node_modules/next/dist/docs/01-app/01-getting-started/13-fonts.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/11-css.md`
- Tailwind 4 `@theme` syntax (search Context7 or inspect `node_modules/tailwindcss/`)

**Steps:**

- [ ] **1.1** Read existing `app/globals.css` and `app/[locale]/layout.tsx` to understand current Tailwind setup and provider tree.

- [ ] **1.2** Read the Next 16 fonts doc cited above. Confirm `next/font/google` API for multiple weights/styles.

- [ ] **1.3** Read the source-of-truth design tokens from `D:\dev\Havok\BARBARIA\design_handoff_barbaria\src\style.css` lines 1–80 (`:root` block).

- [ ] **1.4** Modify `app/globals.css`. At the top (above any existing content), add the `:root` block with all `--bb-*` custom properties:

```css
:root {
  /* Surfaces */
  --bb-bg:                 #fcf9f3;
  --bb-bg-low:             #f6f3ed;
  --bb-bg-mid:             #f0eee8;
  --bb-bg-high:            #ebe8e2;
  --bb-bg-highest:         #e5e2dc;
  --bb-on-surface:         #1c1c18;
  --bb-on-surface-variant: #434843;
  --bb-outline:            #737973;
  --bb-outline-variant:    #c3c8c1;
  --bb-line:               #d1c7b7;

  /* Brand */
  --bb-primary:            #1b3022;
  --bb-primary-container:  #2a4632;
  --bb-on-primary:         #ffffff;
  --bb-on-primary-soft:    #819986;
  --bb-secondary:          #c5a059;
  --bb-secondary-fixed:    #ffdea5;
  --bb-secondary-fixed-dim:#e9c176;
  --bb-tertiary:           #b45f42;
  --bb-tertiary-soft:      #d77a5b;

  /* Spacing */
  --bb-section-gap: 128px;
  --bb-margin-edge: 64px;
  --bb-gutter:      32px;
  --bb-container:   1440px;
}

@media (max-width: 800px) {
  :root { --bb-margin-edge: 24px; --bb-section-gap: 80px; }
}
```

- [ ] **1.5** In the same `globals.css`, add Tailwind 4 theme mapping that references the vars (NOT duplicates):

```css
@theme {
  --color-bb-bg: var(--bb-bg);
  --color-bb-bg-low: var(--bb-bg-low);
  --color-bb-primary: var(--bb-primary);
  --color-bb-primary-container: var(--bb-primary-container);
  --color-bb-secondary: var(--bb-secondary);
  --color-bb-secondary-fixed-dim: var(--bb-secondary-fixed-dim);
  --color-bb-tertiary: var(--bb-tertiary);
  --color-bb-line: var(--bb-line);
  --color-bb-on-surface: var(--bb-on-surface);
  --color-bb-on-surface-variant: var(--bb-on-surface-variant);
  --color-bb-outline: var(--bb-outline);
  --color-bb-outline-variant: var(--bb-outline-variant);
  --font-display: var(--font-cormorant), "Playfair Display", serif;
  --font-serif: var(--font-playfair), "Cormorant Garamond", serif;
  --font-sans: var(--font-montserrat), "Inter", system-ui, sans-serif;
}
```

- [ ] **1.6** Wire fonts in `app/[locale]/layout.tsx`. Add at top:

```tsx
import { Cormorant_Garamond, Playfair_Display, Montserrat } from "next/font/google";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-playfair",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-montserrat",
  display: "swap",
});
```

Then on the root `<html>` (or `<body>`) in the same layout, add: `className={\`${cormorant.variable} ${playfair.variable} ${montserrat.variable}\`}`.

Update `<body>` base classes to use the new tokens: `className="bg-bb-bg text-bb-on-surface font-sans antialiased"`.

- [ ] **1.7** Create `lib/tokens.ts`:

```ts
// CSS custom-property names re-exported for JS consumers
// (use `var(--bb-...)` directly in CSS; use these constants in inline styles or motion configs).
export const TOKENS = {
  color: {
    bg: "var(--bb-bg)",
    bgLow: "var(--bb-bg-low)",
    primary: "var(--bb-primary)",
    primaryContainer: "var(--bb-primary-container)",
    secondary: "var(--bb-secondary)",
    line: "var(--bb-line)",
    onSurface: "var(--bb-on-surface)",
    onSurfaceVariant: "var(--bb-on-surface-variant)",
  },
  ease: {
    standard: "cubic-bezier(.2,.6,.2,1)",
  },
  reveal: {
    durationMs: 600,
    offsetPx: 16,
    staggerMs: 80,
  },
} as const;
```

- [ ] **1.8** Run `npm run build`. Expected: exit 0, zero TS errors, page renders (Home will look broken visually, that's fine , tokens are in but components don't use them yet).

- [ ] **1.9** Start dev server (`npm run dev`), open `http://localhost:3000`, confirm body background is sand `#fcf9f3` and fonts are loaded (DevTools → Network → look for Cormorant/Playfair/Montserrat woff2). Verify with Computed Styles panel that `--bb-primary` resolves to `#1b3022`.

- [ ] **1.10** Append to `.project/CHANGELOG.md`: `- HH:MM CET , Task 1: design tokens + next/font wiring landed.`

- [ ] **1.11** Commit:

```bash
git add app/globals.css app/[locale]/layout.tsx lib/tokens.ts .project/CHANGELOG.md
git commit -m "feat(tokens): port --bb-* design tokens and Cormorant/Playfair/Montserrat fonts" -m "Adds 22 CSS custom properties (colors + spacing + container) sourced from design_handoff_barbaria/src/style.css. Maps them into Tailwind 4 @theme so utilities like bg-bb-bg, text-bb-primary work. Wires next/font/google for Cormorant Garamond (400/600/700 + italic), Playfair Display (500/600), Montserrat (400/500/600), all display:swap." -m "Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Primitives , Reveal, Eyebrow, DisplayHeading, Photo, Icon

**Goal:** Five reusable atoms that every page depends on. After this task, downstream components compose against stable primitives.

**Files:**
- Create: `components/primitives/Reveal.tsx`
- Create: `components/primitives/Eyebrow.tsx`
- Create: `components/primitives/DisplayHeading.tsx`
- Create: `components/primitives/Photo.tsx`
- Create: `components/primitives/Icon.tsx`

**Reference docs:**
- `node_modules/next/dist/docs/01-app/01-getting-started/12-images.md` (next/image API)
- Handoff: `design_handoff_barbaria/src/components.jsx` (Reveal + Icon + Photo references, lines 1–200)

**Steps:**

- [ ] **2.1** Create `components/primitives/Reveal.tsx`:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";

interface RevealProps {
  children: React.ReactNode;
  delayMs?: number;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
}

export default function Reveal({ children, delayMs = 0, as = "div", className }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const node = ref.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true);
            obs.disconnect();
          }
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -10% 0px" }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, []);

  const Tag = as as keyof React.JSX.IntrinsicElements;
  return (
    <Tag
      ref={ref as never}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : "translateY(16px)",
        transition: `opacity 600ms cubic-bezier(.2,.6,.2,1) ${delayMs}ms, transform 600ms cubic-bezier(.2,.6,.2,1) ${delayMs}ms`,
        willChange: shown ? "auto" : "opacity, transform",
      }}
    >
      {children}
    </Tag>
  );
}
```

- [ ] **2.2** Create `components/primitives/Eyebrow.tsx`:

```tsx
import { cn } from "@/lib/utils";

interface EyebrowProps {
  children: React.ReactNode;
  className?: string;
  tone?: "gold" | "green" | "muted";
}

export default function Eyebrow({ children, className, tone = "gold" }: EyebrowProps) {
  const toneClass =
    tone === "gold" ? "text-bb-secondary" : tone === "green" ? "text-bb-primary" : "text-bb-on-surface-variant";
  return (
    <span
      className={cn(
        "block font-sans font-semibold uppercase tracking-[0.18em] text-[11px] leading-none",
        toneClass,
        className
      )}
    >
      {children}
    </span>
  );
}
```

- [ ] **2.3** Create `components/primitives/DisplayHeading.tsx`:

```tsx
import { cn } from "@/lib/utils";

type Size = "xl" | "lg" | "md";

interface DisplayHeadingProps {
  children: React.ReactNode;
  size?: Size;
  as?: "h1" | "h2" | "h3";
  className?: string;
}

const SIZE_CLASS: Record<Size, string> = {
  xl: "text-[clamp(48px,6vw,96px)] leading-[1.02] tracking-[-0.02em]",
  lg: "text-[clamp(32px,4vw,72px)] leading-[1.05] tracking-[-0.015em]",
  md: "text-[clamp(28px,3vw,56px)] leading-[1.08] tracking-[-0.01em]",
};

export default function DisplayHeading({ children, size = "lg", as: Tag = "h2", className }: DisplayHeadingProps) {
  return (
    <Tag className={cn("font-serif font-normal text-bb-on-surface", SIZE_CLASS[size], className)}>{children}</Tag>
  );
}
```

- [ ] **2.4** Create `components/primitives/Photo.tsx`:

```tsx
import Image from "next/image";
import { cn } from "@/lib/utils";

interface PhotoProps {
  src: string | null;
  alt: string;
  priority?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  className?: string;
  containerClassName?: string;
  needsShot?: boolean;
}

export default function Photo({
  src,
  alt,
  priority,
  fill,
  width,
  height,
  sizes,
  className,
  containerClassName,
  needsShot,
}: PhotoProps) {
  if (!src || needsShot) {
    return (
      <div
        aria-label={alt}
        role="img"
        data-needs-shot={needsShot || undefined}
        className={cn(
          "relative overflow-hidden",
          "bg-[linear-gradient(180deg,#2a4632,#1b3022)]",
          containerClassName
        )}
      >
        <svg
          aria-hidden
          className="absolute inset-0 h-full w-full opacity-[0.06] mix-blend-overlay"
          viewBox="0 0 24 24"
          preserveAspectRatio="xMidYMid slice"
        >
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" />
            <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0" />
          </filter>
          <rect width="24" height="24" filter="url(#noise)" />
        </svg>
      </div>
    );
  }

  if (fill) {
    return (
      <div className={cn("relative overflow-hidden", containerClassName)}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes ?? "100vw"}
          priority={priority}
          quality={88}
          className={cn("object-cover", className)}
        />
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", containerClassName)}>
      <Image
        src={src}
        alt={alt}
        width={width ?? 1200}
        height={height ?? 1500}
        sizes={sizes ?? "(min-width: 1024px) 50vw, 100vw"}
        priority={priority}
        quality={88}
        className={cn("h-auto w-full", className)}
      />
    </div>
  );
}
```

- [ ] **2.5** Create `components/primitives/Icon.tsx` with the 20-icon SVG set from `design_handoff_barbaria/src/components.jsx` (lines 50–180 hold the SVG paths). Icon names: `arrow-right, arrow-up-right, menu, close, globe, search, instagram, whatsapp, mail, hammam, leaf, diamond, concierge, plus, minus, check, location, x, phone, calendar`.

```tsx
import { cn } from "@/lib/utils";

const PATHS: Record<string, string> = {
  "arrow-right": "M5 12h14M13 5l7 7-7 7",
  "arrow-up-right": "M7 17L17 7M7 7h10v10",
  menu: "M4 6h16M4 12h16M4 18h16",
  close: "M6 6l12 12M6 18L18 6",
  globe: "M12 2a10 10 0 100 20 10 10 0 000-20zm0 0c-3 3-4 6-4 10s1 7 4 10m0-20c3 3 4 6 4 10s-1 7-4 10M2 12h20",
  search: "M11 19a8 8 0 100-16 8 8 0 000 16zm0 0l6 6",
  instagram: "M3 8a5 5 0 015-5h8a5 5 0 015 5v8a5 5 0 01-5 5H8a5 5 0 01-5-5V8zm9 8a4 4 0 100-8 4 4 0 000 8zm5-9a1 1 0 100 2 1 1 0 000-2z",
  whatsapp: "M20 4a10 10 0 00-15 13l-1 4 4-1A10 10 0 0020 4zm-3 11c-2 2-7-3-5-5l1-1 2 1-1 2c1 1 2 2 3 2l1-1 2 1-3 1z",
  mail: "M3 7l9 6 9-6M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M3 7a2 2 0 012-2h14a2 2 0 012 2",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  check: "M5 12l5 5 9-11",
  location: "M12 2a8 8 0 00-8 8c0 5 8 12 8 12s8-7 8-12a8 8 0 00-8-8zm0 11a3 3 0 100-6 3 3 0 000 6z",
  hammam: "M4 16c4-1 6 1 8 1s4-2 8-1M4 12c4-1 6 1 8 1s4-2 8-1M8 3v6M12 3v6M16 3v6",
  leaf: "M5 19c8-2 13-7 14-15-8 1-13 6-14 14m0 0l4-4",
  diamond: "M6 9l6-6 6 6-6 12-6-12zm0 0h12",
  concierge: "M4 18h16M6 18a6 6 0 0112 0M12 6V3",
  x: "M6 6l12 12M6 18L18 6",
  phone: "M5 4l3 3-2 2a10 10 0 005 5l2-2 3 3a2 2 0 01-2 2 12 12 0 01-11-11 2 2 0 012-2z",
  calendar: "M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1zM4 10h16M8 3v4M16 3v4",
};

interface IconProps {
  name: keyof typeof PATHS;
  size?: number;
  className?: string;
  strokeWidth?: number;
}

export default function Icon({ name, size = 24, className, strokeWidth = 1.6 }: IconProps) {
  const d = PATHS[name];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={cn("shrink-0", className)}
    >
      <path d={d} />
    </svg>
  );
}
```

- [ ] **2.6** Verify `lib/utils.ts` has a `cn` helper (it should from shadcn , repo already has `components.json`). If missing, create:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **2.7** Run `npm run build`. Expected: exit 0. The new files are unused yet but should type-check.

- [ ] **2.8** Append CHANGELOG entry.

- [ ] **2.9** Commit:

```bash
git add components/primitives lib/utils.ts .project/CHANGELOG.md
git commit -m "feat(primitives): Reveal, Eyebrow, DisplayHeading, Photo, Icon atoms" -m "Reveal: one-shot IntersectionObserver fade-up, honors prefers-reduced-motion. Photo: next/image wrapper with deep-green gradient + noise fallback for needs-shot slots. Icon: 20-glyph inline SVG set, 1.6 stroke, currentColor. Eyebrow + DisplayHeading: typographic atoms enforcing handoff scale." -m "Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Inquiry context (rename cart-context → inquiry-context, localStorage migration)

**Goal:** Rename the existing `lib/cart-context.tsx` to `lib/inquiry-context.tsx` with semantic API (add/remove/clear, items list, count). Migrate the localStorage key from `barbaria-cart` to `bb.inquiry` with a one-shot copy on first hydrate.

**Files:**
- Modify: rename `lib/cart-context.tsx` → `lib/inquiry-context.tsx`
- Modify: every importer of `useCart` (search and update)

**Steps:**

- [ ] **3.1** Grep for all consumers: `grep -rn "useCart\|cart-context\|CartProvider" --include="*.tsx" --include="*.ts" .`. Note each file path.

- [ ] **3.2** Move the file:

```bash
git mv lib/cart-context.tsx lib/inquiry-context.tsx
```

- [ ] **3.3** Edit `lib/inquiry-context.tsx`. Rename types and exports:
- `CartState` → `InquiryState`
- `CartAction` → `InquiryAction`
- `cartReducer` → `inquiryReducer`
- `CartContextValue` → `InquiryContextValue`
- Storage key: change `const STORAGE_KEY = "barbaria-cart";` → `const STORAGE_KEY = "bb.inquiry";`
- Add migration: on initial hydrate, if `localStorage.getItem("barbaria-cart")` exists, parse and copy to `bb.inquiry`, then `localStorage.removeItem("barbaria-cart")`.
- Rename hook `useCart` → `useInquiry`. Keep backward-compat alias: `export const useCart = useInquiry;` with a `console.warn("useCart is deprecated, use useInquiry")` for the duration of this PR , remove in Task 12 when old routes are deleted.

Hydration block becomes:

```ts
useEffect(() => {
  try {
    const legacy = localStorage.getItem("barbaria-cart");
    if (legacy && !localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, legacy);
      localStorage.removeItem("barbaria-cart");
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) dispatch({ type: "hydrate", state: deserializeCart(raw) });
  } catch {
    // localStorage unavailable (private mode etc.) , proceed with empty state
  }
}, []);
```

- [ ] **3.4** Update every importer found in 3.1: replace `from "@/lib/cart-context"` with `from "@/lib/inquiry-context"`. Replace `useCart()` calls with `useInquiry()` calls. Keep `totalItems` and other property names unchanged for this task , semantic rename only, no API surface change.

- [ ] **3.5** Run `npm run build`. Expected: exit 0. If any old import path still resolves, fix it.

- [ ] **3.6** Manual verification:
  1. Start dev server, open `http://localhost:3000/cosmetics`.
  2. DevTools → Application → Local Storage. Confirm key `bb.inquiry` is set (may be empty Map).
  3. In DevTools console: `localStorage.setItem("barbaria-cart", JSON.stringify([["test", 1]])); location.reload();` , after reload, `bb.inquiry` should contain the entry and `barbaria-cart` should be gone.
  4. Click "Add to cart" on a product. Confirm count updates.

- [ ] **3.7** Append CHANGELOG.

- [ ] **3.8** Commit:

```bash
git add lib/inquiry-context.tsx .project/CHANGELOG.md $(git diff --name-only HEAD)
git commit -m "refactor(state): rename cart-context → inquiry-context with localStorage migration" -m "Storage key barbaria-cart → bb.inquiry, one-shot copy on first hydrate. Hook useCart aliased to useInquiry temporarily (removed in task 12). No API surface changes; semantics align with B2B inquiry concept replacing checkout cart." -m "Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: Header (sticky transparent → sand)

**Goal:** New editorial header. Transparent over hero, gains sand background + 1px sandstone bottom border after 8px scroll. Logo left, primary nav center (Rituals dropdown + Story / Ateliers / Journal), lang toggle + Inquiry(N) + hamburger right.

**Files:**
- Create: `components/shell/Header.tsx`
- Modify: `app/[locale]/layout.tsx` (swap `Navbar` import → `Header`)
- Keep `components/Navbar.tsx` in place for now (deleted in Task 12)

**Steps:**

- [ ] **4.1** Read `design_handoff_barbaria/src/components.jsx` Header function (~line 220) and `style.css` `.bb-header*` rules (~line 280–360) for the exact behavior.

- [ ] **4.2** Read existing `components/Navbar.tsx` to inherit the language-toggle and pathname-aware logic.

- [ ] **4.3** Create `components/shell/Header.tsx`:

```tsx
"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import Image from "next/image";
import Icon from "@/components/primitives/Icon";
import Eyebrow from "@/components/primitives/Eyebrow";
import { useInquiry } from "@/lib/inquiry-context";

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

  const isHero = pathname === "/" || pathname.startsWith("/rituals") || pathname.startsWith("/story");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isDark = isHero && !scrolled;
  const otherLocale = locale === "fr" ? "en" : "fr";

  return (
    <header
      className={[
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled
          ? "bg-bb-bg border-b border-bb-line"
          : isHero
          ? "bg-transparent"
          : "bg-bb-bg border-b border-bb-line",
      ].join(" ")}
    >
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-[var(--bb-margin-edge)]">
        <Link href="/" className={["font-serif text-[20px] tracking-[0.02em]", isDark ? "text-white" : "text-bb-primary"].join(" ")}>
          Barbaria
        </Link>

        <nav className="hidden lg:flex items-center gap-10 font-sans text-[13px] tracking-[0.04em] uppercase">
          {(["hammam", "botanical", "heritage"] as const).map((world) => (
            <Link
              key={world}
              href={`/rituals/${world}`}
              className={[
                "transition-opacity hover:opacity-70",
                isDark ? "text-white" : "text-bb-on-surface",
              ].join(" ")}
            >
              {t(world)}
            </Link>
          ))}
          <Link href="/story" className={isDark ? "text-white" : "text-bb-on-surface"}>
            {t("story")}
          </Link>
          <Link href="/journal" className={isDark ? "text-white" : "text-bb-on-surface"}>
            {t("journal")}
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link href={pathname} locale={otherLocale} className={["font-sans text-[12px] uppercase tracking-[0.18em]", isDark ? "text-white" : "text-bb-on-surface"].join(" ")}>
            {otherLocale.toUpperCase()}
          </Link>
          <button onClick={onOpenInquiry} className={["flex items-center gap-2 font-sans text-[12px] uppercase tracking-[0.18em]", isDark ? "text-white" : "text-bb-on-surface"].join(" ")} aria-label={t("inquiry_aria", { count: totalItems })}>
            {t("inquiry")} ({totalItems})
          </button>
          <button onClick={onOpenMenu} className={isDark ? "text-white" : "text-bb-on-surface"} aria-label={t("menu")}>
            <Icon name="menu" size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **4.4** Extend `messages/en.json` `nav` namespace with keys: `hammam`, `botanical`, `heritage`, `story`, `journal`, `inquiry`, `inquiry_aria`, `menu`. Same for `fr.json`. Use these EN values (FR translations in Task 6):

```json
"nav": {
  "home": "Home",
  "hammam": "Hammam",
  "botanical": "Botanical",
  "heritage": "Heritage",
  "story": "Story",
  "ateliers": "Ateliers",
  "journal": "Journal",
  "contact": "Contact",
  "inquiry": "Inquiry",
  "inquiry_aria": "Inquiry list, {count} items",
  "menu": "Open menu"
}
```

- [ ] **4.5** Modify `app/[locale]/layout.tsx`: replace `Navbar` import with `Header`. The shell needs drawer state , add a client component wrapper `components/shell/ShellChrome.tsx` that owns `menuOpen` + `inquiryOpen` state and renders Header + MenuDrawer (stub for now) + InquiryDrawer (stub) + children. Render in layout: `<ShellChrome locale={locale}>{children}</ShellChrome>`.

```tsx
// components/shell/ShellChrome.tsx
"use client";
import { useState } from "react";
import Header from "./Header";

export default function ShellChrome({ locale, children }: { locale: string; children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [inquiryOpen, setInquiryOpen] = useState(false);

  return (
    <>
      <Header locale={locale} onOpenMenu={() => setMenuOpen(true)} onOpenInquiry={() => setInquiryOpen(true)} />
      {/* MenuDrawer + InquiryDrawer wired in Task 5 */}
      <main className="pt-[72px]">{children}</main>
    </>
  );
}
```

- [ ] **4.6** Run `npm run build`. Verify zero TS errors and existing routes still render.

- [ ] **4.7** Dev-server verification: open `/`, `/cosmetics` (still old route, but Header should overlay). Confirm sticky behavior at scroll > 8px on `/` (transparent → sand).

- [ ] **4.8** CHANGELOG entry. Commit:

```bash
git add components/shell/Header.tsx components/shell/ShellChrome.tsx app/[locale]/layout.tsx messages/en.json messages/fr.json .project/CHANGELOG.md
git commit -m "feat(shell): editorial Header with transparent-over-hero behavior" -m "Sticky header that's transparent on Home/rituals/story routes when scroll≤8px, opaque sand with 1px border otherwise. Primary nav: 3 rituals + Story + Journal. Right side: lang toggle, Inquiry(N), hamburger." -m "Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: Footer + MenuDrawer + InquiryDrawer

**Goal:** Complete the shell. Three-column footer, right-side hamburger drawer (rituals + secondary nav), right-side inquiry list drawer with quick remove and "Request Quote" CTA.

**Files:**
- Create: `components/shell/Footer.tsx`
- Create: `components/shell/MenuDrawer.tsx`
- Create: `components/shell/InquiryDrawer.tsx`
- Modify: `components/shell/ShellChrome.tsx` (wire both drawers + Footer)

**Reference:** `design_handoff_barbaria/src/components.jsx` Footer + MenuDrawer + InquiryDrawer functions.

**Steps:**

- [ ] **5.1** Create `components/shell/Footer.tsx` , three columns:
  - Maison: link to `/story`, `/ateliers`, `/journal`
  - Catalogue: link to 3 rituals
  - Concierge: link to `/contact`, mailto, WhatsApp (`https://wa.me/212659658863`), Instagram (`https://instagram.com/barbaria_00`)
  Use `border-t border-bb-line`, `bg-bb-bg`, deep-green text. Section heading style: Eyebrow gold.

- [ ] **5.2** Create `components/shell/MenuDrawer.tsx`:
  - Right-side `<dialog>` or animated `<div>` with `inset: 0 0 0 auto`, width clamp(320px, 80vw, 480px).
  - Backdrop overlay (`bg-bb-primary/40 backdrop-blur-sm`) closes on click.
  - Esc key closes (`useEffect` keydown listener).
  - Focus trap: `useRef` + tabindex management or `react-focus-lock` if approved. (YAGNI: implement manual trap with first/last focusable.)
  - Three large links (Cormorant 48px) for rituals, smaller for Story/Ateliers/Journal/Contact.
  - Take `open: boolean` and `onClose: () => void` props.

- [ ] **5.3** Create `components/shell/InquiryDrawer.tsx`:
  - Same drawer mechanics as MenuDrawer.
  - Header: Eyebrow gold "Your Inquiry", count badge.
  - Body: scrollable list of items. Each item: thumbnail (Photo, 80×80), name (font-serif), one-line spec, `−/+` qty stepper, remove button (Icon `close`).
  - Empty state: italic Cormorant "Your inquiry list is empty. Browse rituals to begin."
  - Footer (sticky): "Request Quote" button → navigates to `/contact` and closes drawer. Secondary "Clear all" link if items > 0.
  - Reads from `useInquiry()`. Uses `PRODUCTS` from `lib/products.ts` for name+thumbnail lookup (forward ref , lib/products.ts created in Task 6).

- [ ] **5.4** Update `ShellChrome.tsx` to mount both drawers and Footer:

```tsx
"use client";
import { useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import MenuDrawer from "./MenuDrawer";
import InquiryDrawer from "./InquiryDrawer";

export default function ShellChrome({ locale, children }: { locale: string; children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [inquiryOpen, setInquiryOpen] = useState(false);

  return (
    <>
      <Header locale={locale} onOpenMenu={() => setMenuOpen(true)} onOpenInquiry={() => setInquiryOpen(true)} />
      <MenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
      <InquiryDrawer open={inquiryOpen} onClose={() => setInquiryOpen(false)} />
      <main className="pt-[72px]">{children}</main>
      <Footer />
    </>
  );
}
```

- [ ] **5.5** Note: `InquiryDrawer` references `PRODUCTS` from `lib/products.ts` which doesn't exist yet. For this task, define a temporary `getProductMeta(id)` shim that returns `{ name: id, image: null }` , overwritten in Task 6.

- [ ] **5.6** Run `npm run build`. Manually test in dev: open menu drawer (hamburger), close (Esc + click overlay + close button , three paths). Same for inquiry drawer. Verify focus trap by Tab-walking inside open drawer , focus must not escape.

- [ ] **5.7** CHANGELOG + commit:

```bash
git add components/shell .project/CHANGELOG.md
git commit -m "feat(shell): Footer + MenuDrawer + InquiryDrawer" -m "Three-column editorial footer (Maison / Catalogue / Concierge). Right-side drawers with backdrop, Esc + overlay-click + close-button dismiss, manual focus trap. InquiryDrawer renders empty-state until lib/products.ts lands in Task 6." -m "Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: Data layer , products + rituals + i18n catalogue

**Goal:** Typed product catalogue file with all ~17 products (9 migrated from current oils + 8 introduced from prototype). Rituals/subcats/facets data file. EN/FR copy for every product, ritual, page chrome.

**Files:**
- Create: `lib/products.ts`
- Create: `lib/rituals.ts`
- Modify: `messages/en.json`, `messages/fr.json` (extend)

**Reference:** `design_handoff_barbaria/src/data.jsx` (full data shape), existing `messages/en.json` (current oil product copy to preserve).

**Steps:**

- [ ] **6.1** Create `lib/rituals.ts`:

```ts
export type RitualId = "hammam" | "botanical" | "heritage";

export interface World {
  id: RitualId;
  eyebrow: { en: string; fr: string };
  name: { en: string; fr: string };
  tagline: { en: string; fr: string };
  lede: { en: string; fr: string };
  hero: string | null;
}

export const WORLDS: World[] = [
  {
    id: "hammam",
    eyebrow: { en: "Purification", fr: "Purification" },
    name: { en: "The Hammam Ritual", fr: "Le Rituel du Hammam" },
    tagline: { en: "Purification, the cornerstone ritual", fr: "Purification, le rituel fondateur" },
    lede: {
      en: "Black soap, kessa glove and ghassoul clay; the steam, stone and slow heat of the Moroccan hammam, prepared as a corporate ritual.",
      fr: "Savon noir, gant kessa et argile ghassoul; la vapeur, la pierre et la chaleur lente du hammam marocain, préparées en rituel corporate.",
    },
    hero: null, // needs shot
  },
  {
    id: "botanical",
    eyebrow: { en: "Vitality", fr: "Vitalité" },
    name: { en: "Botanical Care", fr: "Soins Botaniques" },
    tagline: { en: "Vitality from the High Atlas", fr: "Vitalité du Haut Atlas" },
    lede: {
      en: "Argan, prickly-pear, neroli and damask rose; single-origin botanicals, cold-pressed and bottled in dark amber glass.",
      fr: "Argan, figue de barbarie, néroli, rose de Damas; botaniques d'origine unique, pressés à froid en flacons d'ambre.",
    },
    hero: "/brand_photos/argan-oil-dropper.jpg",
  },
  {
    id: "heritage",
    eyebrow: { en: "Grounding", fr: "Ancrage" },
    name: { en: "Heritage Gifts", fr: "Cadeaux Héritage" },
    tagline: { en: "Grounding in the artisan's hand", fr: "Ancrage par la main de l'artisan" },
    lede: {
      en: "Berber-woven pouches, hand-loomed throws and engraved cedar boxes; the textile, weave and carpentry of the Kingdom.",
      fr: "Pochettes berbères tissées, plaids tissés main et coffrets en cèdre gravé; le textile, le tissage et la menuiserie du Royaume.",
    },
    hero: "/brand_photos/gift-box-open.jpg",
  },
];

export interface SubCat {
  id: string;
  name: { en: string; fr: string };
}

export const SUBCATS: Record<RitualId, SubCat[]> = {
  hammam: [
    { id: "soaps", name: { en: "Soaps & Cleansers", fr: "Savons & Nettoyants" } },
    { id: "scrubs", name: { en: "Scrubs & Gloves", fr: "Gommages & Gants" } },
    { id: "clays", name: { en: "Clays & Masks", fr: "Argiles & Masques" } },
    { id: "waters", name: { en: "Floral Waters", fr: "Eaux Florales" } },
    { id: "sets", name: { en: "Hammam Sets", fr: "Coffrets Hammam" } },
  ],
  botanical: [
    { id: "face", name: { en: "Face & Neck", fr: "Visage & Cou" } },
    { id: "body", name: { en: "Body Nourishment", fr: "Soins Corps" } },
    { id: "hair", name: { en: "Hair & Scalp", fr: "Cheveux & Cuir Chevelu" } },
    { id: "oils", name: { en: "Pure Oils", fr: "Huiles Pures" } },
    { id: "serums", name: { en: "Serums", fr: "Sérums" } },
  ],
  heritage: [
    { id: "pouches", name: { en: "Pouches & Bags", fr: "Pochettes & Sacs" } },
    { id: "throws", name: { en: "Throws & Cushions", fr: "Plaids & Coussins" } },
    { id: "table", name: { en: "Table & Linen", fr: "Table & Linge" } },
    { id: "wood", name: { en: "Wood & Ceramic", fr: "Bois & Céramique" } },
    { id: "boxes", name: { en: "Engraved Boxes", fr: "Coffrets Gravés" } },
  ],
};

export const FACETS = {
  ingredient: ["Pure Argan", "Prickly Pear", "Neroli Blossom", "Atlas Cedar", "Damask Rose", "Saffron", "Black Soap", "Olive", "Oud", "Honey", "Castor", "Black Seed"],
  use: ["Hydrating", "Exfoliating", "Anti-age", "Purifying", "Soothing", "Energising"],
  format: ["30 ml", "50 ml", "100 ml", "200 ml", "Pot 100 g", "Pot 200 g", "Box", "Set"],
  packaging: ["Amber glass", "Porcelain", "Cedar", "Berber weave", "Recycled card"],
  certif: ["BIO certified", "Fair trade", "Cruelty free", "Vegan"],
} as const;
```

- [ ] **6.2** Create `lib/products.ts`. Combine the 9 migrated current products + 8 introduced from prototype. Schema:

```ts
import type { RitualId } from "./rituals";

export interface Product {
  id: string;
  world: RitualId;
  sub: string;
  name: { en: string; fr: string };
  short: { en: string; fr: string };
  lede?: { en: string; fr: string };
  hero?: boolean;
  tags: string[];
  moq: number;
  formats: string[];
  lead: string;
  origin?: string;
  ritual?: string;
  images: string[];
  application?: Array<{ en: [string, string]; fr: [string, string] }>;
  proof?: string[];
  related?: string[];
}

export const PRODUCTS: Product[] = [
  // ── BOTANICAL , migrated from current site
  {
    id: "huile-argan",
    world: "botanical",
    sub: "oils",
    name: { en: "Pure Argan Oil", fr: "Huile d'Argan Pure" },
    short: { en: "Liquid gold from Morocco.", fr: "L'or liquide du Maroc." },
    lede: {
      en: "Morocco's finest oil, cold-pressed by first mechanical press with no solvents. Golden, light, non-greasy. Rich in vitamin E and omega 6-9.",
      fr: "L'huile la plus fine du Maroc, pressée à froid sans solvants. Dorée, légère, non grasse. Riche en vitamine E et oméga 6-9.",
    },
    tags: ["Pure Argan", "Hydrating", "Amber glass", "BIO certified"],
    moq: 50,
    formats: ["30 ml", "50 ml", "100 ml"],
    lead: "4 weeks",
    origin: "Taliouine Region",
    images: ["/brand_photos/argan-oil-dropper.jpg", "/brand_photos/brand-lifestyle-1.jpg"],
    hero: true,
  },
  // ...8 more migrated entries with similar shape, populated from messages/en.json + existing /cosmetics page data
  // ...8 new prototype entries: beldi-soap, sugar-scrub, ghassoul-clay, kessa-glove, rose-water, hammam-set, berber-pouch, cedar-box
  // Full text for these comes from design_handoff_barbaria/src/data.jsx (PRODUCTS array)
];

// Helpers
export const getProduct = (id: string) => PRODUCTS.find((p) => p.id === id);
export const productsByWorld = (world: RitualId) => PRODUCTS.filter((p) => p.world === world);
export const productsBySub = (world: RitualId, sub: string) => PRODUCTS.filter((p) => p.world === world && p.sub === sub);
export const heroProductsByWorld = (world: RitualId) => PRODUCTS.filter((p) => p.world === world && p.hero);
```

The complete PRODUCTS array (all 17 entries) is documented in the spec at `.project/specs/2026-05-11-stitch-redesign-port-design.md` section 3. Source each entry from:
- Migrated 9: `messages/en.json` `cosmetics.products` + `app/[locale]/cosmetics/page.tsx`
- Introduced 8: `design_handoff_barbaria/src/data.jsx` PRODUCTS array

Image assignments:
- `beldi-soap` → `/brand_photos/savon-noir-2.jpg`, `savon-noir-3.jpg`, `savon-noir-4.jpg`
- `sugar-scrub` → `/brand_photos/sugar-scrub-hammam.jpg`, `sugar-scrub-stacked.jpg`, `sugar-scrub-ingredients.jpg`
- `ghassoul-clay`, `kessa-glove`, `rose-water` → null (gradient fallback)
- `cedar-box` → `/brand_photos/gift-box-open.jpg`, `gift-box-flat.jpg`, `gift-boxes-overhead.jpg`
- `berber-pouch` → null (gradient fallback)
- Oil products (existing) → mostly `/brand_photos/argan-oil-dropper.jpg` + `brand-lifestyle-*.jpg`

- [ ] **6.3** Extend `messages/en.json` with new namespaces: `home` (rewrite for new composition), `rituals` (per-world page chrome), `product` (PDP chrome labels), `story`, `ateliers`, `journal`, `contact` (form labels + occasion options), `inquiry` (drawer + CTAs), `common` (eyebrows, MOQ, formats, etc.). Same shape duplicated in `fr.json` with French translations.

Reference for FR copy: `design_handoff_barbaria/src/data.jsx` `T.fr` block (already has all the strings).

- [ ] **6.4** Run `npm run build`. Expected: exit 0. Verify by importing PRODUCTS in a temporary scratch component if needed.

- [ ] **6.5** CHANGELOG + commit:

```bash
git add lib/products.ts lib/rituals.ts messages/en.json messages/fr.json .project/CHANGELOG.md
git commit -m "feat(data): typed catalogue (17 products) + rituals + i18n copy" -m "Migrates 9 current cosmetics products into Botanical, introduces 8 from Stitch prototype across Hammam + Heritage. Photos sourced from public/brand_photos/, gradient fallback for 5 products lacking shots. Extends messages/{en,fr}.json with new home/rituals/product/story/ateliers/journal/contact/inquiry/common namespaces; old cosmetics/textile/food keys preserved until Task 12 deletes their routes." -m "Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: Home page

**Goal:** Rewrite `app/[locale]/page.tsx` as the new editorial home: Hero (90vh) → CredentialStrip → EditorialBlock → BentoRituals → Heritage3Up.

**Files:**
- Create: `components/home/Hero.tsx`, `CredentialStrip.tsx`, `EditorialBlock.tsx`, `BentoRituals.tsx`, `Heritage3Up.tsx`
- Modify: `app/[locale]/page.tsx`

**Reference:** `design_handoff_barbaria/src/home.jsx` (full composition).

**Steps:**

- [ ] **7.1** Read `design_handoff_barbaria/src/home.jsx` lines 1–237. Note the section structure, exact copy, stagger timings.

- [ ] **7.2** Create `components/home/Hero.tsx`:
  - Container `relative h-[90vh] min-h-[640px]`.
  - `Photo` filling, `priority`, alt from i18n. Source: `null` (gradient fallback) initially , flag as "needs shot" for Atlas photography. When real shot exists, swap to `/brand_photos/atlas-hero.jpg`.
  - Overlay: `<div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(27,48,34,.45),rgba(27,48,34,.85))]" />`.
  - Centered content with stagger using `<Reveal delayMs={N}>`:
    - Eyebrow gold "MAISON DE TERROIR · EST. 1972" (delay 0)
    - `DisplayHeading size="xl"` "Heritage. Refined. *Gifted.*" (italic on second clause) (delay 120)
    - Lede paragraph (delay 220)
    - Two CTAs: primary green-on-gold "Explore the Rituals" → `/rituals/hammam`, ghost white-stroke "B2B Concierge" → `/contact` (delay 320)

- [ ] **7.3** Create `components/home/CredentialStrip.tsx`:
  - `<section className="bg-bb-bg-low border-y border-bb-line py-4 overflow-hidden">`.
  - Inline list of credentials with bullet separators: "100% Sourced from Morocco · 30+ Berber Cooperatives · Made-to-Order · 4-Week Lead".
  - Font: Eyebrow 11px caps tracked, color `text-bb-on-surface-variant`.

- [ ] **7.4** Create `components/home/EditorialBlock.tsx`:
  - Two-column grid `lg:grid-cols-[1.1fr_1fr] gap-16`.
  - Left: large editorial Photo (`/brand_photos/brand-lifestyle-1.jpg`), `aspect-[4/5]`.
  - Right: Eyebrow gold "The Art of Considered Gifting", DisplayHeading lg "An object becomes a *gesture*." (italic second clause), 2-paragraph lede, text link "Read our story →" → `/story`.
  - Reveal stagger entrance.

- [ ] **7.5** Create `components/home/BentoRituals.tsx`:
  - Section heading above grid: Eyebrow + DisplayHeading "Three Worlds, *One Heritage*."
  - Grid `lg:grid-cols-[2fr_1fr] lg:grid-rows-[1.5fr_1fr] gap-4`.
  - Hammam (large, spans rows 1-2 of col 1): photo `/brand_photos/savon-noir-2.jpg`, dark overlay, gold eyebrow "PURIFICATION", serif title "The Hammam Ritual", arrow-up-right icon, link to `/rituals/hammam`.
  - Botanical (small, top of col 2): photo `/brand_photos/argan-oil-dropper.jpg`, eyebrow "VITALITY", link to `/rituals/botanical`.
  - Heritage (medium, bottom of col 2): photo `/brand_photos/gift-box-open.jpg`, eyebrow "GROUNDING", link to `/rituals/heritage`.
  - Text card "Compose your own gift edit." → `/contact`. Place either as 4th cell or inline (handoff has this as text card bottom-right).
  - Each photo card: `transition-transform duration-200`, `hover:scale-[1.02]` on the image, hover translates arrow icon 2px up + right.

- [ ] **7.6** Create `components/home/Heritage3Up.tsx`:
  - Gold pull-quote above grid: serif italic 32px "Every ritual preserves a legacy. Every gift empowers an artisan."
  - 3 cells, each: small Icon (`leaf`, `concierge`, `diamond`), Eyebrow, headline (24px serif), 2-line body.

- [ ] **7.7** Rewrite `app/[locale]/page.tsx`:

```tsx
import { useTranslations } from "next-intl";
import Hero from "@/components/home/Hero";
import CredentialStrip from "@/components/home/CredentialStrip";
import EditorialBlock from "@/components/home/EditorialBlock";
import BentoRituals from "@/components/home/BentoRituals";
import Heritage3Up from "@/components/home/Heritage3Up";
import JsonLd from "@/components/JsonLd";

export default function HomePage() {
  return (
    <>
      <JsonLd />
      <Hero />
      <CredentialStrip />
      <div className="mx-auto max-w-[var(--bb-container)] px-[var(--bb-margin-edge)] space-y-[var(--bb-section-gap)] py-[var(--bb-section-gap)]">
        <EditorialBlock />
        <BentoRituals />
        <Heritage3Up />
      </div>
    </>
  );
}
```

Keep `generateMetadata` , update title + description copy to handoff voice.

- [ ] **7.8** Run `npm run build`. Open `/` in browser. Compare side-by-side with `D:\dev\Havok\BARBARIA\design_handoff_barbaria\Barbaria.html` (open both at same window size). Expect: layout matches, fonts match, colors match, hover/reveal animations work. Capture before/after screenshot for PR.

- [ ] **7.9** CHANGELOG + commit:

```bash
git add components/home app/[locale]/page.tsx .project/CHANGELOG.md
git commit -m "feat(home): new editorial home , Hero + Strip + Editorial + Bento + Heritage3Up" -m "Replaces the legacy 3-category Home with the Stitch composition: 90vh hero with dark green wash + stagger reveal, credentials strip, asymmetric editorial 2-col, bento grid (Hammam large, Botanical small, Heritage medium, text card), Heritage 3-up icon cells with gold pull-quote." -m "Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 8: Category page (`/rituals/[world]`)

**Goal:** One parameterized route serving all three rituals. Each world has its own hero photo, sub-chips, filter rail, sortable product grid.

**Files:**
- Create: `app/[locale]/rituals/[world]/page.tsx`
- Create: `components/category/CategoryHero.tsx`, `SubChips.tsx`, `FilterRail.tsx`, `ProductGrid.tsx`, `ProductCard.tsx`
- Create: `app/[locale]/rituals/[world]/not-found.tsx` (404 for invalid world)

**Reference:** `design_handoff_barbaria/src/pages.jsx` `Category` component (lines ~50–250).

**Steps:**

- [ ] **8.1** Create `app/[locale]/rituals/[world]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { WORLDS, SUBCATS, type RitualId } from "@/lib/rituals";
import { productsByWorld } from "@/lib/products";
import CategoryHero from "@/components/category/CategoryHero";
import CategoryContent from "@/components/category/CategoryContent";

const VALID: RitualId[] = ["hammam", "botanical", "heritage"];

interface PageProps {
  params: Promise<{ locale: string; world: string }>;
}

export async function generateStaticParams() {
  return VALID.flatMap((world) =>
    ["en", "fr"].map((locale) => ({ locale, world }))
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { locale, world } = await params;
  if (!VALID.includes(world as RitualId)) return {};
  const w = WORLDS.find((x) => x.id === world)!;
  const lang = locale === "fr" ? "fr" : "en";
  return {
    title: `${w.name[lang]} | Barbaria Morocco`,
    description: w.lede[lang],
  };
}

export default async function RitualPage({ params }: PageProps) {
  const { locale, world } = await params;
  setRequestLocale(locale);
  if (!VALID.includes(world as RitualId)) notFound();

  const w = WORLDS.find((x) => x.id === world)!;
  const subs = SUBCATS[world as RitualId];
  const products = productsByWorld(world as RitualId);

  return (
    <>
      <CategoryHero world={w} locale={locale} />
      <CategoryContent world={w} subs={subs} products={products} locale={locale} />
    </>
  );
}
```

`CategoryContent` (new file) is the client component owning the filter/sort state, since RSC can't hold `useState`. Pass server-fetched products + WORLD + SUBCATS as props.

- [ ] **8.2** Create `components/category/CategoryHero.tsx`:
  - Full-bleed photo (`fill`) at `h-[70vh]`, dark wash, white type.
  - Centered: Eyebrow gold (world eyebrow), DisplayHeading xl (world name), lede paragraph.
  - Reveal stagger.

- [ ] **8.3** Create `components/category/SubChips.tsx`:
  - Horizontal scrollable text-link row. Active sub-cat: green text + 1px gold underline (`border-b border-bb-secondary`).
  - Props: `subs: SubCat[]`, `active: string | null`, `onChange: (sub: string | null) => void`. Empty active state shows "All" first.

- [ ] **8.4** Create `components/category/FilterRail.tsx`:
  - 280px wide on desktop (`lg:w-[280px]`), hidden on mobile (becomes a drawer triggered by "Filter" button , out of scope this PR, render inline below subs on mobile).
  - Each facet group is a collapsible: heading row with `+/-` Icon, hairline border-bottom.
  - Groups: Ingredient, Application (use), Format, Packaging, Certification. Pull options from `FACETS` in `lib/rituals.ts`.
  - Each option is a checkbox+label. Multiple selection allowed.
  - Selected facets render as removable chips above the grid (in `CategoryContent`).

- [ ] **8.5** Create `components/category/ProductCard.tsx`:
  - Container: `group flex flex-col gap-3`.
  - Photo: `aspect-square` Photo with hover scale `transition-transform group-hover:scale-[1.02]`.
  - Below photo: Eyebrow gold (first ingredient tag), DisplayHeading md (product name), MOQ pill (`<span className="inline-flex items-center px-2 py-1 border border-bb-line text-[11px] uppercase tracking-[0.18em]">MOQ {moq}</span>`), one-line spec (`formats[0] · origin || lead`), two CTAs: `Link` to `/product/[id]` with arrow-right icon, ghost `Add to Inquiry` button calling `useInquiry().add(id)`.
  - On hover: lift 2px (`group-hover:-translate-y-0.5`), arrow translates 2px right.

- [ ] **8.6** Create `components/category/ProductGrid.tsx`:
  - `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12`.
  - Props: `products: Product[]`, `locale: string`.

- [ ] **8.7** Create `components/category/CategoryContent.tsx` (client component):
  - useState for: `activeSub`, `selectedFacets: Record<string, string[]>`, `sort: "rec" | "az" | "moq"`.
  - Filtering logic: filter products by activeSub, then by every selected facet (product.tags must include all selected facet values).
  - Sort: recommended (hero items first then by id), A-Z by name[locale], MOQ ascending.
  - Layout: row with `<aside>` (FilterRail) + `<main>` (SubChips on top, then chip strip of selected facets with `x` to remove, then `Sort` dropdown right-aligned, then ProductGrid).

- [ ] **8.8** Create `app/[locale]/rituals/[world]/not-found.tsx`:

```tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-[600px] py-32 text-center">
      <p className="font-serif text-3xl mb-4">Ritual not found</p>
      <Link href="/" className="text-bb-secondary underline">Return home</Link>
    </div>
  );
}
```

- [ ] **8.9** Run `npm run build`. Open `/en/rituals/botanical` , should render with Hero + grid of 9 oil/serum products. `/en/rituals/hammam` , 5–7 items (some with gradient fallback). `/en/rituals/heritage` , pouches/cedar/etc.

- [ ] **8.10** Test filter: click an ingredient facet, verify grid filters. Click sub-chip, verify sub-filter. Click X on chip, verify reset.

- [ ] **8.11** CHANGELOG + commit:

```bash
git add app/[locale]/rituals components/category .project/CHANGELOG.md
git commit -m "feat(category): /rituals/[world] page with filter rail, sub-chips, sortable grid" -m "Parameterized route for hammam | botanical | heritage. Client-side filtering across ingredient/use/format/packaging/certification facets, A-Z + MOQ sort. ProductCard with hover lift, MOQ pill, Add-to-Inquiry ghost CTA." -m "Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 9: Product detail page (`/product/[id]`)

**Goal:** New `/product/[id]` route. Sticky image stack left, spec column right, then proof strip + application ritual + cooperative band + related row.

**Files:**
- Create: `app/[locale]/product/[id]/page.tsx`
- Create: `components/product/ImageStack.tsx`, `SpecColumn.tsx`, `ProofStrip.tsx`, `ApplicationRitual.tsx`, `CooperativeBand.tsx`, `RelatedRow.tsx`
- Create: `app/[locale]/product/[id]/not-found.tsx`

**Reference:** `design_handoff_barbaria/src/pages.jsx` `Product` component (~line 250–500).

**Steps:**

- [ ] **9.1** Create `app/[locale]/product/[id]/page.tsx`. Use `generateStaticParams` to pre-render all 17 products × 2 locales:

```tsx
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { PRODUCTS, getProduct } from "@/lib/products";
import { WORLDS } from "@/lib/rituals";
import ImageStack from "@/components/product/ImageStack";
import SpecColumn from "@/components/product/SpecColumn";
import ProofStrip from "@/components/product/ProofStrip";
import ApplicationRitual from "@/components/product/ApplicationRitual";
import CooperativeBand from "@/components/product/CooperativeBand";
import RelatedRow from "@/components/product/RelatedRow";

interface PageProps { params: Promise<{ locale: string; id: string }>; }

export async function generateStaticParams() {
  return PRODUCTS.flatMap((p) => ["en", "fr"].map((locale) => ({ locale, id: p.id })));
}

export async function generateMetadata({ params }: PageProps) {
  const { locale, id } = await params;
  const p = getProduct(id);
  if (!p) return {};
  const lang = locale === "fr" ? "fr" : "en";
  return { title: `${p.name[lang]} | Barbaria Morocco`, description: p.short[lang] };
}

export default async function ProductPage({ params }: PageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const p = getProduct(id);
  if (!p) notFound();
  const world = WORLDS.find((w) => w.id === p.world)!;

  return (
    <>
      <div className="mx-auto max-w-[var(--bb-container)] px-[var(--bb-margin-edge)] py-16 grid lg:grid-cols-[1.1fr_1fr] gap-16">
        <ImageStack product={p} />
        <SpecColumn product={p} world={world} locale={locale} />
      </div>
      <ProofStrip product={p} locale={locale} />
      <ApplicationRitual product={p} locale={locale} />
      <CooperativeBand product={p} locale={locale} />
      <RelatedRow product={p} locale={locale} />
    </>
  );
}
```

- [ ] **9.2** Create `components/product/ImageStack.tsx`:
  - Sticky on desktop: `lg:sticky lg:top-[88px] lg:self-start`.
  - Hero image first (Photo, `aspect-square`).
  - Below: vertical stack of secondary shots (max 3, each `aspect-[4/5]` or `aspect-square`).
  - Below the stack: row of small thumbnails. Click a thumb → swap which image is "hero" (client state).

- [ ] **9.3** Create `components/product/SpecColumn.tsx`:
  - Eyebrow gold: `${world.eyebrow.en/fr} · ${product.ritual ?? ""}`.
  - DisplayHeading lg: product name.
  - Italic descriptor (Cormorant italic 22px): product.short.
  - Lede paragraph.
  - Spec list (key/value rows with 1px sandstone separators): MOQ, Formats, Lead time, Origin, Packaging (from tags), Certification (from tags).
  - Primary CTA "Add to Inquiry" (calls `useInquiry().add(id)`, toggles to "Added ✓" for 2s after click).
  - Secondary CTA "Download Spec Sheet (PDF)" → mailto with subject "Spec sheet request: {product.name.en}" for now (no PDF generation this PR).

- [ ] **9.4** Create `components/product/ProofStrip.tsx`:
  - 3 hairline-bordered cells full-width.
  - Each cell: small Icon, body line. Default 3 entries from `product.proof` (e.g. "100% Ancestral Botanicals", "Artisanally Cold-Pressed", "Silicone & Synthetic Free"). If product lacks `proof`, fall back to: ingredient provenance · cooperative · pack format.

- [ ] **9.5** Create `components/product/ApplicationRitual.tsx`:
  - Container full-width with `bg-bb-bg-low py-[var(--bb-section-gap)]`.
  - Heading: Eyebrow + DisplayHeading "How to Use / *The Ritual*".
  - 3 numbered cells (01, 02, 03 in Cormorant 64px gold) with title + 1-line body.
  - Source: `product.application` if present. Otherwise generic placeholder copy.

- [ ] **9.6** Create `components/product/CooperativeBand.tsx`:
  - Full-bleed `bg-bb-primary text-white py-[var(--bb-section-gap)]`.
  - 2-col: left manifesto paragraph + cooperative name, right 3 large stat blocks ("+42% income · 60 artisans · 100% women-led") with Cormorant 72px aged-gold numerals.
  - Stats vary by product origin; default to a generic Barbaria cooperative statement if product.origin doesn't map.

- [ ] **9.7** Create `components/product/RelatedRow.tsx`:
  - 3-up card row of products from `product.related` (if set) or 3 random products from other rituals.
  - Reuses `ProductCard`.

- [ ] **9.8** Create `app/[locale]/product/[id]/not-found.tsx` mirror of category 404.

- [ ] **9.9** Run `npm run build`. Open `/en/product/huile-argan`, `/en/product/beldi-soap`, `/en/product/cedar-box`. Verify layout, sticky image stack, Add-to-Inquiry persistence (refresh → drawer still shows item).

- [ ] **9.10** CHANGELOG + commit:

```bash
git add app/[locale]/product components/product .project/CHANGELOG.md
git commit -m "feat(pdp): /product/[id] with image stack, spec column, proof, ritual, cooperative band" -m "Sticky image stack with thumb swap, two-column key/value spec list with hairline separators, 3-step Application Ritual, full-bleed Cooperative impact band with aged-gold stats, 3-up RelatedRow. Pre-renders 17 products × 2 locales at build." -m "Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 10: Editorial pages , Story / Ateliers / Journal

**Goal:** Three new content pages with the editorial layout patterns. Real placeholder content (not lorem ipsum) sourced from the prototype + Barbaria brand voice.

**Files:**
- Create: `app/[locale]/story/page.tsx`
- Create: `app/[locale]/ateliers/page.tsx`
- Create: `app/[locale]/journal/page.tsx`
- Create: `lib/editorial.ts` (typed content for ateliers + journal cards)

**Reference:** `design_handoff_barbaria/src/pages.jsx` `Story`, `Ateliers`, `Journal` components.

**Steps:**

- [ ] **10.1** Create `lib/editorial.ts`:

```ts
export interface Atelier {
  id: string;
  name: string;
  region: string;
  since: number;
  image: string | null;
  description: { en: string; fr: string };
}

export const ATELIERS: Atelier[] = [
  { id: "taliouine", name: "Taliouine Cooperative", region: "Souss-Massa", since: 1998, image: null,
    description: { en: "Argan harvest and cold-press, 60 women, fair-trade certified.", fr: "Récolte d'argan et pression à froid, 60 femmes, certifié commerce équitable." } },
  { id: "kelaat-mgouna", name: "Kelaat M'Gouna", region: "Dadès Valley", since: 2003, image: null,
    description: { en: "Damask rose distillery, hand-harvested at dawn during the May rose festival.", fr: "Distillerie de rose de Damas, récolte à l'aube pendant la fête des roses en mai." } },
  { id: "tamegroute", name: "Tamegroute Ceramics", region: "Saharan oasis", since: 2010, image: null,
    description: { en: "Eight families of master ceramists working with green-glazed Saharan clay.", fr: "Huit familles de maîtres céramistes travaillant l'argile saharienne au glaçage vert." } },
  { id: "meknes", name: "Meknès Cedar Workshop", region: "Middle Atlas", since: 2007, image: null,
    description: { en: "Engraved cedar boxes, the wood seasoned three years before being cut.", fr: "Coffrets en cèdre gravé, le bois séché trois ans avant d'être travaillé." } },
  { id: "middle-atlas-weavers", name: "Middle Atlas Weavers", region: "Azilal", since: 2012, image: null,
    description: { en: "Boucherouite carpet tradition, undyed Atlas wool, hand-loomed.", fr: "Tradition du tapis boucherouite, laine d'Atlas écrue, tissée main." } },
  { id: "moulouya", name: "Moulouya Clay Co-op", region: "Eastern Morocco", since: 2015, image: null,
    description: { en: "Ghassoul clay mining and sun-drying, mineral-rich from the Moulouya valley.", fr: "Extraction d'argile ghassoul et séchage au soleil, riche en minéraux de la vallée du Moulouya." } },
];

export interface JournalCard {
  id: string;
  kicker: { en: string; fr: string };
  headline: { en: string; fr: string };
  date: string;
  image: string | null;
  feature?: boolean;
}

export const JOURNAL: JournalCard[] = [
  { id: "argan-dispatch", kicker: { en: "Field Notes", fr: "Notes de Terrain" }, headline: { en: "A morning with the women of Taliouine", fr: "Un matin avec les femmes de Taliouine" }, date: "2026-04-20", image: "/brand_photos/brand-lifestyle-2.jpg", feature: true },
  { id: "ghassoul-portrait", kicker: { en: "Portrait", fr: "Portrait" }, headline: { en: "The Moulouya clay-pickers", fr: "Les ramasseurs d'argile du Moulouya" }, date: "2026-03-05", image: null },
  { id: "ritual-rose", kicker: { en: "Ritual", fr: "Rituel" }, headline: { en: "The rose harvest, before the day breaks", fr: "La récolte des roses avant l'aube" }, date: "2026-02-14", image: null },
  { id: "cedar-dispatch", kicker: { en: "Dispatch", fr: "Dépêche" }, headline: { en: "Why cedar takes three years before it can be carved", fr: "Pourquoi le cèdre attend trois ans avant d'être sculpté" }, date: "2026-01-22", image: null },
  { id: "atlas-weavers", kicker: { en: "Field Notes", fr: "Notes de Terrain" }, headline: { en: "A loom in the Azilal foothills", fr: "Un métier à tisser dans les piémonts d'Azilal" }, date: "2025-12-08", image: null },
  { id: "saffron-dispatch", kicker: { en: "Dispatch", fr: "Dépêche" }, headline: { en: "Saffron season in Taliouine: 200 flowers for one gram", fr: "La saison du safran à Taliouine: 200 fleurs pour un gramme" }, date: "2025-11-15", image: null },
];
```

- [ ] **10.2** Create `app/[locale]/story/page.tsx`:
  - Atlas hero (60vh, gradient placeholder + dark wash, eyebrow + display heading + lede).
  - Three alternating chapter spreads:
    - 01 *Origin* , left photo (gradient), right text "Maison de Terroir, est. 1972..." (2 paragraphs).
    - 02 *Method* , right photo, left text.
    - 03 *Object* , left photo, right text.
  - Pull-quote between Chapters 02 and 03 (gold serif italic 32px centered).
  - All copy sourced from the prototype + Barbaria About page existing copy in `messages/en.json`.

- [ ] **10.3** Create `app/[locale]/ateliers/page.tsx`:
  - Section hero: Eyebrow "OUR COOPERATIVES", DisplayHeading "Six ateliers, *one Kingdom*.", lede.
  - 6-up grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12`).
  - Each card: square Photo (gradient fallback when image null), DisplayHeading md (atelier.name), eyebrow (region + since), 1-line description.

- [ ] **10.4** Create `app/[locale]/journal/page.tsx`:
  - Section hero: Eyebrow "JOURNAL", DisplayHeading "Field notes, dispatches, portraits.".
  - Mixed-size grid: feature card spans full row at top (large 4:5 photo + headline overlay or below), then 5 standard cards in 3-col grid below.
  - Each card has `aria-disabled="true"` on the wrapper Link since article pages don't exist. Visual cue (slight reduced opacity on hover) signals "coming soon".

- [ ] **10.5** Run `npm run build`. Verify all three render in EN and FR.

- [ ] **10.6** CHANGELOG + commit:

```bash
git add app/[locale]/story app/[locale]/ateliers app/[locale]/journal lib/editorial.ts .project/CHANGELOG.md
git commit -m "feat(editorial): Story + Ateliers + Journal layout pages" -m "Story: 3 alternating chapter spreads + pull-quote. Ateliers: 6-up cooperative grid with gradient placeholders pending photography. Journal: feature card + 5 standard cards, cards link nowhere (aria-disabled) until article content is written in a follow-up." -m "Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 11: Contact + inquiry submit

**Goal:** Replace `app/[locale]/contact/page.tsx` with the 2-step concierge form + sticky inquiry sidebar. Submit serializes to `mailto:` body, opens user's mail client.

**Files:**
- Modify: `app/[locale]/contact/page.tsx`
- Create: `components/contact/TwoStepForm.tsx`, `InquirySidebar.tsx`
- Create: `lib/inquiry-mailto.ts` (pure function building the mailto body)

**Steps:**

- [ ] **11.1** Create `lib/inquiry-mailto.ts`:

```ts
import type { Product } from "./products";

export interface InquiryFormData {
  company: string;
  contactName: string;
  email: string;
  phone: string;
  quantity: string;
  eventDate: string;
  occasion: string;
  message: string;
  locale: string;
}

const MAX_BODY = 1800;
const RECIPIENT = "concierge@barbariamorocco.com";

export function buildMailto(form: InquiryFormData, items: Array<{ product: Product; qty: number }>): string {
  const subject = `B2B Inquiry , ${form.company || form.contactName} , ${items.length} item(s)`;

  const lines: string[] = [];
  lines.push("BARBARIA · B2B Inquiry");
  lines.push("");
  lines.push("── House ───────────────");
  lines.push(`Company:      ${form.company}`);
  lines.push(`Contact:      ${form.contactName}`);
  lines.push(`Email:        ${form.email}`);
  lines.push(`Phone:        ${form.phone}`);
  lines.push("");
  lines.push("── Occasion ────────────");
  lines.push(`Quantity:     ${form.quantity}`);
  lines.push(`Event date:   ${form.eventDate}`);
  lines.push(`Occasion:     ${form.occasion}`);
  lines.push(`Locale:       ${form.locale}`);
  lines.push("");
  lines.push("── Message ─────────────");
  lines.push(form.message || "(none)");
  lines.push("");
  lines.push(`── Inquiry list (${items.length}) ──`);
  const trimmed = items.slice(0, 20);
  for (const { product, qty } of trimmed) {
    lines.push(`• ${product.name[form.locale === "fr" ? "fr" : "en"]} × ${qty} (MOQ ${product.moq}, lead ${product.lead}) , ${product.id}`);
  }
  if (items.length > trimmed.length) {
    lines.push(`...and ${items.length - trimmed.length} more (full list available on request)`);
  }

  const body = lines.join("\n");
  const safeBody = body.length > MAX_BODY ? body.slice(0, MAX_BODY) + "\n[truncated]" : body;
  return `mailto:${RECIPIENT}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(safeBody)}`;
}
```

- [ ] **11.2** Create `components/contact/TwoStepForm.tsx`:
  - State: form fields, step (1 | 2), submitted (bool).
  - Step 01 "Your Maison": Company, Contact Name, Email, Phone (hairline `border-b border-bb-line` inputs, no box).
  - Step 02 "The Occasion": Quantity (number), Event Date (date), Occasion (select: Year-end, Onboarding, Anniversary, Press, Wedding-corporate, Other), Free-text Message.
  - Each step: green numeral (Cormorant 48px) + serif sub-heading. Labels caps + tracked.
  - Honeypot field: hidden `<input name="company_website" tabIndex={-1} autoComplete="off" aria-hidden />`. If filled, abort submit silently.
  - Submit handler: build mailto via `buildMailto`, `window.location.href = mailto`. Set `submitted=true` immediately.
  - Success state: replaces form. Gold check icon (3xl Icon), "Thank you, we'll be in touch within 24h." + "Your concierge has been assigned."

- [ ] **11.3** Create `components/contact/InquirySidebar.tsx`:
  - Sticky `lg:sticky lg:top-[88px]` 30% width.
  - Title: Eyebrow gold "Your Selection", count.
  - Item list: thumb + name + qty + remove (X icon). Empty state: italic "No pieces selected yet."
  - Below list: direct lines (Paris, Casablanca, WhatsApp link, atelier address), Eyebrow per heading.

- [ ] **11.4** Rewrite `app/[locale]/contact/page.tsx`:

```tsx
import { setRequestLocale } from "next-intl/server";
import TwoStepForm from "@/components/contact/TwoStepForm";
import InquirySidebar from "@/components/contact/InquirySidebar";

interface PageProps { params: Promise<{ locale: string }>; }

export default async function ContactPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="mx-auto max-w-[var(--bb-container)] px-[var(--bb-margin-edge)] py-[var(--bb-section-gap)] grid lg:grid-cols-[1.7fr_1fr] gap-16">
      <TwoStepForm locale={locale} />
      <InquirySidebar locale={locale} />
    </div>
  );
}
```

Keep `generateMetadata` from existing page, update copy.

- [ ] **11.5** Run `npm run build`. Manually test: fill form, click submit, mail client opens with structured body. Inspect mailto URL , body decoded, items + form fields visible, < 1800 chars.

- [ ] **11.6** CHANGELOG + commit:

```bash
git add app/[locale]/contact components/contact lib/inquiry-mailto.ts .project/CHANGELOG.md
git commit -m "feat(contact): 2-step concierge form + sticky inquiry sidebar + mailto submit" -m "Hairline-bottom-border inputs, two-step structure (Maison / Occasion), honeypot anti-spam, success state replaces form. Submit builds structured mailto body with full inquiry list (truncated past 20 items)." -m "Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 12: Redirects + retire old routes

**Goal:** Add 301 redirects via `next.config.ts` `redirects` config. Delete the old route directories. Remove the temporary `useCart` alias from `inquiry-context`. Update `app/sitemap.ts` to reflect the new IA.

**Files:**
- Modify: `next.config.ts` (add `redirects()` config)
- Modify: `lib/inquiry-context.tsx` (remove `useCart` alias + warning)
- Modify: `app/sitemap.ts`
- Delete: `app/[locale]/about/`, `app/[locale]/cosmetics/`, `app/[locale]/food/`, `app/[locale]/textile/`, `app/[locale]/order/`, `components/cosmetics/`, `components/order/`, `components/Navbar.tsx`, `components/Footer.tsx`

**Reference:** `node_modules/next/dist/docs/01-app/02-guides/redirecting.md`

**Steps:**

- [ ] **12.1** Modify `next.config.ts` to add `redirects()`:

```ts
const nextConfig: NextConfig = {
  turbopack: { root: path.resolve(__dirname) },
  images: { formats: ["image/avif", "image/webp"] },
  async redirects() {
    const PAIRS = [
      { from: "/cosmetics",       to: "/rituals/botanical" },
      { from: "/cosmetics/:path*", to: "/rituals/botanical" },
      { from: "/textile",         to: "/rituals/heritage" },
      { from: "/textile/:path*",  to: "/rituals/heritage" },
      { from: "/food",            to: "/rituals/heritage" },
      { from: "/food/:path*",     to: "/rituals/heritage" },
      { from: "/order",           to: "/contact" },
      { from: "/order/:path*",    to: "/contact" },
      { from: "/about",           to: "/story" },
    ];
    const out: Array<{ source: string; destination: string; permanent: true }> = [];
    for (const { from, to } of PAIRS) {
      out.push({ source: from, destination: to, permanent: true });
      // Locale-prefixed variants (en, fr) , next-intl serves both
      out.push({ source: `/en${from}`, destination: `/en${to}`, permanent: true });
      out.push({ source: `/fr${from}`, destination: `/fr${to}`, permanent: true });
    }
    return out;
  },
  async headers() { /* unchanged */ },
};
```

- [ ] **12.2** Verify next-intl locale prefix strategy. Check `i18n/routing.ts`:
  - If `localePrefix: "as-needed"` (default locale unprefixed), only `/fr` variants are needed for FR; bare paths work for EN.
  - If `localePrefix: "always"`, both `/en` and `/fr` variants are needed.
  Adjust PAIRS list accordingly. Test with `curl -I http://localhost:3000/cosmetics` , expect `301 → /rituals/botanical`.

- [ ] **12.3** Delete old directories:

```bash
git rm -r app/[locale]/about app/[locale]/cosmetics app/[locale]/food app/[locale]/textile app/[locale]/order
git rm -r components/cosmetics components/order   # if they exist
git rm components/Navbar.tsx components/Footer.tsx
```

- [ ] **12.4** Edit `lib/inquiry-context.tsx`: delete the `useCart` alias + console.warn lines (clean break now).

- [ ] **12.5** Update `app/sitemap.ts` to enumerate the new routes:

```ts
import type { MetadataRoute } from "next";
import { PRODUCTS } from "@/lib/products";

const BASE = "https://barbariamorocco.com";
const LOCALES = ["en", "fr"];
const STATIC_ROUTES = ["", "/rituals/hammam", "/rituals/botanical", "/rituals/heritage", "/story", "/ateliers", "/journal", "/contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  for (const locale of LOCALES) {
    for (const r of STATIC_ROUTES) entries.push({ url: `${BASE}/${locale}${r}`, changeFrequency: "monthly", priority: r === "" ? 1 : 0.7 });
    for (const p of PRODUCTS) entries.push({ url: `${BASE}/${locale}/product/${p.id}`, changeFrequency: "monthly", priority: 0.6 });
  }
  return entries;
}
```

- [ ] **12.6** Remove old keys from `messages/en.json` and `fr.json`: `cosmetics`, `food`, `textile`, `order`, `about` namespaces (entire sub-objects).

- [ ] **12.7** Run `npm run build`. Expected: exit 0, fewer routes in the route table, sitemap.ts emits new URLs.

- [ ] **12.8** Manual test redirects:

```bash
# from dev server
curl -sI http://localhost:3000/cosmetics    | grep -E "(HTTP|Location)"
curl -sI http://localhost:3000/en/cosmetics | grep -E "(HTTP|Location)"
curl -sI http://localhost:3000/fr/textile   | grep -E "(HTTP|Location)"
curl -sI http://localhost:3000/order        | grep -E "(HTTP|Location)"
```
Expected: each returns `301` with `Location:` pointing at the new path.

- [ ] **12.9** CHANGELOG + commit:

```bash
git add -A .project/CHANGELOG.md
git commit -m "feat(routing): retire /cosmetics, /food, /textile, /order, /about with 301 redirects" -m "Old routes 301 to their new ritual / contact / story equivalents (locale-prefixed and bare). Sitemap regenerated for new IA. lib/inquiry-context drops the temporary useCart alias. Old Navbar/Footer components deleted." -m "Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 13: Tests , Playwright smoke + functional + a11y

**Goal:** Add Playwright with three suites: route smoke, functional (inquiry flow + locale switch), and axe-core a11y on 4 key pages.

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/smoke.spec.ts`
- Create: `tests/functional.spec.ts`
- Create: `tests/a11y.spec.ts`
- Modify: `package.json` (add devDeps + scripts)

**Steps:**

- [ ] **13.1** Install devDeps:

```bash
npm install -D @playwright/test @axe-core/playwright
npx playwright install --with-deps chromium
```

- [ ] **13.2** Add to `package.json` scripts: `"test": "playwright test"`, `"test:headed": "playwright test --headed"`.

- [ ] **13.3** Create `playwright.config.ts`:

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});
```

- [ ] **13.4** Create `tests/smoke.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

const ROUTES = [
  "/",
  "/rituals/hammam",
  "/rituals/botanical",
  "/rituals/heritage",
  "/product/huile-argan",
  "/product/beldi-soap",
  "/story",
  "/ateliers",
  "/journal",
  "/contact",
];

for (const locale of ["en", "fr"]) {
  for (const route of ROUTES) {
    test(`200 OK: /${locale}${route}`, async ({ page }) => {
      const r = await page.goto(`/${locale}${route}`);
      expect(r?.status()).toBeLessThan(400);
      await expect(page.locator("header")).toBeVisible();
    });
  }
}

const REDIRECTS = [
  { from: "/cosmetics",       to: "/rituals/botanical" },
  { from: "/textile",         to: "/rituals/heritage" },
  { from: "/food",            to: "/rituals/heritage" },
  { from: "/order",           to: "/contact" },
  { from: "/about",           to: "/story" },
];

for (const { from, to } of REDIRECTS) {
  test(`301: ${from} → ${to}`, async ({ request }) => {
    const r = await request.get(from, { maxRedirects: 0 });
    expect([301, 308]).toContain(r.status());
    expect(r.headers().location).toContain(to);
  });
}
```

- [ ] **13.5** Create `tests/functional.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test("add product to inquiry, persists across reload, appears in contact sidebar", async ({ page }) => {
  await page.goto("/en/product/beldi-soap");
  await page.getByRole("button", { name: /add to inquiry/i }).click();
  await expect(page.getByRole("button", { name: /added/i })).toBeVisible();

  await page.reload();
  await page.goto("/en/contact");
  await expect(page.getByText(/Beldi Black Soap/i)).toBeVisible();
});

test("locale toggle preserves route", async ({ page }) => {
  await page.goto("/en/rituals/hammam");
  await page.getByRole("link", { name: "FR" }).click();
  await expect(page).toHaveURL(/\/fr\/rituals\/hammam/);
});

test("inquiry mailto link contains structured body", async ({ page }) => {
  await page.goto("/en/product/huile-argan");
  await page.getByRole("button", { name: /add to inquiry/i }).click();
  await page.goto("/en/contact");

  await page.getByLabel(/Company/i).fill("Acme Hospitality");
  await page.getByLabel(/Contact Name/i).fill("Jane Doe");
  await page.getByLabel(/Email/i).fill("jane@acme.test");
  await page.getByLabel(/Phone/i).fill("+33 1 23 45 67 89");
  // step 2
  await page.getByRole("button", { name: /continue|next|02/i }).click();
  await page.getByLabel(/Quantity/i).fill("500");
  await page.getByLabel(/Event date/i).fill("2026-12-01");
  await page.getByLabel(/Occasion/i).selectOption({ label: /Year-end/i });

  const submit = page.getByRole("button", { name: /request|submit/i });
  const href = await submit.getAttribute("data-mailto");
  expect(href).toContain("mailto:concierge@barbariamorocco.com");
  expect(decodeURIComponent(href!)).toContain("Acme Hospitality");
  expect(decodeURIComponent(href!)).toContain("Pure Argan Oil");
});
```

(The form's submit button gets a `data-mailto` attribute set client-side as it builds the URL , this lets us assert without actually triggering the mail client. Update `TwoStepForm.tsx` accordingly if not already.)

- [ ] **13.6** Create `tests/a11y.spec.ts`:

```ts
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const PAGES = ["/", "/rituals/hammam", "/product/beldi-soap", "/contact"];

for (const path of PAGES) {
  test(`axe a11y: ${path}`, async ({ page }) => {
    await page.goto(`/en${path === "/" ? "" : path}`);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious).toEqual([]);
  });
}
```

- [ ] **13.7** Run `npm run build` first (smoke uses production build is faster but `webServer: npm run dev` is fine for now). Then `npm test`. Iterate until all green.

- [ ] **13.8** Add `tests/`, `playwright-report/`, `test-results/` to `.gitignore` (only the report/results, NOT the tests).

- [ ] **13.9** CHANGELOG + commit:

```bash
git add tests playwright.config.ts package.json package-lock.json .gitignore .project/CHANGELOG.md
git commit -m "test: Playwright smoke + functional + a11y suites" -m "20 smoke tests cover all routes EN+FR + all 5 retired-route 301s. Functional: inquiry persists, locale toggle, mailto serialization. A11y: axe-core scan on Home + 1 category + 1 PDP + Contact, zero serious/critical." -m "Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 14: Final QA + PR

**Goal:** Production build verification, Lighthouse scoring, screenshot capture, PR open against `master`.

**Steps:**

- [ ] **14.1** Run `npm run build`. Expected: exit 0, no warnings, full route table including new pages.

- [ ] **14.2** Run `npm test`. All green.

- [ ] **14.3** `npm run start` to serve production build. In a new terminal:

```bash
npx lighthouse http://localhost:3000/ --only-categories=performance,accessibility,best-practices,seo --chrome-flags="--headless" --output=html --output-path=./.project/lighthouse-home.html
```

Expected: Performance ≥ 90, Accessibility 100, Best Practices ≥ 95, SEO ≥ 95. LCP < 2.5s. CLS < 0.1.

- [ ] **14.4** Capture before/after screenshots for the PR description:
  - `/` (Home) , before from old `master`, after from current branch
  - `/rituals/botanical` (was `/cosmetics`) , before/after
  - `/contact` (was `/order`) , before/after
  - `/product/huile-argan` (new) , after only
  Save into `.project/screenshots/` (git-add and commit them).

- [ ] **14.5** Write PR body covering:
  - **Summary** , 2 sentences on what landed.
  - **Scope** , what's in (frontend redesign port), what's out (CMS, real backend, admin, analytics , link to `_backlog.md`).
  - **Routing changes** , list of redirects.
  - **Taxonomy** , link to decision in `DECISIONS.md`.
  - **Needs shot** , list of placeholder photo slots: Atlas hero, Hammam hero, Botanical hero, Heritage hero, Ghassoul clay product, Kessa glove product, Rose water product, all 6 ateliers, 5 of 6 journal cards. Per slot: desired composition note.
  - **Tests** , Playwright suite summary, Lighthouse score.
  - **Followups** , Sprint 2 (admin + DB), Sprint 3 (inquiry backend + analytics).

- [ ] **14.6** Final CHANGELOG entry "Sprint 1 complete; opening PR".

- [ ] **14.7** Commit screenshot folder + final CHANGELOG:

```bash
git add .project/screenshots .project/CHANGELOG.md .project/lighthouse-home.html
git commit -m "docs(qa): add before/after screenshots + Lighthouse Home report" -m "Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

- [ ] **14.8** Push and open PR:

```bash
git push
gh pr create --base master --head feat/stitch-redesign --title "feat: Stitch redesign port , Barbaria Modern Maghreb Rituals" --body-file .project/pr-body.md
```

(Write `.project/pr-body.md` first with the content from 14.5. Don't commit it before the PR command , `gh pr create` reads it, then we can commit it after for record.)

- [ ] **14.9** Verify PR rendered correctly on GitHub. Link → request review (Taha is the only reviewer; he merges when satisfied).

---

## Risk register (revisit at each task)

| Risk | Trigger | Action |
|---|---|---|
| Tailwind 4 `@theme` rejects `var(...)` mapping | Task 1.5 build fails | Fall back to `@layer utilities` hand-written classes |
| next/font Cormorant Garamond italic-only weights unavailable | Task 1.6 build emits font warning | Drop italics from Cormorant config, use Playfair italic instead |
| `next-intl` `localePrefix` strategy differs from assumption | Task 12.2 redirect test fails for one locale | Read `i18n/routing.ts`, adjust redirect PAIRS list |
| Inquiry mailto URL > 2000 chars on long lists | Functional test in Task 13.5 fails | Already mitigated by `MAX_BODY` slicing in `buildMailto` |
| Playwright `webServer` race on first run | Task 13.7 hangs | Run `npm run dev` manually in one terminal, drop `webServer` from config |
| Image `priority` on the hero LCP blocks other CSS load | Lighthouse < 90 in 14.3 | Inspect waterfall, may need `preload` on the hero, or move from `priority` to `loading="eager"` |
| Old `messages/en.json` keys still referenced somewhere after 12.6 | Build fails after key deletion | Search for `t("cosmetics.*")` etc. before deleting, fix or migrate references |

---

## Self-review

Spec coverage check (skim each Sprint 1 spec section):
- ✅ Goal → Task 7 (home), 8 (category), 9 (PDP), 10 (editorial), 11 (contact)
- ✅ Design tokens → Task 1
- ✅ Typography → Task 1
- ✅ Primitives (Reveal, Photo, Eyebrow, DisplayHeading, Icon) → Task 2
- ✅ Inquiry context migration → Task 3
- ✅ Shell (Header / Footer / drawers) → Tasks 4 + 5
- ✅ Data layer + i18n → Task 6
- ✅ Routes: home, category, PDP, story, ateliers, journal, contact → Tasks 7–11
- ✅ Redirects → Task 12
- ✅ Test strategy → Task 13
- ✅ Build + Lighthouse + PR → Task 14
- ✅ DoD items list → checked across all tasks

Placeholder scan: zero `TBD`/`TODO`/`add appropriate` , all step content is concrete with code or commands.

Type consistency: `useInquiry`, `useInquiry().add(id)`, `totalItems`, `items`, `Product`, `WORLDS`, `SUBCATS` referenced consistently across tasks.

No gaps found vs spec section 10 (Definition of Done).

---

## Execution

Two execution options for Taha:

**1. Subagent-Driven (recommended)** , I dispatch one fresh subagent per task (Sonnet for boilerplate tasks 1–11, Opus for Tasks 12 + 13 + 14 which touch routing, tests, and final QA). I review each task's commit before the next dispatch.

**2. Inline Execution** , I execute every task in this session, committing as I go, surfacing checkpoints after Tasks 3 / 6 / 9 / 12 / 14.

Per the user's PM grant ("you are the project manager, agents are your devs"), Option 1 is the natural fit.
