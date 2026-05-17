import type { ReactNode } from "react";

interface LegalShellProps {
  eyebrow: string;
  title: string;
  lastUpdated: string;
  children: ReactNode;
}

/**
 * Shared layout for /legal/* pages. Centred long-form text on the cream
 * surface, brand typography, last-updated stamp at the top. Children
 * render below the header and should use h2/p/ul with brand styles
 * (see the per-page implementations for the conventions).
 */
export default function LegalShell({
  eyebrow,
  title,
  lastUpdated,
  children,
}: LegalShellProps) {
  return (
    <main className="min-h-screen bg-bb-bg text-bb-on-surface">
      <div className="mx-auto max-w-[760px] px-[var(--bb-margin-edge)] py-20 lg:py-28">
        <header className="space-y-4 pb-10 border-b border-bb-line">
          <p className="font-sans text-[11px] uppercase tracking-[0.32em] text-bb-secondary-deep">
            {eyebrow}
          </p>
          <h1 className="font-display text-[clamp(32px,5vw,52px)] leading-[1.05] tracking-tight text-bb-primary">
            {title}
          </h1>
          <p className="font-sans text-[12px] uppercase tracking-[0.18em] text-bb-on-surface-variant">
            {lastUpdated}
          </p>
        </header>

        <div className="legal-prose pt-10 space-y-8">
          {children}
        </div>
      </div>
    </main>
  );
}
