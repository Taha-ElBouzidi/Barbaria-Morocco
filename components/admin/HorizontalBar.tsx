interface Row {
  label: string;
  value: number;
  sublabel?: string;
}

interface Props {
  rows: Row[];
  emptyMessage: string;
  /** Optional max override so two stacked charts share a scale. */
  max?: number;
}

/**
 * Inline horizontal bar chart. Each row is label + bar + value, where
 * the bar fills proportionally to max(values). Pure CSS, no JS, no
 * external chart library. Designed to look like a quiet ledger row
 * rather than a colourful infographic.
 */
export default function HorizontalBar({ rows, emptyMessage, max }: Props) {
  if (rows.length === 0) {
    return (
      <p className="font-display italic text-bb-on-surface-variant text-[14px]">
        {emptyMessage}
      </p>
    );
  }

  const effectiveMax = Math.max(1, max ?? Math.max(...rows.map((r) => r.value)));

  return (
    <ul className="space-y-2">
      {rows.map((row, i) => {
        const pct = (row.value / effectiveMax) * 100;
        return (
          <li key={i} className="space-y-1">
            <div className="flex items-baseline justify-between gap-3 font-sans text-[13px]">
              <span className="text-bb-on-surface truncate">{row.label}</span>
              <span className="text-bb-secondary-deep tabular-nums shrink-0">
                {row.value}
                {row.sublabel ? (
                  <span className="text-bb-on-surface-variant text-[11px] ml-2">
                    {row.sublabel}
                  </span>
                ) : null}
              </span>
            </div>
            <div
              role="meter"
              aria-label={row.label}
              aria-valuenow={row.value}
              aria-valuemin={0}
              aria-valuemax={effectiveMax}
              className="h-1.5 bg-bb-bg-low overflow-hidden"
            >
              <div
                className="h-full bg-bb-secondary-deep transition-[width] duration-300"
                style={{ width: `${pct.toFixed(2)}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
