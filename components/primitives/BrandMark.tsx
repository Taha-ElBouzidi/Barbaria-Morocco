import BrandOrnament from "./BrandOrnament";
import BrandWordmark from "./BrandWordmark";
import BrandSubtitle from "./BrandSubtitle";
import { cn } from "@/lib/utils";

interface BrandMarkProps {
  /** Total composite height in pixels. Pieces auto-proportion. */
  size?: number;
  className?: string;
  /** Which slice to compose. */
  variant?: "full" | "name" | "ornament";
}

/**
 * BrandMark, the Barbaria identity composed from three independent
 * SVG primitives (BrandOrnament + BrandWordmark + BrandSubtitle).
 * Inherits the parent's text colour via `currentColor`.
 *
 * `size` is the TOTAL mark height in pixels. The three pieces scale
 * down using the source artwork's bbox ratios:
 *
 *   ornament : gap : wordmark : gap : subtitle = 186 : 35 : 88 : 50 : 50
 *
 * so "name" totals 309 source-units, "full" totals 409. We divide
 * the requested `size` across those units, so the composite always
 * matches the brand's intended proportions regardless of how big
 * or small it is rendered.
 */
export default function BrandMark({ size = 80, className, variant = "name" }: BrandMarkProps) {
  if (variant === "ornament") {
    return <BrandOrnament size={size} className={className} />;
  }

  // Source SVG bbox units, in vertical order, top to bottom.
  const ORN = 186;
  const GAP1 = 35;
  const WM = 88;
  const GAP2 = 50;
  const SUB = 50;
  const total = variant === "full" ? ORN + GAP1 + WM + GAP2 + SUB : ORN + GAP1 + WM;
  const u = size / total; // pixels per source-unit

  return (
    <span className={cn("inline-flex flex-col items-center leading-none", className)}>
      <BrandOrnament size={Math.round(ORN * u)} />
      <span aria-hidden="true" style={{ height: Math.round(GAP1 * u) }} />
      <BrandWordmark size={Math.round(WM * u)} />
      {variant === "full" && (
        <>
          <span aria-hidden="true" style={{ height: Math.round(GAP2 * u) }} />
          <BrandSubtitle size={Math.round(SUB * u)} />
        </>
      )}
    </span>
  );
}
