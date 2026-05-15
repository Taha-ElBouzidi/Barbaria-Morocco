import AmazighOrnament from "./AmazighOrnament";
import { cn } from "@/lib/utils";

type WordmarkVariant = "compact" | "stacked" | "hero";
type WordmarkTone = "dark" | "light" | "gold";

interface WordmarkProps {
  variant?: WordmarkVariant;
  tone?: WordmarkTone;
  className?: string;
  /**
   * When true (default for "compact"), Maroc/Morocco subtitle is hidden.
   * Header uses the compact wordmark so the BARBARIA word reads on a 72px bar.
   */
  showSubtitle?: boolean;
  /** Country tagline shown between Tifinagh marks on the hero variant.
   *  Defaults to "Maroc"; pass "Morocco" on EN routes. */
  tagline?: string;
}

/**
 * Wordmark, typographic brand mark, "BARBARIA / MOROCCO" set in the
 * display serif, optionally crowned by the Amazigh diamond ornament.
 *
 * Variants:
 * - compact:  small inline word, header use. No ornament, no subtitle.
 * - stacked:  ornament above, BARBARIA + MOROCCO stacked. Footer / drawer.
 * - hero:     full composition with the "⵿ · MAROC · ⵿" tagline line,
 *             enormous BARBARIA, MOROCCO subtitle. Homepage hero only.
 *
 * Tones map to the surrounding surface: "light" on dark heroes, "dark"
 * everywhere else. Gold ornament + brand-primary type by default.
 */
export default function Wordmark({
  variant = "stacked",
  tone = "dark",
  className,
  showSubtitle,
  tagline = "Maroc",
}: WordmarkProps) {
  const subtitleVisible = showSubtitle ?? variant !== "compact";
  const wordmarkColor =
    tone === "gold" ? "text-bb-secondary"
    : tone === "light" ? "text-white"
    : "text-bb-primary";
  const subtitleColor =
    tone === "gold" ? "text-bb-secondary/80"
    : tone === "light" ? "text-white/70"
    : "text-bb-on-surface-variant";

  if (variant === "compact") {
    return (
      <span className={cn("inline-flex items-center gap-2.5", className)}>
        <AmazighOrnament size={20} className="text-bb-secondary shrink-0" />
        <span
          className={cn(
            "font-display font-semibold leading-none tracking-[0.06em] uppercase",
            wordmarkColor
          )}
          style={{ fontSize: "20px" }}
        >
          Barbaria
        </span>
      </span>
    );
  }

  if (variant === "hero") {
    return (
      <div className={cn("flex flex-col items-center gap-4", className)}>
        <AmazighOrnament size={36} className="text-bb-secondary" />
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
          className={cn(
            "font-display font-bold leading-[0.95] tracking-[0.04em] uppercase",
            wordmarkColor
          )}
          style={{ fontSize: "clamp(56px, 10vw, 112px)" }}
        >
          Barbaria
        </h1>
        {subtitleVisible && (
          <span
            className={cn("font-display uppercase", subtitleColor)}
            style={{ fontSize: "clamp(15px, 2vw, 22px)", letterSpacing: "0.55em" }}
          >
            Morocco
          </span>
        )}
      </div>
    );
  }

  // stacked (default, used in footer, menu drawer)
  return (
    <div className={cn("flex flex-col items-center gap-2.5", className)}>
      <AmazighOrnament size={26} className="text-bb-secondary" />
      <span
        className={cn(
          "font-display font-bold leading-none tracking-[0.06em] uppercase",
          wordmarkColor
        )}
        style={{ fontSize: "32px" }}
      >
        Barbaria
      </span>
      {subtitleVisible && (
        <span
          className={cn("font-display uppercase", subtitleColor)}
          style={{ fontSize: "11px", letterSpacing: "0.4em" }}
        >
          Morocco
        </span>
      )}
    </div>
  );
}
