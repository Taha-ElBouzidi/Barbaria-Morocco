import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import Image from "next/image";

export const dynamic = "force-static";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export const metadata: Metadata = {
  title: "Logo preview",
  robots: { index: false, follow: false },
};

const variants = [
  {
    key: "square",
    name: "Variation 1, Square",
    src: "/brand_photos/barbaria-logo-square.png",
    blurb:
      "Full square logo (ornament + BARBARIA + MOROCCO). Strong brand impression. Best when the header has space for a taller mark.",
    aspect: "aspect-square",
    maxHeight: "h-12 lg:h-14",
  },
  {
    key: "round",
    name: "Variation 2, Round",
    src: "/brand_photos/barbaria-logo-round.png",
    blurb:
      "Circular mask around the full logo. Acts as a small seal/badge. Feels formal and crested, like a maison stamp.",
    aspect: "aspect-square",
    maxHeight: "h-12 lg:h-14",
  },
  {
    key: "transparent",
    name: "Variation 3, Transparent (horizontal)",
    src: "/brand_photos/barbaria-logo-transparent.png",
    blurb:
      "Ornament + BARBARIA only, white background removed. Works on cream AND dark hero contexts. Wider horizontal footprint.",
    aspect: "aspect-[585/200]",
    maxHeight: "h-12 lg:h-14",
  },
] as const;

export default async function LogoPreviewPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="min-h-screen bg-bb-bg text-bb-on-surface">
      <div className="mx-auto max-w-[1100px] px-[var(--bb-margin-edge)] py-16 lg:py-24">
        <header className="space-y-3 pb-10 border-b border-bb-line">
          <p className="font-sans text-[11px] uppercase tracking-[0.32em] text-bb-secondary-deep">
            Brand mark, choose one
          </p>
          <h1 className="font-display text-[clamp(32px,4.5vw,48px)] leading-[1.05] text-bb-primary">
            Header logo preview
          </h1>
          <p className="font-sans text-[14px] text-bb-on-surface/75 leading-relaxed max-w-[620px]">
            Each variant is shown in a real header mock-up against both surfaces
            the brand uses, cream (post-scroll, non-hero pages) and the dark
            sahara wash (hero pages before scroll). Pick the one you like and
            tell me which to keep.
          </p>
        </header>

        <div className="space-y-16 pt-12">
          {variants.map((v, i) => (
            <section key={v.key} className="space-y-6">
              <div className="flex items-baseline justify-between">
                <h2 className="font-display text-[24px] text-bb-primary">
                  {v.name}
                </h2>
                <span className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-on-surface-variant">
                  #{i + 1}
                </span>
              </div>
              <p className="font-sans text-[13px] text-bb-on-surface/75 max-w-[640px] leading-relaxed">
                {v.blurb}
              </p>

              {/* Light header mock */}
              <div className="space-y-2">
                <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-bb-secondary-deep">
                  Light header (post-scroll, contact, journal, etc.)
                </p>
                <div className="border border-bb-line bg-bb-bg">
                  <div className="flex h-[72px] items-center justify-between px-6">
                    <Image
                      src={v.src}
                      alt="Barbaria Morocco"
                      width={400}
                      height={400}
                      className={`${v.maxHeight} w-auto`}
                    />
                    <div className="flex items-center gap-6 font-sans text-[12px] uppercase tracking-[0.18em] text-bb-on-surface">
                      <span>Cosmétiques</span>
                      <span>Épicerie</span>
                      <span>Histoire</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dark hero mock */}
              <div className="space-y-2">
                <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-bb-secondary-deep">
                  Dark hero header (top of /, /products, /story before scroll)
                </p>
                <div
                  className="border border-bb-line relative overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(180deg, #2c1810 0%, #1d100a 100%)",
                  }}
                >
                  <div className="flex h-[72px] items-center justify-between px-6">
                    <Image
                      src={v.src}
                      alt="Barbaria Morocco"
                      width={400}
                      height={400}
                      className={`${v.maxHeight} w-auto`}
                    />
                    <div className="flex items-center gap-6 font-sans text-[12px] uppercase tracking-[0.18em] text-white">
                      <span>Cosmétiques</span>
                      <span>Épicerie</span>
                      <span>Histoire</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>

        <footer className="mt-20 pt-10 border-t border-bb-line">
          <p className="font-sans text-[13px] text-bb-on-surface/75 leading-relaxed">
            Once you pick a variant, tell me the number (1, 2, or 3) and I will
            swap the live header to use that one and delete the other two
            assets.
          </p>
        </footer>
      </div>
    </main>
  );
}
