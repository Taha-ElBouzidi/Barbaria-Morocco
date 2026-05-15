import { cn } from "@/lib/utils";

interface EyebrowProps {
  children: React.ReactNode;
  className?: string;
  tone?: "gold" | "gold-deep" | "green" | "muted";
}

/**
 * Eyebrow tones:
 * - "gold"      → bright gold (#c5a059). Use ONLY on dark/brown surfaces; fails
 *                 WCAG AA on cream (2.82:1).
 * - "gold-deep" → antique gold (#8B6A2E). Use on cream surfaces; passes AA.
 * - "green"     → brand primary (now brown). Body-text contrast on cream.
 * - "muted"     → on-surface-variant grey for legal / secondary contexts.
 */
export default function Eyebrow({ children, className, tone = "gold" }: EyebrowProps) {
  const toneClass =
    tone === "gold"
      ? "text-bb-secondary"
      : tone === "gold-deep"
        ? "text-bb-secondary-deep"
        : tone === "green"
          ? "text-bb-primary"
          : "text-bb-on-surface-variant";
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
