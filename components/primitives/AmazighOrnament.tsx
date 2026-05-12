/**
 * AmazighOrnament, the small diamond-and-star motif used above the
 * Barbaria wordmark. Two interlocking narrow diamonds forming a
 * 4-pointed star, a common Amazigh tetraskelion shape. Inherits color
 * from `currentColor`, sized in px via the `size` prop.
 *
 * Distinct from `TifinaghMark` (which renders the unicode glyph ⵣ).
 * This ornament is geometric, decorative, and brand-specific, used
 * exclusively in the wordmark composition.
 */
export default function AmazighOrnament({
  size = 28,
  className = "",
  strokeWidth = 1.4,
}: {
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {/* Vertical narrow diamond */}
      <path d="M20 3 L26 20 L20 37 L14 20 Z" />
      {/* Horizontal narrow diamond, overlapping at center */}
      <path d="M3 20 L20 14 L37 20 L20 26 Z" />
      {/* Center accent dot */}
      <circle cx="20" cy="20" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}
