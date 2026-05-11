import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import Photo from "@/components/primitives/Photo";
import Eyebrow from "@/components/primitives/Eyebrow";
import DisplayHeading from "@/components/primitives/DisplayHeading";
import Reveal from "@/components/primitives/Reveal";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "fr" }];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "story" });
  return {
    title: `${t("hero_headline")} | Barbaria Morocco`,
    description: t("hero_lede"),
  };
}

export default async function StoryPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "story" });

  const chapters = [
    {
      num: t("ch1_number"),
      title: t("ch1_title"),
      p1: t("ch1_p1"),
      p2: t("ch1_p2"),
      image: "/brand_photos/brand-lifestyle-1.jpg",
      reverse: false,
    },
    {
      num: t("ch2_number"),
      title: t("ch2_title"),
      p1: t("ch2_p1"),
      p2: t("ch2_p2"),
      image: null,
      reverse: true,
    },
    {
      num: t("ch3_number"),
      title: t("ch3_title"),
      p1: t("ch3_p1"),
      p2: t("ch3_p2"),
      image: "/brand_photos/argan-oil-dropper.jpg",
      reverse: false,
    },
  ];

  return (
    <>
      {/* Hero — 60vh, image fills behind gradient, text anchored to bottom */}
      <section className="relative h-[60vh] min-h-[480px] overflow-hidden">
        <Photo
          src={null}
          alt={t("hero_headline")}
          fill
          priority
          needsShot
          containerClassName="absolute inset-0"
          sizes="100vw"
        />
        <div
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(27,48,34,0.4),rgba(27,48,34,0.8))]"
          aria-hidden
        />
        <div className="relative z-10 flex h-full items-end pb-16 lg:pb-24">
          <div className="mx-auto w-full max-w-[1440px] px-[var(--bb-margin-edge)]">
            <div className="text-white space-y-4 max-w-[820px]">
              <Reveal>
                <Eyebrow tone="gold">{t("hero_eyebrow")}</Eyebrow>
              </Reveal>
              <Reveal delayMs={120}>
                <DisplayHeading size="xl" as="h1" className="text-white">
                  {t("hero_headline")}
                </DisplayHeading>
              </Reveal>
              <Reveal delayMs={220}>
                <p className="font-display italic text-[clamp(18px,1.5vw,22px)] text-white/80 leading-relaxed max-w-[640px]">
                  {t("hero_lede")}
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Chapters */}
      <div className="mx-auto max-w-[1440px] px-[var(--bb-margin-edge)] py-20 lg:py-32 space-y-32 lg:space-y-48">
        {chapters.map((ch, idx) => (
          <section key={idx} className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <Reveal className={ch.reverse ? "lg:order-2" : ""}>
              <Photo
                src={ch.image}
                alt={ch.title}
                width={1100}
                height={1380}
                needsShot={!ch.image}
                sizes="(min-width:1024px) 50vw, 100vw"
                containerClassName="aspect-[4/5]"
              />
            </Reveal>
            <div className={`space-y-6 ${ch.reverse ? "lg:order-1 lg:pr-8" : "lg:pl-8"}`}>
              <Reveal>
                <Eyebrow tone="gold">{ch.num}</Eyebrow>
              </Reveal>
              <Reveal delayMs={80}>
                <DisplayHeading size="lg" as="h2">
                  <em className="font-display italic">{ch.title}</em>
                </DisplayHeading>
              </Reveal>
              <Reveal delayMs={160} className="space-y-4 text-bb-on-surface-variant leading-relaxed max-w-[520px]">
                <p>{ch.p1}</p>
                <p>{ch.p2}</p>
              </Reveal>
            </div>
            {/* Pull-quote between Chapters 02 and 03 */}
            {idx === 1 && (
              <div className="col-span-1 lg:col-span-2 py-12 lg:py-16 text-center">
                <Reveal>
                  <blockquote className="max-w-[820px] mx-auto">
                    <p className="font-display italic text-[clamp(28px,3.5vw,40px)] leading-[1.3] text-bb-secondary">
                      &ldquo;{t("pull_quote")}&rdquo;
                    </p>
                  </blockquote>
                </Reveal>
              </div>
            )}
          </section>
        ))}
      </div>
    </>
  );
}
