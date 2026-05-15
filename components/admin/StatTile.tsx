import type { ReactNode } from "react";
import Link from "next/link";

/**
 * Square stat tile. Sized small enough to fit four per row at lg, two per
 * row on mobile, without dominating the dashboard. Hover state shows the
 * focus border so it reads as clickable when href is provided.
 */
export default function StatTile({
  label,
  value,
  hint,
  href,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  href?: string;
}) {
  const inner = (
    <div className="border border-bb-line bg-bb-bg p-4 sm:p-5 hover:border-bb-secondary transition-colors h-full">
      <p className="font-sans text-[10px] sm:text-[11px] uppercase tracking-[0.16em] text-bb-on-surface-variant leading-tight">
        {label}
      </p>
      <p className="font-serif text-[28px] sm:text-[32px] leading-none mt-2 text-bb-on-surface tabular-nums">
        {value}
      </p>
      {hint && (
        <p className="font-sans text-[11px] text-bb-on-surface-variant mt-2 line-clamp-2">{hint}</p>
      )}
    </div>
  );
  return href ? <Link href={href} className="block h-full">{inner}</Link> : inner;
}
