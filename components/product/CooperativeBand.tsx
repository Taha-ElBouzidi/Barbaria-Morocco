import type { Product } from "@/lib/products";
import DisplayHeading from "@/components/primitives/DisplayHeading";

interface Props { product: Product; lang: "en" | "fr"; }

const COPY = {
  en: {
    headline_a: "An object,",
    headline_b: "a cooperative.",
    manifesto:
      "Every Barbaria piece carries the name of the artisan or cooperative that made it. We compensate fairly and credit always — because the people who shape these objects are the ones who give them meaning.",
  },
  fr: {
    headline_a: "Un objet,",
    headline_b: "une coopérative.",
    manifesto:
      "Chaque pièce Barbaria porte le nom de l'artisane ou de la coopérative qui l'a façonnée. Nous rémunérons équitablement et créditons toujours — car ce sont les mains qui donnent leur sens à ces objets.",
  },
};

// Stats are illustrative — sprint 2 will pull from CMS.
const STATS = {
  en: [
    { value: "+42%", label: "avg. artisan income" },
    { value: "60", label: "artisans employed" },
    { value: "100%", label: "women-led" },
  ],
  fr: [
    { value: "+42%", label: "revenu moyen artisanes" },
    { value: "60", label: "artisanes employées" },
    { value: "100%", label: "femmes-led" },
  ],
};

export default function CooperativeBand({ product, lang }: Props) {
  const c = COPY[lang];
  const stats = STATS[lang];
  const cooperative =
    product.origin ?? (lang === "fr" ? "Notre coopérative partenaire" : "Our cooperative partner");

  return (
    <section className="bg-bb-primary text-white py-24 lg:py-32">
      <div className="mx-auto max-w-[1440px] px-[var(--bb-margin-edge)] grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-12 lg:gap-20 items-start">
        <div className="space-y-6 max-w-[500px]">
          <DisplayHeading size="lg" as="h2" className="text-white">
            {c.headline_a} <em className="font-display italic block">{c.headline_b}</em>
          </DisplayHeading>
          <p className="text-white/80 leading-relaxed">{c.manifesto}</p>
          <p className="font-display italic text-[20px] text-bb-secondary-fixed-dim">{cooperative}</p>
        </div>
        <div className="grid grid-cols-3 gap-6 lg:gap-8 self-end" role="list" aria-label={lang === "fr" ? "Statistiques de la coopérative" : "Cooperative statistics"}>
          {stats.map((s, i) => (
            <div key={i} className="space-y-2" role="listitem">
              <p className="font-display text-[clamp(40px,5vw,72px)] leading-none text-bb-secondary-fixed-dim">{s.value}</p>
              <p className="text-white/60 text-[11px] uppercase tracking-[0.18em]">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
