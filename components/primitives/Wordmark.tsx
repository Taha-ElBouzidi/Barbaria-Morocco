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
   * For "hero": show the "ⵣ · Morocco · ⵣ" line under BARBARIA.
   */
  showSubtitle?: boolean;
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
}: WordmarkProps) {
  const colorClass =
    tone === "gold" ? "text-bb-secondary"
    : tone === "light" ? "text-white"
    : "text-bb-primary";

  // Sizes are the TOTAL composite height in px. Pieces auto-scale
  // using the source artwork's ratios (186:35:88:50:50). Header lives
  // in a 72px bar so the compact mark gets ~56px of vertical room;
  // footer is a destination area that can carry a much bigger mark.
  if (variant === "compact") {
    return (
      <span className={cn("inline-block", colorClass, className)}>
        <BrandMark size={46} variant="name" />
      </span>
    );
  }

  if (variant === "hero") {
    // Layout: ornament, BARBARIA, then a single "ⵣ · Morocco · ⵣ"
    // line below the wordmark. "Morocco" is never translated so the
    // brand reads the same on /fr and /en; the Tifinagh marks bracket
    // it on both sides.
    return (
      <div className={cn("flex flex-col items-center gap-4", className, colorClass)}>
        <BrandMark size={80} variant="ornament" />
        <h1
          className="font-display font-bold leading-[0.95] tracking-[0.04em] uppercase"
          style={{ fontSize: "clamp(56px, 10vw, 112px)" }}
        >
          Barbaria
        </h1>
        {showSubtitle && (
          <div
            className="flex items-center gap-3 font-display uppercase opacity-85"
            style={{ fontSize: "clamp(15px, 2vw, 22px)", letterSpacing: "0.55em" }}
          >
            <span aria-hidden>ⵣ</span>
            <span>·&nbsp;Morocco&nbsp;·</span>
            <span aria-hidden>ⵣ</span>
          </div>
        )}
      </div>
    );
  }

  // stacked (default, footer/drawer). Block + text-center so the
  // inline-flex BrandMark child sits horizontally centred inside
  // whatever container the wordmark drops into. The previous
  // inline-block + mx-auto did not centre on inline-flex content.
  return (
    <span className={cn("block text-center", colorClass, className)}>
      <BrandMark size={180} variant={showSubtitle ? "full" : "name"} />
    </span>
  );
}
