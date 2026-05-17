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
    title: isFr ? "Politique de confidentialité" : "Privacy policy",
    description: isFr
      ? "Politique de confidentialité de Barbaria Morocco, en application du RGPD et de la loi 09-08."
      : "Privacy policy of Barbaria Morocco, under GDPR and Morocco law 09-08.",
    robots: { index: true, follow: true },
  };
}

export default async function PrivacyPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isFr = locale !== "en";

  return (
    <LegalShell
      eyebrow={isFr ? "Confidentialité" : "Privacy"}
      title={isFr ? "Politique de confidentialité" : "Privacy policy"}
      lastUpdated={isFr ? "Dernière mise à jour : 17 mai 2026" : "Last updated: May 17, 2026"}
    >
      {isFr ? <FrenchContent /> : <EnglishContent />}

      <hr className="border-bb-line mt-12" />
      <p className="legal-note">
        {isFr ? (
          <>
            Pour exercer vos droits, écrivez à{" "}
            <a href="mailto:privacy@barbariamorocco.com">privacy@barbariamorocco.com</a>.
            Voir aussi nos <Link href="/legal/legal-notice">mentions légales</Link>,
            nos <Link href="/legal/terms">conditions d&apos;utilisation</Link> et notre{" "}
            <Link href="/legal/cookies">politique de cookies</Link>.
          </>
        ) : (
          <>
            To exercise your rights, write to{" "}
            <a href="mailto:privacy@barbariamorocco.com">privacy@barbariamorocco.com</a>.
            See also our <Link href="/legal/legal-notice">legal notice</Link>, our{" "}
            <Link href="/legal/terms">terms of use</Link> and our{" "}
            <Link href="/legal/cookies">cookie policy</Link>. The French version of
            this policy prevails in case of discrepancy.
          </>
        )}
      </p>
    </LegalShell>
  );
}

function FrenchContent() {
  return (
    <>
      <p>
        La présente politique décrit les conditions dans lesquelles{" "}
        <L>{CLIENT_DATA.legalName.fr}</L> (ci-après « Barbaria »)
        collecte et traite les données à caractère personnel des visiteurs et des
        clients professionnels de son site, conformément au Règlement Général sur
        la Protection des Données (UE 2016/679, ci-après « RGPD ») et à la loi
        marocaine n° 09-08.
      </p>

      <h2>1. Responsable du traitement</h2>
      <p>
        <strong>Barbaria</strong>,{" "}
        <L>{CLIENT_DATA.legalName.fr}</L>, siège social :{" "}
        <L>{CLIENT_DATA.fullAddress.fr}</L>. RC, ICE et IF tels
        que mentionnés dans les <Link href="/legal/legal-notice">mentions légales</Link>.
      </p>
      <p>
        Contact dédié à la protection des données :{" "}
        <a href="mailto:privacy@barbariamorocco.com">privacy@barbariamorocco.com</a>.
      </p>

      <h2>2. Délégué à la protection des données</h2>
      <p>
        Compte tenu de la nature et du volume des traitements (site B2B, sans collecte
        de données sensibles, sans suivi à grande échelle), Barbaria n&apos;est pas
        soumise à l&apos;obligation de désigner un délégué à la protection des données
        au sens de l&apos;article 37 du RGPD. Pour toute question, vous pouvez écrire à
        l&apos;adresse ci-dessus.
      </p>

      <h2>3. Données collectées</h2>
      <p>Nous collectons :</p>
      <ul>
        <li>
          <strong>Données du formulaire de demande</strong> : prénom, nom, adresse
          email professionnelle, société, fonction, pays, téléphone (facultatif),
          contenu du message, type d&apos;acheteur (hôtel, spa, entreprise, distributeur).
        </li>
        <li>
          <strong>Données techniques collectées automatiquement</strong> : adresse IP
          (tronquée par notre hébergeur avant journalisation), agent utilisateur, page
          de provenance, pages visitées, localisation approximative au niveau du pays,
          horodatage.
        </li>
        <li>
          <strong>Données de performance</strong> : Core Web Vitals collectées par
          Vercel Speed Insights (LCP, INP, CLS), agrégées et sans donnée d&apos;identification
          directe.
        </li>
        <li>
          <strong>Cookies et technologies similaires</strong> : voir notre{" "}
          <Link href="/legal/cookies">politique de cookies</Link>.
        </li>
      </ul>
      <p>
        Aucune donnée de catégorie particulière (santé, opinion, origine, biométrie)
        n&apos;est collectée. Aucune décision automatisée n&apos;est prise à votre égard.
      </p>

      <h2>4. Finalités</h2>
      <ul>
        <li>Répondre à votre demande et préparer une proposition commerciale (devis).</li>
        <li>Gérer notre relation prospects et clients (CRM B2B).</li>
        <li>Améliorer le site par des analyses d&apos;audience agrégées.</li>
        <li>Respecter nos obligations comptables et légales.</li>
        <li>Assurer la sécurité du site et lutter contre les abus.</li>
      </ul>

      <h2>5. Bases légales</h2>
      <ul>
        <li>
          Réponse à une demande de devis : exécution de mesures précontractuelles à
          votre demande (art. 6.1.b RGPD ; art. 4 loi 09-08).
        </li>
        <li>
          Gestion CRM : intérêt légitime de Barbaria à entretenir la relation
          commerciale dans un contexte B2B (art. 6.1.f RGPD).
        </li>
        <li>
          Mesure d&apos;audience non strictement nécessaire : votre consentement
          recueilli via le bandeau cookies (art. 6.1.a RGPD ; art. 4 loi 09-08).
        </li>
        <li>
          Comptabilité et facturation : obligation légale (art. 6.1.c RGPD).
        </li>
        <li>
          Sécurité du site : intérêt légitime (art. 6.1.f RGPD).
        </li>
      </ul>

      <h2>6. Destinataires et sous-traitants</h2>
      <p>
        Vos données peuvent être communiquées à nos prestataires techniques agissant
        en qualité de sous-traitants au sens de l&apos;article 28 du RGPD :
      </p>
      <ul>
        <li>
          <strong>Vercel Inc.</strong> (hébergement, CDN) — 440 N Barranca Avenue,
          #4133, Covina, CA 91723, États-Unis. Garanties : certification EU-US Data
          Privacy Framework et clauses contractuelles types (CCT) intégrées au DPA
          de Vercel.
        </li>
        <li>
          <strong>Supabase Inc.</strong> (base de données, authentification
          administrateur) — 970 Toa Payoh North #07-04, Singapour 318992. Garanties :
          DPA Supabase incluant les CCT ; région de stockage :{" "}
          <L>{CLIENT_DATA.supabaseRegion.fr}</L>.
        </li>
        <li>
          <strong>Formspree (Roboflow Studios LLC)</strong> — Boston, MA, États-Unis.
          Garanties : EU-US Data Privacy Framework et CCT.
        </li>
        <li>
          <strong>Équipe interne Barbaria</strong> — Marrakech, accédant aux données
          de demande dans le cadre du traitement des prospects et clients.
        </li>
      </ul>

      <h2>7. Transferts hors du Maroc et hors de l&apos;Union européenne</h2>
      <p>
        Certains de nos prestataires sont situés aux États-Unis. Les transferts
        s&apos;appuient sur la décision d&apos;adéquation EU-US Data Privacy Framework
        (lorsque le prestataire y est certifié) et sur les clauses contractuelles
        types adoptées par la Commission européenne (décision 2021/914). Pour les
        transferts depuis le Maroc, l&apos;autorisation de la CNDP au titre de
        l&apos;article 17 de la loi 09-08 a été{" "}
        <L>{CLIENT_DATA.cndpTransferAuth.fr}</L>.
      </p>

      <h2>8. Durées de conservation</h2>
      <ul>
        <li>
          Demandes de prospects sans suite : 3 ans à compter du dernier contact.
        </li>
        <li>
          Données clients : durée de la relation commerciale, puis archivage pendant
          10 ans pour les obligations comptables (article 22 du Code de commerce
          marocain).
        </li>
        <li>
          Journaux d&apos;hébergement (Vercel) : 30 jours environ, conformément à la
          politique de notre hébergeur.
        </li>
        <li>
          Mesure d&apos;audience : hash de session rotatif, expirant sous 24 heures.
        </li>
        <li>
          Choix de consentement aux cookies : 12 mois, puis réinvitation.
        </li>
      </ul>

      <h2>9. Vos droits</h2>
      <p>
        Conformément au RGPD et à la loi 09-08, vous disposez des droits suivants :
      </p>
      <ul>
        <li>Droit d&apos;accès (art. 15 RGPD ; art. 7 loi 09-08).</li>
        <li>Droit de rectification (art. 16 RGPD ; art. 8 loi 09-08).</li>
        <li>Droit d&apos;effacement (art. 17 RGPD ; art. 9 loi 09-08).</li>
        <li>Droit à la limitation du traitement (art. 18 RGPD).</li>
        <li>Droit à la portabilité de vos données (art. 20 RGPD).</li>
        <li>Droit d&apos;opposition (art. 21 RGPD ; art. 10 loi 09-08).</li>
        <li>Droit de retirer votre consentement à tout moment (art. 7.3 RGPD).</li>
        <li>
          Droit de définir des directives post-mortem (art. 85 de la loi Informatique
          et Libertés, pour les personnes résidant en France).
        </li>
      </ul>
      <p>
        Pour exercer ces droits, écrivez à{" "}
        <a href="mailto:privacy@barbariamorocco.com">privacy@barbariamorocco.com</a>
        {" "}avec une copie d&apos;un justificatif d&apos;identité. Nous répondrons sous un mois.
      </p>

      <h2>10. Réclamation</h2>
      <p>Vous pouvez introduire une réclamation auprès de :</p>
      <ul>
        <li>
          <strong>CNDP, Maroc</strong> — Commission Nationale de Contrôle de la
          Protection des Données à Caractère Personnel, Angle Boulevard Annakhil et
          Avenue Mehdi Ben Barka, Immeuble Les Patios, 3ème étage, Hay Riad, Rabat.
          Tél. +212 5 37 57 11 24. Email : contact@cndp.ma. Site :{" "}
          <a href="https://www.cndp.ma" target="_blank" rel="noopener noreferrer">www.cndp.ma</a>.
        </li>
        <li>
          <strong>Autorité de contrôle de votre lieu de résidence dans l&apos;UE</strong>.
          Exemple pour la France : CNIL, 3 place de Fontenoy, TSA 80715, 75334 Paris
          Cedex 07.{" "}
          <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">www.cnil.fr</a>.
        </li>
      </ul>

      <h2>11. Sécurité</h2>
      <p>
        Nous mettons en œuvre des mesures techniques et organisationnelles
        appropriées : chiffrement HTTPS/TLS, mots de passe administrateurs hachés,
        séparation des privilèges via les règles de sécurité au niveau ligne de
        Supabase, chiffrement au repos AES-256, sauvegardes régulières, accès
        administrateur restreint.
      </p>

      <h2>12. Modifications</h2>
      <p>
        Cette politique peut être mise à jour pour tenir compte de l&apos;évolution
        du site ou de la réglementation. Les modifications substantielles seront
        signalées via le bandeau cookies ou par email aux contacts connus. La date
        de mise à jour figure en haut de cette page.
      </p>
    </>
  );
}

function EnglishContent() {
  return (
    <>
      <p>
        This policy describes how <L>{CLIENT_DATA.legalName.en}</L> ("Barbaria")
        collects and processes personal data of visitors and professional clients of
        its website, in accordance with the EU General Data Protection Regulation
        (2016/679, "GDPR") and Moroccan law No. 09-08.
      </p>

      <h2>1. Controller</h2>
      <p>
        <strong>Barbaria</strong>, <L>{CLIENT_DATA.legalName.en}</L>, registered
        office: <L>{CLIENT_DATA.fullAddress.en}</L>. RC, ICE and
        IF as stated in our <Link href="/legal/legal-notice">legal notice</Link>.
      </p>
      <p>
        Dedicated contact for data protection:{" "}
        <a href="mailto:privacy@barbariamorocco.com">privacy@barbariamorocco.com</a>.
      </p>

      <h2>2. Data Protection Officer</h2>
      <p>
        Given the nature and volume of processing (B2B site, no sensitive data, no
        large-scale monitoring), Barbaria is not required to appoint a Data Protection
        Officer under GDPR Article 37. For any question, use the contact address
        above.
      </p>

      <h2>3. Data Collected</h2>
      <p>We collect:</p>
      <ul>
        <li>
          <strong>Inquiry form data</strong>: first name, last name, professional
          email, company, role, country, phone (optional), message content, buyer
          type (hotel, spa, corporate, retail).
        </li>
        <li>
          <strong>Technical data, auto-collected</strong>: IP address (truncated by
          our host before logging), user agent, referrer URL, pages visited,
          country-level approximate location, timestamp.
        </li>
        <li>
          <strong>Performance data</strong>: Core Web Vitals (LCP, INP, CLS) collected
          by Vercel Speed Insights, aggregated, no direct identifiers.
        </li>
        <li>
          <strong>Cookies and similar</strong>: see our{" "}
          <Link href="/legal/cookies">cookie policy</Link>.
        </li>
      </ul>
      <p>
        No special-category data (health, opinions, origin, biometrics) is collected.
        No automated decision-making is performed.
      </p>

      <h2>4. Purposes</h2>
      <ul>
        <li>Respond to your inquiry and prepare a commercial proposal (quote).</li>
        <li>Manage our prospect and client relationship (B2B CRM).</li>
        <li>Improve the site through aggregated audience analytics.</li>
        <li>Comply with accounting and legal obligations.</li>
        <li>Maintain site security and prevent abuse.</li>
      </ul>

      <h2>5. Legal Basis</h2>
      <ul>
        <li>
          Responding to a quote request: pre-contractual measures at your request
          (GDPR art. 6.1.b; law 09-08 art. 4).
        </li>
        <li>
          CRM: legitimate interest of Barbaria in maintaining a B2B commercial
          relationship (GDPR art. 6.1.f).
        </li>
        <li>
          Non-essential audience measurement: your consent collected via the cookie
          banner (GDPR art. 6.1.a; law 09-08 art. 4).
        </li>
        <li>Accounting and invoicing: legal obligation (GDPR art. 6.1.c).</li>
        <li>Site security: legitimate interest (GDPR art. 6.1.f).</li>
      </ul>

      <h2>6. Recipients and Processors</h2>
      <p>
        Your data may be shared with our technical providers acting as processors
        under GDPR Article 28:
      </p>
      <ul>
        <li>
          <strong>Vercel Inc.</strong> (hosting, CDN) — 440 N Barranca Avenue, #4133,
          Covina, CA 91723, USA. Safeguards: EU-US Data Privacy Framework
          certification and Standard Contractual Clauses (SCCs) in Vercel's DPA.
        </li>
        <li>
          <strong>Supabase Inc.</strong> (database, admin authentication) — 970 Toa
          Payoh North #07-04, Singapore 318992. Safeguards: Supabase DPA including
          SCCs; storage region: <L>{CLIENT_DATA.supabaseRegion.en}</L>.
        </li>
        <li>
          <strong>Formspree (Roboflow Studios LLC)</strong> — Boston, MA, USA.
          Safeguards: EU-US Data Privacy Framework and SCCs.
        </li>
        <li>
          <strong>Barbaria internal team</strong> — Marrakech, accessing inquiry data
          to handle prospects and clients.
        </li>
      </ul>

      <h2>7. Transfers Outside Morocco and Outside the EU</h2>
      <p>
        Some of our providers are located in the United States. Transfers rely on the
        EU-US Data Privacy Framework adequacy decision (where the provider is
        certified) and on Standard Contractual Clauses adopted by the European
        Commission (decision 2021/914). For transfers from Morocco, CNDP authorisation
        under article 17 of law 09-08 has been{" "}
        <L>{CLIENT_DATA.cndpTransferAuth.en}</L>.
      </p>

      <h2>8. Retention Periods</h2>
      <ul>
        <li>Prospect inquiries without follow-on: 3 years from last contact.</li>
        <li>
          Client data: duration of the commercial relationship, then archived for 10
          years for accounting obligations (Moroccan Code de commerce art. 22).
        </li>
        <li>
          Hosting logs (Vercel): approximately 30 days, per our host's policy.
        </li>
        <li>Audience measurement: rotating session hash expiring within 24 hours.</li>
        <li>Cookie consent record: 12 months, then re-prompted.</li>
      </ul>

      <h2>9. Your Rights</h2>
      <p>Under GDPR and Moroccan law 09-08, you have the following rights:</p>
      <ul>
        <li>Right of access (GDPR art. 15; law 09-08 art. 7).</li>
        <li>Right to rectification (GDPR art. 16; law 09-08 art. 8).</li>
        <li>Right to erasure (GDPR art. 17; law 09-08 art. 9).</li>
        <li>Right to restriction of processing (GDPR art. 18).</li>
        <li>Right to data portability (GDPR art. 20).</li>
        <li>Right to object (GDPR art. 21; law 09-08 art. 10).</li>
        <li>Right to withdraw consent at any time (GDPR art. 7.3).</li>
        <li>
          Right to give post-mortem instructions (French Loi Informatique et Libertés
          art. 85, for residents of France).
        </li>
      </ul>
      <p>
        To exercise these rights, write to{" "}
        <a href="mailto:privacy@barbariamorocco.com">privacy@barbariamorocco.com</a>
        {" "}with a copy of identification. We respond within one month.
      </p>

      <h2>10. Complaints</h2>
      <p>You may lodge a complaint with:</p>
      <ul>
        <li>
          <strong>CNDP, Morocco</strong> — Commission Nationale de Contrôle de la
          Protection des Données à Caractère Personnel, Angle Boulevard Annakhil et
          Avenue Mehdi Ben Barka, Immeuble Les Patios, 3rd floor, Hay Riad, Rabat.
          Phone +212 5 37 57 11 24. Email: contact@cndp.ma. Site:{" "}
          <a href="https://www.cndp.ma" target="_blank" rel="noopener noreferrer">www.cndp.ma</a>.
        </li>
        <li>
          <strong>Your local EU supervisory authority</strong>. France example: CNIL,
          3 place de Fontenoy, TSA 80715, 75334 Paris Cedex 07.{" "}
          <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">www.cnil.fr</a>.
        </li>
      </ul>

      <h2>11. Security</h2>
      <p>
        We implement appropriate technical and organisational measures: HTTPS/TLS
        encryption, hashed admin passwords, row-level security policies in Supabase,
        AES-256 encryption at rest, regular backups, restricted admin access.
      </p>

      <h2>12. Updates</h2>
      <p>
        This policy may be updated to reflect changes to the site or to applicable
        law. Material changes will be signalled via the cookie banner or by email to
        known contacts. The last update date is shown at the top of this page.
      </p>
    </>
  );
}
