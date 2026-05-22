# Guide de déclaration CNDP, Barbaria Morocco

Document à destination de la gérante (Inass MOUSSADEK) ou du DPO désigné.
Décrit pas à pas les déclarations à déposer auprès de la **Commission
Nationale de contrôle de la protection des Données à caractère Personnel**
(CNDP) pour mettre le site barbariamorocco.com en conformité avec la
**loi marocaine n° 09-08**.

---

## 1. Pourquoi cette démarche est obligatoire

La loi 09-08 impose à toute entité qui traite des données personnelles
au Maroc de **déclarer** ce traitement à la CNDP **avant** sa mise en
œuvre. Le site Barbaria collecte des données via le formulaire de contact
(nom, email, téléphone, message) et les envoie à des serveurs situés
hors du Maroc (Supabase à Francfort, Vercel en réseau global). Deux
déclarations sont donc requises :

1. **Déclaration préalable** du fichier « Prospects / contacts site web »
2. **Déclaration de transfert** des données vers l'étranger (UE)

La déclaration est **gratuite**. Le récépissé est délivré sous **2 mois**
en moyenne. Sans récépissé, l'activité reste exposée à des sanctions
(amendes de 10 000 à 300 000 MAD, voire pénales en cas de récidive).

---

## 2. Préparation des pièces justificatives

À préparer en PDF avant de commencer (scans ou exports) :

| # | Document | Source |
|---|---|---|
| 1 | CIN recto/verso de la gérante (Inass MOUSSADEK) | Personnel |
| 2 | Statuts de la SARL | Notaire / dossier de constitution |
| 3 | Certificat d'immatriculation au Registre du Commerce | Tribunal de commerce de Casablanca (RC n° 719643) |
| 4 | Attestation ICE | Portail ICE (003829477000010) |
| 5 | Capture d'écran du formulaire de contact du site | barbariamorocco.com/contact |
| 6 | Capture d'écran de la politique de confidentialité | barbariamorocco.com/legal/privacy |
| 7 | Capture d'écran de la bannière cookies | Page d'accueil du site |

---

## 3. Création du compte sur le portail CNDP

1. Aller sur **https://www.cndp.ma**
2. Cliquer sur **« Téléservices »** dans le menu principal
3. Choisir **« Créer un compte »**
4. Sélectionner le profil **« Personne morale »**
5. Renseigner :
   - Raison sociale : **Barbaria Morocco**
   - Forme juridique : **SARL**
   - ICE : **003829477000010**
   - RC : **719643, Casablanca**
   - Nom du responsable du traitement : **Inass MOUSSADEK** (gérante)
   - Email de contact : (email professionnel de la gérante)
   - Téléphone : **+212 6 59 65 88 63**
6. Confirmer l'email reçu dans la boîte de réception

---

## 4. Déclaration n° 1 : Fichier « Prospects / contacts site web »

Depuis le tableau de bord, cliquer sur **« Nouvelle déclaration »**, puis
choisir **« Déclaration préalable ordinaire »**.

### Section A. Identité du responsable du traitement
- Pré-remplie depuis le compte. Vérifier l'exactitude.

### Section B. Finalité du traitement
> *Gestion des demandes d'information et de devis émanant de clients
> professionnels potentiels (hôtels, spas, distributeurs, particuliers)
> via le formulaire de contact du site barbariamorocco.com. Constitution
> d'un fichier de prospects pour le suivi commercial.*

### Section C. Catégories de données collectées
Cocher / saisir :
- Identité : **nom, prénom**
- Coordonnées : **adresse email, numéro de téléphone**
- Vie professionnelle : **société, fonction (optionnel)**
- Données de connexion : **adresse IP (conservée 30 jours pour la
  prévention d'abus)**

### Section D. Personnes concernées
- Clients professionnels (B2B)
- Particuliers ayant soumis une demande de devis

### Section E. Destinataires des données
- Personnel commercial interne de Barbaria Morocco
- Sous-traitants techniques :
  - **Supabase Inc.** (hébergement base de données, Francfort, UE)
  - **Vercel Inc.** (hébergement applicatif, global)

### Section F. Durée de conservation
- Données de prospects : **3 ans à compter du dernier contact**
- Logs techniques : **30 jours**
- Consentement cookies : **6 mois**

### Section G. Mesures de sécurité
> *Connexions chiffrées HTTPS (TLS 1.3), authentification multi-facteurs
> sur les comptes administrateurs, politiques de sécurité au niveau base
> de données (Row Level Security PostgreSQL), journalisation des actions
> administratives, sauvegardes chiffrées quotidiennes, limitation par
> adresse IP du formulaire de contact pour prévenir les abus.*

### Section H. Droits des personnes
> *Droit d'accès, de rectification, d'opposition, d'effacement et de
> portabilité exercé par email à privacy@barbariamorocco.com.
> Réponse sous 30 jours conformément à l'article 7 de la loi 09-08.*

Joindre les pièces 1 à 7 (cf. section 2). Soumettre.

---

## 5. Déclaration n° 2 : Transfert de données vers l'étranger

Depuis le tableau de bord, **« Nouvelle déclaration »** → **« Déclaration
de transfert hors du Maroc »**.

### Pays de destination
- **Allemagne** (région UE), pour Supabase (base de données et stockage
  fichiers, datacentres à Francfort)
- **États-Unis**, pour Vercel (siège social, certains nœuds CDN)

### Base légale du transfert (article 43 de la loi 09-08)
Pour l'Allemagne :
> *Pays de l'Union européenne reconnu comme offrant un niveau de
> protection adéquat (décision de la CNDP du 22 mars 2010).*

Pour les États-Unis :
> *Transfert encadré par les Clauses Contractuelles Types (Standard
> Contractual Clauses) signées avec le sous-traitant Vercel Inc.
> Le Data Processing Addendum est disponible sur demande.*

### Garanties contractuelles
Joindre :
- Le **DPA Supabase** (téléchargeable sur supabase.com/legal/dpa)
- Le **DPA Vercel** (téléchargeable sur vercel.com/legal/dpa)

Ces deux documents doivent être signés côté Barbaria avant le dépôt.
Demander à l'équipe technique de fournir les versions signées si ce
n'est pas déjà fait.

Soumettre.

---

## 6. Après le dépôt

1. La CNDP envoie un **accusé de réception** sous 48 h
2. Un agent CNDP peut demander des compléments par email ; répondre dans
   les **15 jours**
3. Le **récépissé définitif** arrive sous 1 à 2 mois
4. Conserver le récépissé : il doit être présentable en cas de contrôle
   et **affiché en pied de page** du site (numéro + date)

Une fois reçu, transmettre le numéro à l'équipe technique. Il sera
ajouté automatiquement aux mentions légales (champ déjà prévu dans le
code, `cndpReceiptNumber`).

---

## 7. Maintenance

Une nouvelle déclaration est nécessaire **dès qu'un de ces éléments
change** :

- Ajout d'un nouveau sous-traitant qui traite des données (ex. ajout
  d'un service email marketing comme Mailchimp ou Resend)
- Changement de finalité (ex. ajout d'une boutique en ligne avec
  paiement, qui transformerait le fichier prospects en fichier clients)
- Changement de pays d'hébergement
- Collecte de nouvelles catégories de données (ex. données de paiement)

Délai de mise à jour : **dans le mois** suivant le changement.

---

## 8. Contact CNDP

- Adresse : **Avenue Mehdi Ben Barka, Rabat, Hay Riad**
- Téléphone : **+212 5 37 57 26 90**
- Email : **contact@cndp.ma**
- Portail : **https://www.cndp.ma**

---

## 9. Récapitulatif des actions

- [ ] Créer le compte CNDP au nom de la gérante
- [ ] Préparer les 7 pièces justificatives (PDF)
- [ ] Signer les DPA Supabase et Vercel
- [ ] Déposer la déclaration n° 1 (fichier prospects)
- [ ] Déposer la déclaration n° 2 (transfert hors Maroc)
- [ ] Attendre l'accusé de réception (48 h)
- [ ] Répondre aux éventuelles demandes de complément (15 jours)
- [ ] Transmettre le récépissé à l'équipe technique pour affichage
