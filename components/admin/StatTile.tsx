import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

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
    <div className="border border-bb-line bg-bb-bg p-6 hover:border-bb-secondary transition-colors">
      <p className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-on-surface-variant">{label}</p>
      <p className="font-serif text-[40px] leading-none mt-3 text-bb-on-surface">{value}</p>
      {hint && <p className="font-sans text-[12px] text-bb-on-surface-variant mt-3">{hint}</p>}
    </div>
  );
  return href ? <Link href={href} className="block">{inner}</Link> : inner;
}
