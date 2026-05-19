import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import BrandOrnament from "@/components/primitives/BrandOrnament";
import BrandWordmark from "@/components/primitives/BrandWordmark";
import BrandSubtitle from "@/components/primitives/BrandSubtitle";
import BrandMark from "@/components/primitives/BrandMark";

export const dynamic = "force-static";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export const metadata: Metadata = {
  title: "Brand inspection",
  robots: { index: false, follow: false },
};

const SIZES = [200, 100, 60, 30];

export default async function BrandInspectionPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="min-h-screen bg-bb-bg text-bb-on-surface">
      <div className="mx-auto max-w-[1200px] px-[var(--bb-margin-edge)] py-16 lg:py-24">
        <header className="space-y-3 pb-10 border-b border-bb-line">
          <p className="font-sans text-[11px] uppercase tracking-[0.32em] text-bb-secondary-deep">
            Brand inspection
          </p>
          <h1 className="font-display text-[clamp(32px,4.5vw,48px)] leading-[1.05] text-bb-primary">
            Logo, three parts
          </h1>
          <p className="font-sans text-[14px] text-bb-on-surface/75 leading-relaxed max-w-[640px]">
            Each piece is rendered at four sizes (200 / 100 / 60 / 30 px height)
            on both surfaces the brand uses, cream and dark sahara. Tell me what
            to change on any part and I will adjust the source SVG.
          </p>
        </header>

        <Section title="1. BrandOrnament, the icon">
          <SizeRow sizes={SIZES}>
            {(s) => <BrandOrnament size={s} />}
          </SizeRow>
        </Section>

        <Section title="2. BrandWordmark, BARBARIA">
          <SizeRow sizes={SIZES}>
            {(s) => <BrandWordmark size={s} />}
          </SizeRow>
        </Section>

        <Section title="3. BrandSubtitle, MOROCCO">
          <SizeRow sizes={SIZES}>
            {(s) => <BrandSubtitle size={s} />}
          </SizeRow>
        </Section>

        <Section title="Composed: BrandMark variant=&quot;full&quot; — used in the FOOTER">
          <p className="font-sans text-[13px] text-bb-on-surface/70 -mt-3">
            Live footer renders at <strong>180 px total height</strong>. The
            other sizes are for visual comparison.
          </p>
          <SizeRow sizes={[260, 180, 100]}>
            {(s) => <BrandMark size={s} variant="full" />}
          </SizeRow>
        </Section>

        <Section title="Composed: BrandMark variant=&quot;name&quot; — used in the HEADER">
          <p className="font-sans text-[13px] text-bb-on-surface/70 -mt-3">
            Live header renders at <strong>46 px total height</strong> (fits
            the 72 px header bar with comfortable breathing room). Larger
            sizes shown for comparison.
          </p>
          <SizeRow sizes={[200, 100, 46]}>
            {(s) => <BrandMark size={s} variant="name" />}
          </SizeRow>
        </Section>

        <Section title="Ornament only — used at the top of the HERO">
          <p className="font-sans text-[13px] text-bb-on-surface/70 -mt-3">
            Live hero renders at <strong>48 px</strong> above the Tifinagh tagline.
          </p>
          <SizeRow sizes={[100, 64, 48]}>
            {(s) => <BrandMark size={s} variant="ornament" />}
          </SizeRow>
        </Section>

        <footer className="mt-16 pt-10 border-t border-bb-line">
          <p className="font-sans text-[13px] text-bb-on-surface/75 leading-relaxed max-w-[640px]">
            Tell me what to change on each part. For example:
          </p>
          <ul className="mt-3 list-disc pl-6 font-sans text-[13px] text-bb-on-surface/75 leading-relaxed">
            <li>Ornament: tighter / wider / sharper corners / different inner spacing</li>
            <li>Wordmark: lighter weight / heavier weight / wider letter spacing</li>
            <li>Subtitle: closer to BARBARIA / wider tracking</li>
            <li>Composition: more gap between ornament and BARBARIA / less gap</li>
          </ul>
        </footer>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-14 space-y-6">
      <h2 className="font-display text-[22px] text-bb-primary">
        {title.replace(/&quot;/g, '"')}
      </h2>
      {children}
    </section>
  );
}

function SizeRow({
  sizes,
  children,
}: {
  sizes: number[];
  children: (size: number) => React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      {/* Cream */}
      <div className="border border-bb-line bg-bb-bg">
        <div className="px-4 pt-3 pb-2 text-[10px] uppercase tracking-[0.22em] text-bb-secondary-deep font-sans">
          Cream surface
        </div>
        <div className="px-6 pb-6 flex items-end flex-wrap gap-x-10 gap-y-6 text-bb-primary">
          {sizes.map((s) => (
            <div key={s} className="flex flex-col items-center gap-2">
              <div>{children(s)}</div>
              <span className="font-sans text-[10px] uppercase tracking-[0.18em] text-bb-on-surface-variant">
                {s}px
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Dark sahara */}
      <div
        className="border border-bb-line"
        style={{ background: "linear-gradient(180deg, #2c1810 0%, #1d100a 100%)" }}
      >
        <div className="px-4 pt-3 pb-2 text-[10px] uppercase tracking-[0.22em] text-bb-secondary font-sans">
          Sahara surface
        </div>
        <div className="px-6 pb-6 flex items-end flex-wrap gap-x-10 gap-y-6 text-bb-secondary">
          {sizes.map((s) => (
            <div key={s} className="flex flex-col items-center gap-2">
              <div>{children(s)}</div>
              <span className="font-sans text-[10px] uppercase tracking-[0.18em] text-bb-secondary/70">
                {s}px
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
