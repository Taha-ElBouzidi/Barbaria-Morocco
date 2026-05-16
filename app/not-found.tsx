import Link from "next/link";

/**
 * Root not-found. Reached when a URL doesn't match any locale segment.
 * The locale-aware not-found at /[locale]/not-found.tsx covers the
 * common case (any /fr/... or /en/... miss); this one is for paths
 * that escape both. Plain-FR copy since there's no locale context
 * here. Minimal brand layout — no photo, same visual treatment as
 * the localised page.
 */
export default function NotFound() {
  return (
    <html lang="fr">
      <body className="bg-bb-bg text-bb-on-surface antialiased">
        <main className="min-h-screen flex items-center justify-center px-6 py-24">
          <div className="w-full max-w-[640px] text-center space-y-10">
            <div
              className="flex items-center justify-center gap-3"
              aria-hidden="true"
            >
              <span className="h-px w-10 bg-bb-secondary-deep/40" />
              <span className="h-1.5 w-1.5 rounded-full bg-bb-secondary-deep" />
              <span className="h-px w-10 bg-bb-secondary-deep/40" />
            </div>

            <p className="font-sans text-[11px] uppercase tracking-[0.32em] text-bb-secondary-deep">
              Barbaria Morocco
            </p>

            <h1
              aria-label="Cette page n'existe pas"
              className="font-display text-[clamp(96px,18vw,200px)] leading-[0.9] tracking-tight text-bb-primary"
            >
              404
            </h1>

            <div className="space-y-3">
              <p className="font-display italic text-[clamp(20px,2.4vw,28px)] text-bb-primary leading-snug">
                Cette page n&apos;existe pas.
              </p>
              <p className="font-sans text-[14px] text-bb-on-surface/75 max-w-[460px] mx-auto leading-relaxed">
                L&apos;adresse que vous avez suivie est incorrecte ou la page a
                été déplacée.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 min-h-[48px] bg-bb-primary text-bb-on-primary font-sans text-[12px] uppercase tracking-[0.22em] hover:bg-bb-primary-container transition-colors"
              >
                Retour à l&apos;accueil
              </Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
