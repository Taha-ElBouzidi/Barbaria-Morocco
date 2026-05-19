/**
 * AmazighOrnament, the Barbaria brand mark.
 *
 * Two interlocking rhombus outlines (a stylised Berber tetraskelion)
 * with small horizontal cap segments at the outer-most left and right
 * tips. Matches the house's logo asset, see
 * public/brand_photos/barbaria-logo-new.jpg.
 *
 * Inherits stroke from `currentColor`, so the parent's `text-*` class
 * picks the colour. No fill, so the mark is hollow on any surface,
 * cream / sahara / dark wash all read cleanly. Aspect ratio is ~2.78:1
 * (the brand mark is wider than tall); `size` sets the height and the
 * width follows.
 */
export default function AmazighOrnament({
  size = 16,
  className = "",
  strokeWidth = 1.8,
}: {
  /** Height in pixels. Width follows the 100:36 viewBox aspect (~2.78x). */
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  const aspect = 100 / 36;
  return (
    <svg
      width={Math.round(size * aspect)}
      height={size}
      viewBox="0 0 100 36"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinejoin="miter"
      strokeLinecap="square"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {/* Two interlocking rhombuses, overlapping in the centre */}
      <polygon points="35,4 56,18 35,32 14,18" />
      <polygon points="65,4 86,18 65,32 44,18" />
      {/* Outer horizontal extension lines */}
      <line x1="4" y1="18" x2="14" y2="18" />
      <line x1="86" y1="18" x2="96" y2="18" />
      {/* Short vertical caps at the outermost tips, the Amazigh "feet" */}
      <line x1="4" y1="14" x2="4" y2="22" />
      <line x1="96" y1="14" x2="96" y2="22" />
    </svg>
  );
}
