import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import LegalShell from "@/components/legal/LegalShell";
import { L } from "@/components/legal/LegalValue";
import { CLIENT_DATA } from "@/lib/legal/client-data";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { Link } from "@/i18n/navigation";

export const dynamic = "force-static";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isFr = locale !== "en";
  return {
    ...pageMetadata({
      locale,
      path: "/legal/terms",
      title: isFr ? "Conditions d'utilisation" : "Terms of use",
      description: isFr
        ? "Conditions générales d'utilisation du site Barbaria Morocco."
        : "Terms of use of the Barbaria Morocco website.",
    }),
    robots: { index: true, follow: true },
  };
}

export default async function TermsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isFr = locale !== "en";

  return (
    <LegalShell
      eyebrow={isFr ? "Conditions" : "Terms"}
      title={
        isFr ? "Conditions générales d'utilisation" : "Terms of use"
      }
      lastUpdated={isFr ? "Dernière mise à jour : 17 mai 2026" : "Last updated: May 17, 2026"}
    >
      {isFr ? <FrenchContent /> : <EnglishContent />}

      <hr className="border-bb-line mt-12" />
      <p className="legal-note">
        {isFr ? (
          <>
            Pour toute question relative aux présentes conditions, écrivez à{" "}
            <a href="mailto:contact@barbariamorocco.com">contact@barbariamorocco.com</a>.
            Voir également nos <Link href="/legal/legal-notice">mentions légales</Link>,
            notre <Link href="/legal/privacy">politique de confidentialité</Link> et
            notre <Link href="/legal/cookies">politique de cookies</Link>.
          </>
        ) : (
          <>
            For any question regarding these terms, email{" "}
            <a href="mailto:contact@barbariamorocco.com">contact@barbariamorocco.com</a>.
            See also our <Link href="/legal/legal-notice">legal notice</Link>, our{" "}
            <Link href="/legal/privacy">privacy policy</Link> and our{" "}
            <Link href="/legal/cookies">cookie policy</Link>. The French version of
            these terms prevails in case of discrepancy.
          </>
        )}
      </p>
    </LegalShell>
  );
}

function FrenchContent() {
  return (
    <>
      <h2>1. Objet</h2>
      <p>
        Le présent site, accessible à l&apos;adresse barbariamorocco.com (le « Site »),
        est édité par <L>{CLIENT_DATA.legalName.fr}</L> (« Barbaria »).
        Le Site présente une sélection de cosmétiques naturels et de produits
        d&apos;épicerie fine du terroir marocain destinée à une clientèle professionnelle :
        hôtels, spas, distributeurs et clients corporate.
      </p>
      <p>
        <strong>Le Site ne propose pas de vente en ligne.</strong> Toutes les
        transactions s&apos;effectuent hors site, dans le cadre d&apos;une proposition
        commerciale (devis) signée entre Barbaria et l&apos;acheteur professionnel.
        Cette proposition est régie par des conditions particulières de vente qui lui
        sont propres et qui prévalent sur les présentes conditions générales
        d&apos;utilisation pour la relation contractuelle de vente.
      </p>

      <h2>2. Acceptation et modification</h2>
      <p>
        L&apos;utilisation du Site implique l&apos;acceptation pleine et entière des
        présentes conditions générales d&apos;utilisation (CGU) telles qu&apos;en
        vigueur au moment de l&apos;utilisation. Barbaria se réserve le droit de
        modifier ces CGU à tout moment ; la version applicable est celle datée en
        haut de cette page.
      </p>

      <h2>3. Accès au Site</h2>
      <p>
        Le Site est accessible gratuitement à tout visiteur disposant d&apos;une
        connexion internet. Les coûts d&apos;accès (matériel, télécommunications)
        sont à la charge du visiteur.
      </p>
      <p>
        Barbaria se réserve le droit d&apos;interrompre temporairement le service
        pour maintenance ou sécurité, sans préavis. Cette obligation est de moyens
        et non de résultat.
      </p>

      <h2>4. Comptes administrateurs</h2>
      <p>
        Certaines pages sont réservées aux administrateurs autorisés de Barbaria.
        Toute tentative d&apos;accès non autorisée constitue une infraction
        susceptible d&apos;être poursuivie au titre de la loi marocaine n° 07-03
        relative à la cybercriminalité (article 607-3 du Code pénal, accès
        frauduleux à un système de traitement automatisé de données).
      </p>

      <h2>5. Formulaire de demande</h2>
      <p>
        Le formulaire de demande accessible depuis la page Contact permet à un
        acheteur professionnel d&apos;adresser une demande d&apos;information ou
        de devis. La soumission du formulaire ne constitue pas un engagement
        d&apos;achat ni la conclusion d&apos;un contrat ; elle déclenche une prise
        de contact par notre conciergerie sous 24 heures ouvrées, suivie le cas
        échéant d&apos;une proposition commerciale.
      </p>
      <p>
        L&apos;utilisateur garantit la véracité des informations transmises et
        confirme agir en qualité d&apos;acheteur professionnel (B2B).
      </p>

      <h2>6. Propriété intellectuelle</h2>
      <p>
        L&apos;ensemble des contenus du Site (textes, photographies, vidéos,
        illustrations, logos, marques, mise en page, code source) est la propriété
        exclusive de Barbaria ou utilisé sous licence. Toute reproduction,
        représentation, modification, ou exploitation commerciale, totale ou
        partielle, sans autorisation écrite préalable, est interdite et constitue
        une contrefaçon sanctionnée par la loi marocaine n° 2-00.
      </p>
      <p>
        Sont également interdits : l&apos;extraction automatisée du contenu
        (scraping), le téléchargement massif, la mise en miroir du Site, ainsi que
        l&apos;utilisation de la marque « Barbaria » ou de son identité visuelle à
        des fins commerciales ou quasi commerciales sans licence écrite.
      </p>

      <h2>7. Liens hypertextes</h2>
      <p>
        Les liens entrants vers la page d&apos;accueil sont autorisés. Les liens
        profonds vers des pages internes du Site sont autorisés à condition de
        respecter l&apos;intégrité de la page (sans cadre, sans incorporation
        présentant le contenu comme étant d&apos;origine tierce).
      </p>
      <p>
        Barbaria n&apos;exerce aucun contrôle sur les sites tiers vers lesquels le
        Site renvoie et décline toute responsabilité quant à leur contenu.
      </p>

      <h2>8. Limitation de responsabilité</h2>
      <p>
        Barbaria s&apos;efforce d&apos;assurer la disponibilité du Site et
        l&apos;exactitude des informations qui y figurent, sans pouvoir le
        garantir. Barbaria décline toute responsabilité en cas :
      </p>
      <ul>
        <li>d&apos;interruption due à un cas de force majeure ;</li>
        <li>de défaillance des services tiers (hébergement, télécommunications) ;</li>
        <li>d&apos;incompatibilité matérielle ou logicielle côté utilisateur.</li>
      </ul>
      <p>
        Dans un contexte B2B, et sauf disposition impérative contraire, la
        responsabilité de Barbaria, si elle venait à être engagée, est limitée aux
        dommages directs, prévisibles et prouvés, et plafonnée au montant de la
        dernière transaction commerciale conclue avec l&apos;acheteur (ou à zéro en
        l&apos;absence de transaction).
      </p>

      <h2>9. Force majeure</h2>
      <p>
        Barbaria ne pourra être tenue responsable de la non-exécution de ses
        obligations en cas de force majeure au sens des articles 268 et 269 du
        Dahir des Obligations et Contrats marocain, notamment : catastrophes
        naturelles, actes des autorités publiques, défaillances majeures des
        services télécoms ou d&apos;hébergement, cyberattaques malgré des mesures
        de sécurité raisonnables.
      </p>

      <h2>10. Données personnelles</h2>
      <p>
        Le traitement des données personnelles est détaillé dans notre{" "}
        <Link href="/legal/privacy">politique de confidentialité</Link>. L&apos;usage
        des cookies est détaillé dans notre{" "}
        <Link href="/legal/cookies">politique de cookies</Link>.
      </p>

      <h2>11. Droit applicable et juridiction compétente</h2>
      <p>
        Les présentes CGU sont régies par le droit marocain. Tout litige relatif
        à leur interprétation ou à leur exécution relève de la compétence
        exclusive du <strong>Tribunal de Commerce de Casablanca</strong>, sauf
        disposition impérative contraire.
      </p>
      <p>
        Pour les acheteurs professionnels résidant dans l&apos;Union européenne,
        la clause de juridiction marocaine est opposable conformément à
        l&apos;article 25 du règlement Bruxelles I bis (UE 1215/2012). En tant
        que site exclusivement B2B, ces CGU ne sont pas soumises aux dispositions
        applicables aux consommateurs (loi marocaine n° 31-08, directive UE
        2013/11), et aucun médiateur de la consommation n&apos;est désigné.
      </p>

      <h2>12. Contact</h2>
      <p>
        Pour toute question relative aux présentes CGU :{" "}
        <a href="mailto:contact@barbariamorocco.com">contact@barbariamorocco.com</a>{" "}
        / <L>{CLIENT_DATA.postalAddress.fr}</L>.
      </p>
    </>
  );
}

function EnglishContent() {
  return (
    <>
      <h2>1. Purpose</h2>
      <p>
        This website, accessible at barbariamorocco.com (the "Site"), is published
        by <L>{CLIENT_DATA.legalName.en}</L> ("Barbaria"). The Site presents a
        curated selection of natural cosmetics and fine grocery products of Moroccan
        terroir, addressed to a professional clientele: hotels, spas, distributors
        and corporate clients.
      </p>
      <p>
        <strong>The Site does not offer online sales.</strong> All transactions
        occur off-site, in the framework of a commercial proposal (quote) signed
        between Barbaria and the professional buyer. That proposal is governed by
        its own particular terms of sale which prevail over these general terms of
        use for the contractual sales relationship.
      </p>

      <h2>2. Acceptance and Amendment</h2>
      <p>
        Use of the Site implies full and complete acceptance of these general terms
        of use ("Terms") as in force at the time of use. Barbaria reserves the right
        to amend these Terms at any time; the applicable version is the one dated
        at the top of this page.
      </p>

      <h2>3. Access</h2>
      <p>
        The Site is freely accessible to any visitor with an internet connection.
        Access costs (equipment, telecommunications) are borne by the visitor.
      </p>
      <p>
        Barbaria reserves the right to interrupt the service temporarily for
        maintenance or security, without prior notice. This is a best-efforts
        obligation, not a guarantee of result.
      </p>

      <h2>4. Admin Accounts</h2>
      <p>
        Certain pages are reserved for authorised Barbaria administrators. Any
        unauthorised attempt to access these pages constitutes an offence under
        Moroccan law No. 07-03 on cybercrime (article 607-3 of the Penal Code,
        fraudulent access to an automated data processing system) and may be
        prosecuted.
      </p>

      <h2>5. Inquiry Form</h2>
      <p>
        The inquiry form accessible from the Contact page allows a professional
        buyer to submit an information or quote request. Submitting the form does
        not constitute a purchase commitment or the conclusion of a contract; it
        triggers contact by our concierge within 24 business hours, followed where
        applicable by a commercial proposal.
      </p>
      <p>
        The user warrants the truthfulness of the information provided and confirms
        acting in a professional capacity (B2B).
      </p>

      <h2>6. Intellectual Property</h2>
      <p>
        All content on the Site (text, photography, video, illustrations, logos,
        trademarks, layout, source code) is the exclusive property of Barbaria or
        used under licence. Any reproduction, representation, modification, or
        commercial exploitation, in whole or in part, without prior written
        authorisation is prohibited and constitutes counterfeiting under Moroccan
        law No. 2-00.
      </p>
      <p>
        Also prohibited: automated extraction of content (scraping), mass
        downloading, mirroring of the Site, and use of the "Barbaria" trademark or
        visual identity for commercial or quasi-commercial purposes without written
        licence.
      </p>

      <h2>7. Hyperlinks</h2>
      <p>
        Inbound links to the home page are permitted. Deep links to internal pages
        are permitted provided they respect the integrity of the page (no framing,
        no embedding that presents the content as third-party).
      </p>
      <p>
        Barbaria exercises no control over third-party sites linked from the Site
        and disclaims any responsibility for their content.
      </p>

      <h2>8. Limitation of Liability</h2>
      <p>
        Barbaria endeavours to maintain the availability of the Site and the
        accuracy of the information it contains, without warranty. Barbaria
        disclaims liability for:
      </p>
      <ul>
        <li>interruption due to force majeure;</li>
        <li>failure of third-party services (hosting, telecommunications);</li>
        <li>hardware or software incompatibility on the user's side.</li>
      </ul>
      <p>
        In a B2B context, and except where mandatory rules state otherwise,
        Barbaria's liability, if engaged, is limited to direct, foreseeable and
        proven damages, and capped at the amount of the most recent commercial
        transaction concluded with the buyer (or zero in the absence of any
        transaction).
      </p>

      <h2>9. Force Majeure</h2>
      <p>
        Barbaria cannot be held liable for the non-performance of its obligations
        in the event of force majeure within the meaning of articles 268 and 269 of
        the Moroccan Dahir des Obligations et Contrats, including: natural
        disasters, acts of public authorities, major failures of telecommunications
        or hosting services, cyberattacks despite reasonable security measures.
      </p>

      <h2>10. Personal Data</h2>
      <p>
        Processing of personal data is detailed in our{" "}
        <Link href="/legal/privacy">privacy policy</Link>. Use of cookies is detailed
        in our <Link href="/legal/cookies">cookie policy</Link>.
      </p>

      <h2>11. Governing Law and Jurisdiction</h2>
      <p>
        These Terms are governed by Moroccan law. Any dispute relating to their
        interpretation or execution falls within the exclusive jurisdiction of the{" "}
        <strong>Commercial Court of Casablanca</strong>, except where mandatory rules
        state otherwise.
      </p>
      <p>
        For professional buyers resident in the European Union, the Moroccan
        jurisdiction clause is enforceable in accordance with article 25 of the
        Brussels I bis Regulation (EU 1215/2012). As an exclusively B2B site, these
        Terms are not subject to consumer-protection provisions (Moroccan law
        No. 31-08, EU directive 2013/11), and no consumer mediator is designated.
      </p>

      <h2>12. Contact</h2>
      <p>
        For any question regarding these Terms:{" "}
        <a href="mailto:contact@barbariamorocco.com">contact@barbariamorocco.com</a>{" "}
        / <L>{CLIENT_DATA.postalAddress.en}</L>.
      </p>
    </>
  );
}
