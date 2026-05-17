# Barbaria Morocco, Informations légales à fournir

**À transmettre à la maison Barbaria pour finaliser le site avant la mise en
ligne.** Document bilingue volontairement, à envoyer tel quel.

Toutes les valeurs ci-dessous remplissent des champs juridiques rendus
obligatoires par la loi marocaine 53-05 (échange électronique de données
juridiques), la loi 09-08 (protection des données personnelles), et la
LCEN française (visiteurs depuis la France et l'UE). Sans ces données,
trois des quatre pages légales du site restent à l'état de modèle.

Une fois reçues, ces valeurs s'éditent à un seul endroit dans le code
(`lib/legal/client-data.ts`) et se propagent aux quatre pages légales en
FR et EN simultanément. Aucun copier-coller multiple, pas de risque
d'incohérence FR/EN.

---

## Comment remplir ce document

Pour chaque ligne, indiquez la valeur exacte telle qu'elle figure sur le
document officiel d'origine. Si une catégorie ne s'applique pas (par
exemple, vous n'êtes pas fabricant cosmétique), écrivez « N/A » : nous
supprimerons la ligne du site.

---

## Section 1 — Identité juridique de l'entreprise

À retrouver sur **les statuts** + **l'extrait du Registre de Commerce**.

| # | Champ | Format attendu | Votre réponse |
|---|---|---|---|
| 1 | Dénomination sociale exacte | ex. « Barbaria SARL » ou « Barbaria SARL AU » | |
| 2 | Forme juridique | SARL / SARL AU / SA / autre | |
| 3 | Capital social en MAD | ex. « 100 000 MAD » | |
| 4 | Adresse complète du siège social | rue + numéro + arrondissement + Marrakech, Maroc | |
| 5 | Nom complet du gérant ou représentant légal | prénom + nom, qualité (gérant, président, etc.) | |

---

## Section 2 — Identifiants officiels

À retrouver sur la **carte ICE OMPIC**, la **carte d'identification fiscale
(IF) DGI**, l'**extrait du Registre de Commerce**, et l'**avis de Taxe
Professionnelle**.

| # | Champ | Format attendu | Votre réponse |
|---|---|---|---|
| 6 | Numéro RC (Registre de Commerce) | ex. « RC Marrakech n° 12345 » | |
| 7 | ICE (Identifiant Commun de l'Entreprise) | 15 chiffres exactement | |
| 8 | IF (Identifiant Fiscal) | numéro DGI | |
| 9 | Patente / Taxe Professionnelle | numéro TP | |

---

## Section 3 — Marque

À retrouver sur le **certificat de dépôt OMPIC** de la marque « Barbaria ».

| # | Champ | Format attendu | Votre réponse |
|---|---|---|---|
| 10 | N° de dépôt OMPIC de la marque « Barbaria » | ex. « OMPIC n° 234567 », ou « en cours de dépôt », ou « non déposée » | |

---

## Section 4 — Activité réglementée (uniquement si applicable)

Renseignez seulement les lignes qui correspondent à votre activité réelle.
Les lignes non applicables seront retirées du site.

| # | Champ | Quand applicable | Votre réponse |
|---|---|---|---|
| 11 | N° de notification cosmétique DMP | Si Barbaria fabrique ou importe les cosmétiques. Sinon : « N/A, distributeur ». | |
| 12 | N° d'agrément ONSSA | Si Barbaria manipule, stocke ou conditionne les produits alimentaires (huile d'argan, safran, miels, épices, etc.). Sinon : « N/A ». | |

---

## Section 5 — Démarches CNDP (déclaration des données personnelles)

**Étapes manuelles à effectuer une seule fois sur https://www.cndp.ma** :

### 5.A. Déclaration normale du traitement (article 12 de la loi 09-08)

Déposez une déclaration normale pour le traitement « gestion des
demandes B2B via le formulaire de contact du site ». La CNDP renvoie
un récépissé avec un numéro de référence.

| # | Champ | Format attendu | Votre réponse |
|---|---|---|---|
| 13 | N° de récépissé CNDP | Format « D-XXX/AAAA » (D-numéro/année) | |

### 5.B. Autorisation de transfert hors du Maroc (article 17 de la loi 09-08)

Déposez une demande d'autorisation de transfert vers les États-Unis
(Vercel + Formspree) et vers l'Union européenne (Supabase Frankfurt).
La CNDP renvoie une référence d'autorisation.

| # | Champ | Format attendu | Votre réponse |
|---|---|---|---|
| 14 | Référence d'autorisation CNDP transfert hors Maroc | ex. « DA-XXX/AAAA », ou « demande en cours sous référence … » | |

---

## Section 6 — Crédits (facultatif mais d'usage en luxe)

| # | Champ | Format attendu | Votre réponse |
|---|---|---|---|
| 15 | Conception et développement | ex. « En interne » ou nom de l'agence | |
| 16 | Photographies | ex. « Photographe principal : XYZ », ou « Studio interne », ou laissez vide | |

---

## Annexe — Configurations techniques déjà fixées par l'ingénierie

Les champs ci-dessous sont déjà renseignés dans le code, vous n'avez rien
à faire. Cette annexe sert uniquement à confirmer les choix d'hébergement
décrits dans les politiques légales du site.

| Élément | Valeur fixée | Modifiable plus tard ? |
|---|---|---|
| Hébergeur applicatif | Vercel Inc., Covina CA, États-Unis | Oui, mais aurait un impact majeur sur la pile |
| Hébergeur base de données | Supabase Inc., région **eu-west-1 (Francfort)** | Oui, en changeant de région dans le tableau de bord Supabase |
| Email de contact général | contact@barbariamorocco.com | À créer chez Cloudflare Email Routing une fois le domaine en place |
| Email confidentialité | privacy@barbariamorocco.com | Idem |
| Email conciergerie | concierge@barbariamorocco.com | Idem |
| Téléphone affiché | +212 6 59 65 88 63 | À confirmer avec la maison si différent |

---

## Récapitulatif, ordre suggéré pour récupérer les données

1. **5 minutes, depuis vos statuts** : champs 1 à 5.
2. **5 minutes, depuis vos cartes officielles** (ICE, IF, RC, TP) : champs 6 à 9.
3. **2 minutes, depuis votre certificat OMPIC** : champ 10.
4. **Variable, selon votre activité** : champs 11 et 12.
5. **1 à 2 semaines, dépôt et délai CNDP** : champs 13 et 14. Le site
   peut être mis en ligne avec ces champs encore au statut « demande en
   cours », à condition que les démarches soient effectivement engagées.
6. **5 minutes, à votre convenance** : champs 15 et 16.

Une fois les données reçues, mise à jour dans le code en moins de
quinze minutes, et redéploiement automatique sur Vercel.
