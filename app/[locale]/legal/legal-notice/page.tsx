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
    title: isFr ? "Mentions légales" : "Legal notice",
    description: isFr
      ? "Mentions légales du site Barbaria Morocco."
      : "Legal notice of the Barbaria Morocco website.",
    robots: { index: true, follow: true },
  };
}

function Fill({ children }: { children: React.ReactNode }) {
  return <span className="legal-placeholder">{children}</span>;
}

export default async function LegalNoticePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isFr = locale !== "en";

  return (
    <LegalShell
      eyebrow={isFr ? "Mentions légales" : "Legal notice"}
      title={isFr ? "Mentions légales" : "Legal notice"}
      lastUpdated={isFr ? "Dernière mise à jour : 17 mai 2026" : "Last updated: May 17, 2026"}
    >
      {isFr ? <FrenchContent /> : <EnglishContent />}

      <hr className="border-bb-line mt-12" />
      <p className="legal-note">
        {isFr ? (
          <>
            Pour toute question relative à ces mentions, écrivez-nous à{" "}
            <a href="mailto:contact@barbariamorocco.com">contact@barbariamorocco.com</a>. Voir
            également notre <Link href="/legal/privacy">politique de confidentialité</Link>,
            nos <Link href="/legal/terms">conditions d&apos;utilisation</Link> et notre{" "}
            <Link href="/legal/cookies">politique de cookies</Link>.
          </>
        ) : (
          <>
            For any question regarding this notice, email{" "}
            <a href="mailto:contact@barbariamorocco.com">contact@barbariamorocco.com</a>. See
            also our <Link href="/legal/privacy">privacy policy</Link>, our{" "}
            <Link href="/legal/terms">terms of use</Link> and our{" "}
            <Link href="/legal/cookies">cookie policy</Link>. The French version of this
            notice prevails in case of discrepancy.
          </>
        )}
      </p>
    </LegalShell>
  );
}

function FrenchContent() {
  return (
    <>
      <h2>1. Éditeur du site</h2>
      <p>
        Le présent site est édité par <Fill>[À COMPLÉTER : dénomination sociale]</Fill>,
        société <Fill>[À COMPLÉTER : forme juridique, SARL/SARL AU/SA]</Fill> au capital
        social de <Fill>[À COMPLÉTER : capital en MAD]</Fill>, dont le siège social est
        situé <Fill>[À COMPLÉTER : adresse complète, Marrakech, Maroc]</Fill>.
      </p>
      <ul>
        <li>Registre de Commerce (RC) : <Fill>[À COMPLÉTER : RC Marrakech n° XXXXX]</Fill></li>
        <li>Identifiant Commun de l&apos;Entreprise (ICE) : <Fill>[À COMPLÉTER : 15 chiffres]</Fill></li>
        <li>Identifiant Fiscal (IF) : <Fill>[À COMPLÉTER]</Fill></li>
        <li>Taxe Professionnelle (Patente) : <Fill>[À COMPLÉTER]</Fill></li>
        <li>CNSS (le cas échéant) : <Fill>[À COMPLÉTER]</Fill></li>
        <li>Téléphone : +212 6 59 65 88 63</li>
        <li>Email : contact@barbariamorocco.com</li>
      </ul>

      <h2>2. Directeur de la publication</h2>
      <p>
        Le directeur de la publication est{" "}
        <Fill>[À COMPLÉTER : nom complet du gérant / président]</Fill>, en sa qualité de
        représentant légal de la société.
      </p>

      <h2>3. Hébergement</h2>
      <p>Le site est hébergé par :</p>
      <ul>
        <li>
          <strong>Vercel Inc.</strong>
          <br />
          440 N Barranca Avenue, #4133, Covina, CA 91723, États-Unis
          <br />
          Site : <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">https://vercel.com</a>
          <br />
          Contact : privacy@vercel.com
        </li>
      </ul>
      <p>
        Les données utilisateur sont stockées par notre prestataire de base de données :
      </p>
      <ul>
        <li>
          <strong>Supabase Inc.</strong>
          <br />
          970 Toa Payoh North #07-04, Singapour 318992
          <br />
          Région de stockage utilisée :{" "}
          <Fill>[À COMPLÉTER : eu-west-1 Francfort / eu-west-3 Paris / autre]</Fill>
        </li>
      </ul>

      <h2>4. Propriété intellectuelle</h2>
      <p>
        L&apos;ensemble des contenus présents sur ce site (textes, photographies, vidéos,
        illustrations, logos, marques, mise en page, code source) est la propriété
        exclusive de <Fill>[À COMPLÉTER : dénomination sociale]</Fill> ou utilisé sous
        licence. La marque « Barbaria » est{" "}
        <Fill>[À COMPLÉTER : marque déposée OMPIC n° XXXX, ou en cours de dépôt]</Fill>.
      </p>
      <p>
        Toute reproduction, représentation, modification, publication, adaptation,
        transmission ou exploitation commerciale, totale ou partielle, sans autorisation
        écrite préalable, est interdite et constitue une contrefaçon sanctionnée par les
        articles 64 et suivants de la loi marocaine n° 2-00 relative aux droits d&apos;auteur
        et droits voisins.
      </p>

      <h2>5. Activité réglementée</h2>
      <p>
        Le cas échéant, lorsque les produits cosmétiques sont fabriqués ou importés par
        l&apos;éditeur :
      </p>
      <ul>
        <li>
          Numéro de notification cosmétique (Direction du Médicament et de la Pharmacie,
          DMP) : <Fill>[À COMPLÉTER si applicable]</Fill>
        </li>
        <li>
          Numéro d&apos;agrément ONSSA (épicerie fine) :{" "}
          <Fill>[À COMPLÉTER si applicable]</Fill>
        </li>
      </ul>

      <h2>6. Crédits</h2>
      <ul>
        <li>Conception et développement : <Fill>[À COMPLÉTER]</Fill></li>
        <li>Photographies : <Fill>[À COMPLÉTER]</Fill></li>
      </ul>

      <h2>7. Données personnelles</h2>
      <p>
        Le traitement des données personnelles effectué sur ce site est détaillé dans
        notre <Link href="/legal/privacy">politique de confidentialité</Link>. Une
        déclaration auprès de la Commission Nationale de Contrôle de la Protection des
        Données à Caractère Personnel (CNDP) a été déposée sous le numéro{" "}
        <Fill>[À COMPLÉTER : numéro de récépissé CNDP]</Fill>, conformément à la loi
        marocaine n° 09-08.
      </p>
    </>
  );
}

function EnglishContent() {
  return (
    <>
      <h2>1. Publisher</h2>
      <p>
        This website is published by <Fill>[CLIENT-FILL: legal name]</Fill>, a{" "}
        <Fill>[CLIENT-FILL: company form, e.g. SARL / SARL AU / SA]</Fill> with a
        share capital of <Fill>[CLIENT-FILL: capital in MAD]</Fill>, registered office
        at <Fill>[CLIENT-FILL: full address, Marrakech, Morocco]</Fill>.
      </p>
      <ul>
        <li>Commercial Register (RC): <Fill>[CLIENT-FILL: RC Marrakech No. XXXXX]</Fill></li>
        <li>Common Business Identifier (ICE): <Fill>[CLIENT-FILL: 15 digits]</Fill></li>
        <li>Tax Identifier (IF): <Fill>[CLIENT-FILL]</Fill></li>
        <li>Professional Tax (Patente): <Fill>[CLIENT-FILL]</Fill></li>
        <li>Social Security (CNSS, if applicable): <Fill>[CLIENT-FILL]</Fill></li>
        <li>Phone: +212 6 59 65 88 63</li>
        <li>Email: contact@barbariamorocco.com</li>
      </ul>

      <h2>2. Publication Director</h2>
      <p>
        The publication director is{" "}
        <Fill>[CLIENT-FILL: full name of the legal representative]</Fill>, acting as
        legal representative of the company.
      </p>

      <h2>3. Hosting</h2>
      <p>The website is hosted by:</p>
      <ul>
        <li>
          <strong>Vercel Inc.</strong>
          <br />
          440 N Barranca Avenue, #4133, Covina, CA 91723, United States
          <br />
          Website: <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">https://vercel.com</a>
          <br />
          Contact: privacy@vercel.com
        </li>
      </ul>
      <p>User data is stored with our database provider:</p>
      <ul>
        <li>
          <strong>Supabase Inc.</strong>
          <br />
          970 Toa Payoh North #07-04, Singapore 318992
          <br />
          Storage region in use:{" "}
          <Fill>[CLIENT-FILL: e.g. eu-west-1 Frankfurt / eu-west-3 Paris]</Fill>
        </li>
      </ul>

      <h2>4. Intellectual Property</h2>
      <p>
        All content on this site (text, photography, video, illustrations, logos,
        trademarks, layout, source code) is the exclusive property of{" "}
        <Fill>[CLIENT-FILL: legal name]</Fill> or used under licence. The "Barbaria"
        trademark is{" "}
        <Fill>[CLIENT-FILL: registered with OMPIC under No. XXXX, or pending]</Fill>.
      </p>
      <p>
        Any reproduction, representation, modification, publication, adaptation,
        transmission or commercial exploitation, in whole or in part, without prior
        written authorisation is prohibited and constitutes counterfeiting under
        articles 64 and following of Moroccan law No. 2-00 on copyright and related
        rights.
      </p>

      <h2>5. Regulated Activity</h2>
      <p>Where the publisher manufactures or imports the products presented:</p>
      <ul>
        <li>
          Cosmetic notification number (Direction du Médicament et de la Pharmacie,
          DMP): <Fill>[CLIENT-FILL, if applicable]</Fill>
        </li>
        <li>
          ONSSA registration number (fine grocery):{" "}
          <Fill>[CLIENT-FILL, if applicable]</Fill>
        </li>
      </ul>

      <h2>6. Credits</h2>
      <ul>
        <li>Design and development: <Fill>[CLIENT-FILL]</Fill></li>
        <li>Photography: <Fill>[CLIENT-FILL]</Fill></li>
      </ul>

      <h2>7. Personal Data</h2>
      <p>
        Processing of personal data on this site is detailed in our{" "}
        <Link href="/legal/privacy">privacy policy</Link>. A declaration has been
        filed with the Commission Nationale de Contrôle de la Protection des Données à
        Caractère Personnel (CNDP) under reference{" "}
        <Fill>[CLIENT-FILL: CNDP receipt number]</Fill>, in accordance with Moroccan
        law No. 09-08.
      </p>
    </>
  );
}
