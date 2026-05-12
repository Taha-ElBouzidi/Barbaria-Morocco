/**
 * TifinaghMark — small inline rendering of the Tifinagh letter ⵣ (Yaz),
 * the iconic Amazigh "freeman" symbol. Used as an ambient brand mark on
 * dividers, footers, and section breaks. Does NOT replace the wordmark logo.
 *
 * Renders the unicode glyph (U+2D63) as a serif character at a configurable
 * size. We avoid an SVG path here so the glyph picks up the surrounding
 * font stack and weight cleanly across locales.
 */
export default function TifinaghMark({
  size = 18,
  className = "",
  ariaLabel = "Tifinagh Yaz, symbol of the free people",
}: {
  size?: number;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <span
      aria-label={ariaLabel}
      role="img"
      className={`inline-block font-display leading-none text-bb-secondary ${className}`}
      style={{ fontSize: `${size}px` }}
    >
      ⵣ
    </span>
  );
}
