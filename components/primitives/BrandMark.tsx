import BrandOrnament from "./BrandOrnament";
import BrandWordmark from "./BrandWordmark";
import BrandSubtitle from "./BrandSubtitle";
import { cn } from "@/lib/utils";

interface BrandMarkProps {
  /** Rendered height of the BARBARIA wordmark in pixels. Ornament + subtitle scale proportionally. */
  size?: number;
  className?: string;
  /** What portion of the mark to compose. Default "name" = ornament + BARBARIA. */
  variant?: "full" | "name" | "ornament";
}

/**
 * BrandMark, the Barbaria identity composed from three independent
 * SVG primitives (BrandOrnament + BrandWordmark + BrandSubtitle).
 * Inherits the parent's text colour via `currentColor`.
 *
 * Each piece is also exported as its own component if a page needs
 * just the ornament glyph, or only the wordmark, or only the subtitle.
 */
export default function BrandMark({ size = 80, className, variant = "name" }: BrandMarkProps) {
  // Each piece's pixel height is derived from the wordmark `size` so
  // they read at the same proportions they have in the source artwork
  // (ornament ~62% of wordmark height, subtitle ~42%).
  const ornHeight = Math.round(size * 0.62);
  const subHeight = Math.round(size * 0.42);
  return (
    <span className={cn("inline-flex flex-col items-center", className)}>
      {(variant === "ornament" || variant === "name" || variant === "full") && (
        <BrandOrnament size={ornHeight} className="mb-[0.18em]" />
      )}
      {(variant === "name" || variant === "full") && (
        <BrandWordmark size={size} />
      )}
      {variant === "full" && (
        <BrandSubtitle size={subHeight} className="mt-[0.35em]" />
      )}
    </span>
  );
}
