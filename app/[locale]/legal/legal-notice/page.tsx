import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import LegalShell from "@/components/legal/LegalShell";
import { L } from "@/components/legal/LegalValue";
import { CLIENT_DATA } from "@/lib/legal/client-data";
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
        Le présent site est édité par <L>{CLIENT_DATA.legalName.fr}</L>,
        société <L>{CLIENT_DATA.companyForm.fr}</L> au capital social
        de <L>{CLIENT_DATA.capital.fr}</L>, dont le siège social est
        situé <L>{CLIENT_DATA.fullAddress.fr}</L>.
      </p>
      <ul>
        <li>Registre de Commerce (RC) : <L>{CLIENT_DATA.rcNumber.fr}</L></li>
        <li>Identifiant Commun de l&apos;Entreprise (ICE) : <L>{CLIENT_DATA.iceNumber.fr}</L></li>
        <li>Identifiant Fiscal (IF) : <L>{CLIENT_DATA.ifNumber.fr}</L></li>
        <li>Taxe Professionnelle (Patente) : <L>{CLIENT_DATA.patenteNumber.fr}</L></li>
        <li>Téléphone : +212 6 59 65 88 63 / +212 6 17 83 04 10</li>
        <li>Email : contact@barbariamorocco.com</li>
      </ul>

      <h2>2. Directeur de la publication</h2>
      <p>
        Le directeur de la publication est{" "}
        <L>{CLIENT_DATA.directorName.fr}</L>, en sa qualité de
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
          Région de stockage utilisée : <L>{CLIENT_DATA.supabaseRegion.fr}</L>
        </li>
      </ul>

      <h2>4. Propriété intellectuelle</h2>
      <p>
        L&apos;ensemble des contenus présents sur ce site (textes, photographies, vidéos,
        illustrations, logos, marques, mise en page, code source) est la propriété
        exclusive de <L>{CLIENT_DATA.legalName.fr}</L> ou utilisé sous
        licence. La marque « Barbaria » est{" "}
        <L>{CLIENT_DATA.ompicMark.fr}</L>.
      </p>
      <p>
        Toute reproduction, représentation, modification, publication, adaptation,
        transmission ou exploitation commerciale, totale ou partielle, sans autorisation
        écrite préalable, est interdite et constitue une contrefaçon sanctionnée par les
        articles 64 et suivants de la loi marocaine n° 2-00 relative aux droits d&apos;auteur
        et droits voisins.
      </p>

      <h2>5. Données personnelles</h2>
      <p>
        Le traitement des données personnelles effectué sur ce site est détaillé dans
        notre <Link href="/legal/privacy">politique de confidentialité</Link>,
        conformément au Règlement Général sur la Protection des Données (UE 2016/679)
        et à la loi marocaine n° 09-08.
      </p>
    </>
  );
}

function EnglishContent() {
  return (
    <>
      <h2>1. Publisher</h2>
      <p>
        This website is published by <L>{CLIENT_DATA.legalName.en}</L>, a{" "}
        <L>{CLIENT_DATA.companyForm.en}</L> with a share capital of{" "}
        <L>{CLIENT_DATA.capital.en}</L>, registered office at{" "}
        <L>{CLIENT_DATA.fullAddress.en}</L>.
      </p>
      <ul>
        <li>Commercial Register (RC): <L>{CLIENT_DATA.rcNumber.en}</L></li>
        <li>Common Business Identifier (ICE): <L>{CLIENT_DATA.iceNumber.en}</L></li>
        <li>Tax Identifier (IF): <L>{CLIENT_DATA.ifNumber.en}</L></li>
        <li>Professional Tax (Patente): <L>{CLIENT_DATA.patenteNumber.en}</L></li>
        <li>Phone: +212 6 59 65 88 63 / +212 6 17 83 04 10</li>
        <li>Email: contact@barbariamorocco.com</li>
      </ul>

      <h2>2. Publication Director</h2>
      <p>
        The publication director is{" "}
        <L>{CLIENT_DATA.directorName.en}</L>, acting as legal representative of
        the company.
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
          Storage region in use: <L>{CLIENT_DATA.supabaseRegion.en}</L>
        </li>
      </ul>

      <h2>4. Intellectual Property</h2>
      <p>
        All content on this site (text, photography, video, illustrations, logos,
        trademarks, layout, source code) is the exclusive property of{" "}
        <L>{CLIENT_DATA.legalName.en}</L> or used under licence. The "Barbaria"
        trademark is{" "}
        <L>{CLIENT_DATA.ompicMark.en}</L>.
      </p>
      <p>
        Any reproduction, representation, modification, publication, adaptation,
        transmission or commercial exploitation, in whole or in part, without prior
        written authorisation is prohibited and constitutes counterfeiting under
        articles 64 and following of Moroccan law No. 2-00 on copyright and related
        rights.
      </p>

      <h2>5. Personal Data</h2>
      <p>
        Processing of personal data on this site is detailed in our{" "}
        <Link href="/legal/privacy">privacy policy</Link>, in accordance with the
        EU General Data Protection Regulation (2016/679) and Moroccan law No. 09-08.
      </p>
    </>
  );
}
