import BrandMark from "./BrandMark";
import { cn } from "@/lib/utils";

type WordmarkVariant = "compact" | "stacked" | "hero";
type WordmarkTone = "dark" | "light" | "gold";

interface WordmarkProps {
  variant?: WordmarkVariant;
  tone?: WordmarkTone;
  className?: string;
  /**
   * For "stacked": show MOROCCO subtitle. Default true.
   * For "compact": ignored (compact is always name-only).
   */
  showSubtitle?: boolean;
  /** Country tagline shown on the hero variant. Defaults to "Maroc". */
  tagline?: string;
}

/**
 * Wordmark, the Barbaria brand identity, rendered from the inline
 * BrandMark SVG so it inherits the parent's text colour via
 * `currentColor`. Works on any surface (cream, sahara, gold, dark)
 * in any colour without per-surface assets.
 *
 * Variants:
 *  - compact: small "ornament + BARBARIA" for the header
 *  - stacked: medium "ornament + BARBARIA + MOROCCO" for the footer
 *  - hero:    the ornament alone on top, the huge wordmark composed
 *             in Playfair below with the Tifinagh tagline line in
 *             between (kept custom because the homepage hero needs
 *             responsive typography that the static SVG cannot give)
 */
export default function Wordmark({
  variant = "stacked",
  tone = "dark",
  className,
  showSubtitle = true,
  tagline = "Maroc",
}: WordmarkProps) {
  const colorClass =
    tone === "gold" ? "text-bb-secondary"
    : tone === "light" ? "text-white"
    : "text-bb-primary";

  if (variant === "compact") {
    return (
      <span className={cn("inline-block", colorClass, className)}>
        <BrandMark size={42} variant="name" />
      </span>
    );
  }

  if (variant === "hero") {
    return (
      <div className={cn("flex flex-col items-center gap-4", className, colorClass)}>
        <BrandMark size={36} variant="ornament" />
        <div
          className={cn(
            "flex items-center gap-3 font-display uppercase",
            tone === "light" ? "text-bb-secondary-fixed-dim" : "text-bb-secondary"
          )}
          style={{ fontSize: "13px", letterSpacing: "0.4em" }}
        >
          <span aria-hidden>ⵣ</span>
          <span>·&nbsp;{tagline}&nbsp;·</span>
          <span aria-hidden>ⵣ</span>
        </div>
        <h1
          className="font-display font-bold leading-[0.95] tracking-[0.04em] uppercase"
          style={{ fontSize: "clamp(56px, 10vw, 112px)" }}
        >
          Barbaria
        </h1>
        {showSubtitle && (
          <span
            className="font-display uppercase opacity-80"
            style={{ fontSize: "clamp(15px, 2vw, 22px)", letterSpacing: "0.55em" }}
          >
            Morocco
          </span>
        )}
      </div>
    );
  }

  // stacked (default, footer/drawer)
  return (
    <span className={cn("inline-block", colorClass, className)}>
      <BrandMark size={100} variant={showSubtitle ? "full" : "name"} />
    </span>
  );
}
