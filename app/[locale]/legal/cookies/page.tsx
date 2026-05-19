import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import LegalShell from "@/components/legal/LegalShell";
import { Link } from "@/i18n/navigation";

export const dynamic = "force-static";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isFr = locale !== "en";
  return {
    title: isFr ? "Politique de cookies" : "Cookie policy",
    description: isFr
      ? "Politique de cookies du site Barbaria Morocco."
      : "Cookie policy of the Barbaria Morocco website.",
    robots: { index: true, follow: true },
  };
}

export default async function CookiesPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isFr = locale !== "en";

  return (
    <LegalShell
      eyebrow={isFr ? "Cookies" : "Cookies"}
      title={isFr ? "Politique de cookies" : "Cookie policy"}
      lastUpdated={isFr ? "Dernière mise à jour : 17 mai 2026" : "Last updated: May 17, 2026"}
    >
      {isFr ? <FrenchContent /> : <EnglishContent />}

      <hr className="border-bb-line mt-12" />
      <p className="legal-note">
        {isFr ? (
          <>
            Pour modifier vos préférences à tout moment, cliquez sur «{" "}
            <strong>Gérer les cookies</strong> » dans le pied de page du site. Voir aussi
            nos <Link href="/legal/legal-notice">mentions légales</Link>, notre{" "}
            <Link href="/legal/privacy">politique de confidentialité</Link> et nos{" "}
            <Link href="/legal/terms">conditions d&apos;utilisation</Link>.
          </>
        ) : (
          <>
            To change your preferences at any time, click "<strong>Manage cookies</strong>"
            in the site footer. See also our <Link href="/legal/legal-notice">legal notice</Link>,
            our <Link href="/legal/privacy">privacy policy</Link> and our{" "}
            <Link href="/legal/terms">terms of use</Link>. The French version of this
            policy prevails in case of discrepancy.
          </>
        )}
      </p>
    </LegalShell>
  );
}

function FrenchContent() {
  return (
    <>
      <h2>1. Qu&apos;est-ce qu&apos;un cookie ?</h2>
      <p>
        Un cookie est un petit fichier texte déposé sur votre terminal (ordinateur,
        tablette, téléphone) par le site que vous visitez. Le terme « cookie » couvre
        également d&apos;autres traceurs analogues : entrées de localStorage,
        sessionStorage, ou identifiants de session calculés côté serveur (par
        exemple, le hash anonymisé utilisé par Vercel Analytics).
      </p>

      <h2>2. Cookies utilisés sur ce site</h2>
      <CookieTableFr />

      <h2>3. Catégories et consentement</h2>
      <p>Les cookies sont classés en deux catégories :</p>
      <ul>
        <li>
          <strong>Strictement nécessaires</strong> : indispensables au fonctionnement
          du Site (mémorisation de votre choix de consentement, session technique,
          authentification administrateur). Ces cookies sont actifs sans consentement,
          conformément à l&apos;exemption prévue par les recommandations de la CNIL
          et de la CNDP.
        </li>
        <li>
          <strong>Mesure d&apos;audience</strong> : Vercel Analytics et Vercel Speed
          Insights, à des fins d&apos;analyse agrégée de la fréquentation et de la
          performance du Site. Ces cookies sont déposés <strong>uniquement après
          votre consentement explicite</strong>.
        </li>
      </ul>
      <p>
        Aucun cookie publicitaire ni cookie de réseau social tiers n&apos;est utilisé
        sur ce Site.
      </p>

      <h2>4. Recueil du consentement</h2>
      <p>
        Lors de votre première visite, un bandeau de consentement s&apos;affiche. Il
        vous propose trois actions de poids visuel équivalent :
      </p>
      <ul>
        <li><strong>Tout accepter</strong> : tous les cookies, y compris la mesure d&apos;audience, sont activés.</li>
        <li><strong>Refuser le non-essentiel</strong> : seuls les cookies strictement nécessaires sont activés.</li>
        <li><strong>Personnaliser</strong> : vous choisissez catégorie par catégorie.</li>
      </ul>
      <p>
        Aucun cookie non essentiel n&apos;est déposé avant votre choix. Aucune case
        n&apos;est pré-cochée sur l&apos;écran de personnalisation.
      </p>

      <h2>5. Retirer ou modifier votre consentement</h2>
      <p>
        Vous pouvez retirer ou modifier votre consentement à tout moment en cliquant
        sur le lien « <strong>Gérer les cookies</strong> » dans le pied de page du
        Site. Le bandeau de consentement se rouvre, et votre nouveau choix prend effet
        immédiatement.
      </p>
      <p>
        Vous pouvez également supprimer les cookies déjà déposés directement depuis
        votre navigateur : Chrome, Safari, Firefox et Edge proposent tous une gestion
        détaillée dans leurs paramètres de confidentialité.
      </p>

      <h2>6. Durée de conservation du choix</h2>
      <p>
        Votre choix de consentement est conservé pendant 12 mois. À l&apos;issue de
        cette période, le bandeau réapparaît et vous êtes invité à confirmer ou
        modifier vos préférences.
      </p>

      <h2>7. Conséquences du refus</h2>
      <p>
        Le refus des cookies non essentiels ne vous empêche en aucun cas d&apos;accéder
        au Site, de naviguer entre ses pages ou d&apos;envoyer une demande via le
        formulaire de contact. Le seul effet est que Barbaria ne collectera pas, pour
        cette visite, de données agrégées de mesure d&apos;audience.
      </p>
    </>
  );
}

function CookieTableFr() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-[13px] font-sans border-collapse">
        <thead className="border-b border-bb-line">
          <tr className="text-bb-secondary-deep uppercase tracking-[0.12em] text-[11px]">
            <th className="py-3 pr-4 align-top">Nom</th>
            <th className="py-3 pr-4 align-top">Émetteur</th>
            <th className="py-3 pr-4 align-top">Finalité</th>
            <th className="py-3 pr-4 align-top">Durée</th>
            <th className="py-3 align-top">Catégorie</th>
          </tr>
        </thead>
        <tbody className="text-bb-on-surface">
          <Row name="bb-cookie-consent" issuer="Barbaria (1ère partie)" purpose="Mémoriser votre choix de consentement aux cookies" duration="12 mois" category="Strictement nécessaire" />
          <Row name="sb-* (session Supabase)" issuer="Supabase Inc." purpose="Authentification administrateur sur les pages /admin" duration="Session + refresh" category="Strictement nécessaire" />
          <Row name="Hash session Vercel Analytics" issuer="Vercel Inc." purpose="Comptage agrégé et anonyme des visites" duration="24 h (rotation quotidienne)" category="Mesure d'audience (consentement requis)" />
          <Row name="Speed Insights Vercel" issuer="Vercel Inc." purpose="Mesure de la performance (Core Web Vitals)" duration="Session" category="Mesure d'audience (consentement requis)" />
        </tbody>
      </table>
    </div>
  );
}

function EnglishContent() {
  return (
    <>
      <h2>1. What Is a Cookie?</h2>
      <p>
        A cookie is a small text file placed on your device (computer, tablet, phone)
        by the website you visit. The term "cookie" also covers similar tracking
        technologies: localStorage and sessionStorage entries, or server-side session
        identifiers (for example, the anonymised hash used by Vercel Analytics).
      </p>

      <h2>2. Cookies Used on This Site</h2>
      <CookieTableEn />

      <h2>3. Categories and Consent</h2>
      <p>Cookies are classified in two categories:</p>
      <ul>
        <li>
          <strong>Strictly necessary</strong>: essential to the operation of the Site
          (storing your consent choice, technical session, admin authentication).
          These cookies are active without consent, in accordance with the exemption
          recommended by the CNIL (France) and the CNDP (Morocco).
        </li>
        <li>
          <strong>Audience measurement</strong>: Vercel Analytics and Vercel Speed
          Insights, for aggregated analysis of traffic and Site performance. These
          cookies are set <strong>only after your explicit consent</strong>.
        </li>
      </ul>
      <p>
        No advertising cookies or third-party social-media cookies are used on this
        Site.
      </p>

      <h2>4. Collecting Consent</h2>
      <p>
        On your first visit, a consent banner appears. It offers three actions of
        equivalent visual weight:
      </p>
      <ul>
        <li><strong>Accept all</strong>: all cookies, including audience measurement, are activated.</li>
        <li><strong>Reject non-essential</strong>: only strictly necessary cookies are activated.</li>
        <li><strong>Customise</strong>: you choose category by category.</li>
      </ul>
      <p>
        No non-essential cookie is set before you make a choice. No box is
        pre-checked on the customisation screen.
      </p>

      <h2>5. Withdrawing or Modifying Your Consent</h2>
      <p>
        You may withdraw or modify your consent at any time by clicking the "
        <strong>Manage cookies</strong>" link in the Site footer. The consent banner
        reopens, and your new choice takes effect immediately.
      </p>
      <p>
        You may also delete already-set cookies directly from your browser: Chrome,
        Safari, Firefox and Edge all offer detailed controls in their privacy
        settings.
      </p>

      <h2>6. Duration of Your Choice</h2>
      <p>
        Your consent choice is stored for 12 months. After that period, the banner
        reappears and you are invited to confirm or modify your preferences.
      </p>

      <h2>7. Consequences of Refusal</h2>
      <p>
        Refusing non-essential cookies does not prevent you from accessing the Site,
        navigating between pages, or submitting a contact form. The only effect is
        that Barbaria will not collect, for that visit, aggregated audience-measurement
        data.
      </p>
    </>
  );
}

function CookieTableEn() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-[13px] font-sans border-collapse">
        <thead className="border-b border-bb-line">
          <tr className="text-bb-secondary-deep uppercase tracking-[0.12em] text-[11px]">
            <th className="py-3 pr-4 align-top">Name</th>
            <th className="py-3 pr-4 align-top">Issuer</th>
            <th className="py-3 pr-4 align-top">Purpose</th>
            <th className="py-3 pr-4 align-top">Duration</th>
            <th className="py-3 align-top">Category</th>
          </tr>
        </thead>
        <tbody className="text-bb-on-surface">
          <Row name="bb-cookie-consent" issuer="Barbaria (first party)" purpose="Stores your cookie consent choice" duration="12 months" category="Strictly necessary" />
          <Row name="sb-* (Supabase session)" issuer="Supabase Inc." purpose="Admin authentication on /admin pages" duration="Session + refresh" category="Strictly necessary" />
          <Row name="Vercel Analytics session hash" issuer="Vercel Inc." purpose="Aggregated, anonymous visit count" duration="24 h (daily rotation)" category="Audience measurement (consent required)" />
          <Row name="Vercel Speed Insights" issuer="Vercel Inc." purpose="Performance measurement (Core Web Vitals)" duration="Session" category="Audience measurement (consent required)" />
        </tbody>
      </table>
    </div>
  );
}

function Row({
  name,
  issuer,
  purpose,
  duration,
  category,
}: {
  name: string;
  issuer: string;
  purpose: string;
  duration: string;
  category: string;
}) {
  return (
    <tr className="border-b border-bb-line/50">
      <td className="py-3 pr-4 align-top font-mono text-[12px]">{name}</td>
      <td className="py-3 pr-4 align-top">{issuer}</td>
      <td className="py-3 pr-4 align-top">{purpose}</td>
      <td className="py-3 pr-4 align-top">{duration}</td>
      <td className="py-3 align-top">{category}</td>
    </tr>
  );
}
