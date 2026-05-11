import Photo from "@/components/primitives/Photo";
import Eyebrow from "@/components/primitives/Eyebrow";
import DisplayHeading from "@/components/primitives/DisplayHeading";
import Reveal from "@/components/primitives/Reveal";
import type { World } from "@/lib/rituals";

interface Props {
  world: World;
  lang: "en" | "fr";
}

export default function CategoryHero({ world, lang }: Props) {
  return (
    <section className="relative h-[70vh] min-h-[520px] overflow-hidden">
      <Photo
        src={world.hero}
        alt={world.name[lang]}
        fill
        priority
        needsShot={!world.hero}
        containerClassName="absolute inset-0"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(27,48,34,0.4),rgba(27,48,34,0.8))]" aria-hidden />
      <div className="relative z-10 flex h-full items-end pb-16 lg:pb-24">
        <div className="mx-auto w-full max-w-[1440px] px-[var(--bb-margin-edge)]">
          <div className="max-w-[820px] text-white space-y-4">
            <Reveal><Eyebrow tone="gold">{world.eyebrow[lang]}</Eyebrow></Reveal>
            <Reveal delayMs={120}>
              <DisplayHeading size="xl" as="h1" className="text-white">{world.name[lang]}</DisplayHeading>
            </Reveal>
            <Reveal delayMs={220}>
              <p className="text-white/80 leading-relaxed max-w-[640px] font-serif italic text-[clamp(18px,1.5vw,22px)]">
                {world.lede[lang]}
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
