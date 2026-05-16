interface Point {
  day: string;
  cnt: number;
}

interface Props {
  points: Point[];
  height?: number;
  ariaLabel: string;
}

/**
 * Inline SVG sparkline. No client JS, no library. Renders a smooth
 * polyline + filled area for a small dense daily series. The viewport
 * is 100x{height}; the parent controls width via CSS.
 *
 * If every point is zero (typical for a soft launch with no inquiries
 * yet), we still render the axis line so the empty state is honest
 * rather than collapsed.
 */
export default function Sparkline({ points, height = 48, ariaLabel }: Props) {
  if (points.length === 0) {
    return (
      <div
        role="img"
        aria-label={ariaLabel}
        className="h-12 w-full border-b border-bb-line"
      />
    );
  }

  const max = Math.max(1, ...points.map((p) => p.cnt));
  const stepX = 100 / Math.max(1, points.length - 1);
  const pathD = points
    .map((p, i) => {
      const x = i * stepX;
      const y = height - (p.cnt / max) * (height - 2) - 1;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
  const areaD = `${pathD} L 100 ${height} L 0 ${height} Z`;

  return (
    <svg
      role="img"
      aria-label={ariaLabel}
      viewBox={`0 0 100 ${height}`}
      preserveAspectRatio="none"
      className="block h-12 w-full"
    >
      <path d={areaD} fill="currentColor" fillOpacity="0.08" />
      <path d={pathD} fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
