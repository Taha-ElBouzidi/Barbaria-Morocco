# Cahier des Charges , Site Web Barbaria Morocco

**Version :** 1.0
**Date :** 13 mai 2026
**Émetteur :** Taha El Bouzidi, CTO , Barbaria Morocco
**Objet :** Refonte et finalisation d'un site web B2B vitrine + tunnel de composition + back-office, pour une maison marocaine spécialisée dans les coffrets cadeaux d'épicerie fine et de cosmétiques naturels.

---

## 1. Préambule

Le présent document constitue le cahier des charges fonctionnel et technique du site web **barbariamorocco.com** (domaine à confirmer). Il est destiné à recueillir des offres chiffrées auprès de prestataires spécialisés dans la conception, le développement et la maintenance de sites web sur-mesure. Une base de code existe déjà (Next.js 16, TypeScript, Tailwind CSS 4, Supabase, Vercel). Elle peut être reprise, refactorisée, ou réécrite, à la discrétion du prestataire, à condition que les données existantes (produits, coffrets, contenus éditoriaux, traductions, images) soient préservées et migrées sans perte.

Ce document n'impose pas de stack technique précise ; il décrit les **exigences fonctionnelles, expérientielles, de performance, d'accessibilité et de maintenance** que la solution livrée devra satisfaire.

---

## 2. Contexte et présentation du client

**Barbaria Morocco** est une maison marocaine fondée sur la valorisation du terroir et des rituels ancestraux du Maroc. Elle propose deux univers de coffrets cadeaux destinés à une clientèle exclusivement B2B (hôtels, spas, distributeurs, programmes cadeaux d'entreprise, marque blanche pour autres maisons) :

- **Cosmétiques** : gommages, savons noirs beldi, huiles pures pressées à froid, sérums concentrés, hydrolats, huiles de massage parfumées. Six gammes couvrant 36 produits réels listés dans le catalogue B2B confidentiel.
- **Épicerie fine** : huiles d'argan alimentaire, safran de Taliouine, miels artisanaux, ras el hanout, amlou, sels de l'Atlas, etc. (catalogue en cours de constitution par la cliente).

Les produits sont fabriqués par des coopératives féminines marocaines ; chaque pièce porte la mention « Made in Morocco · Fait par des artisanes ». Le positionnement narratif s'appuie sur l'identité **amazighe** (berbère), le proverbe *« Nul n'est étranger sur la terre de ses ancêtres »* et l'alphabet **Tifinagh** (caractère emblématique : ⵣ Yaz, l'homme libre).

**Modèle économique :** vente B2B uniquement, par devis. Aucun paiement en ligne. Le site génère des **demandes de devis** que la conciergerie traite manuellement (à terme : envoi automatique d'emails transactionnels via API). Quantité minimum de commande (MOQ) définie par coffret, modifiable depuis l'administration.

**Marchés visés :** France, Émirats Arabes Unis, Arabie Saoudite, États-Unis, Canada, Maroc. Le site doit être bilingue **français (par défaut) / anglais**, avec routage URL par locale (`/fr/*` et `/en/*`).

---

## 3. Objectifs du projet

1. **Vitrine éditoriale** d'une maison luxe-héritage, ton sobre, palette beige/brun/or, typographie sérif Cormorant Garamond, esthétique « Sahara prestige ».
2. **Présentation par coffrets**, pas par produits individuels. Les produits existent comme composants des coffrets et restent navigables en lecture seule.
3. **Tunnel de composition immersif** permettant à l'acheteur de composer son propre coffret pas à pas, dans un format full-screen narratif type présentation animée.
4. **Panier de demande de devis** par coffret avec quantités ajustables et minimums respectés.
5. **Espace d'administration complet** permettant à la cliente de gérer le catalogue, les coffrets, les traductions, les occasions, les images et les demandes reçues, **y compris depuis un smartphone**.
6. **Conformité accessibilité WCAG 2.1 AA**, performance Lighthouse > 90, SEO optimisé en deux langues.
7. **Maintenabilité** : code structuré, documenté, testé, livré avec un guide d'administration en français.

---

## 4. Cibles utilisateurs

### Acheteurs B2B (utilisateurs publics du site)

- Acheteurs cadeaux d'entreprise (directions RH, communication interne)
- Concept-stores et distributeurs internationaux
- Programmes hôteliers et spa (5★ et boutique)
- Acheteurs de marque blanche (maisons souhaitant rebrander)

### Administrateurs (back-office)

- La fondatrice et son équipe (1 à 5 personnes)
- Niveau technique : faible à modéré. L'admin doit être utilisable sur **mobile et desktop** sans formation poussée.
- Multilingue : la fondatrice rédige les contenus en français ; l'anglais est traduit éditorialement.

---

## 5. Périmètre fonctionnel détaillé

### 5.1 Pages publiques

| Page | Description | Contenu attendu |
|---|---|---|
| **Accueil** | Hero pleine page, wordmark BARBARIA + MOROCCO, ornement amazigh, tagline. Bento à deux tuiles (Cosmétiques + Épicerie Fine), bloc éditorial, section ateliers/coopératives, citation de marque, pied de page. | Storytelling, deux entrées principales, CTA « Envoyez-nous une demande ». |
| **Cosmétiques** (`/products/cosmetiques`) | Hero immersif, liste des **coffrets curatés** d'abord, puis CTA « Composer votre propre coffret » en bas. | Carte par coffret : nom, slogan, image, MOQ, lien vers détail. |
| **Épicerie Fine** (`/products/epicerie_fine`) | Idem que ci-dessus, thématique caravane / route des épices. | Coffrets curatés en haut, composer en bas. |
| **Détail coffret** (`/products/[categorie]/[coffret]`) | Hero, nom, accroche, intro narrative, liste des pièces du coffret avec vignettes cliquables, encart à droite avec « Ajouter à la demande », sélecteur de quantité respectant le MOQ. | Pas de bouton « commander » ; uniquement « ajouter à la demande ». |
| **Tunnel composition** (`/products/[categorie]/composer`) | **Full-screen takeover**, sans en-tête ni pied de page. Présentation narrative qui défile par étapes (3, 5 ou 6 « étoiles » selon la taille de coffret choisie). Voir section 5.2. | Sortie : ajout d'un « Coffret sur mesure » à la demande. |
| **Détail produit** (`/product/[slug]`) | Lecture seule. Image, description, ingrédients, application, origine. **Pas de bouton d'achat**. À la place : section « Coffrets contenant cette pièce » avec liens vers les coffrets concernés. | Comportement de modale en sortie depuis le tunnel : retour sans rechargement de la page. |
| **Histoire** (`/story`) | Quatre chapitres + chapitre Tifinagh + proverbe amazigh de clôture. | Long-form éditorial. |
| **Ateliers** (`/ateliers`) | Six coopératives partenaires, grille de cartes. | Crédibilité, mise en avant du travail artisanal. |
| **Journal** (`/journal`) | Index éditorial des contenus de la maison. | Cartes article (les pages article peuvent attendre une phase ultérieure). |
| **Contact / Demande de devis** (`/contact`) | Formulaire en deux étapes, panier de la demande à droite, lignes directes, adresse de l'atelier. Détaillé section 5.3. | Voir 5.3. |
| **Pages légales** | Mentions légales, politique de confidentialité, CGU/CGV B2B, politique de cookies. | À rédiger en français et anglais. |

Toutes les pages doivent disposer d'un **switch FR/EN** dans l'en-tête et le pied de page.

### 5.2 Tunnel de composition (« Composer votre coffret »)

L'expérience pivot du site. Inspiration : pages produits Apple (scroll-driven), Stripe Sessions, configurateurs Nike By You / Lego, sites Locomotive Scroll. Stack proposée (non imposée) : **Framer Motion** ou **GSAP ScrollTrigger** + scroll snap CSS + transitions React 19.

**Comportement attendu :**

1. À l'entrée, la fenêtre prend l'écran complet. **Aucun élément de chrome** (en-tête, pied de page, breadcrumbs, menu) n'est visible. Seul un bouton de fermeture discret (X) en haut à droite permet de sortir.
2. **Étape 1 , Introduction.** Texte narratif de la catégorie (« Sous les étoiles du Sahara » pour cosmétiques, « Sur la route des caravanes » pour épicerie). Bouton « Commencer ».
3. **Étape 2 , Choix de la taille.** Trois cartes : 3, 5 ou 6 pièces. Sélection → transition vers l'étape 3.
4. **Étape 3..N , Sélection par slot.** À chaque étape :
   - Fragment narratif (1 à 2 phrases) lié au thème de la catégorie
   - Grille de produits éligibles à ce slot, filtrée par sous-catégorie
   - Chaque produit affiche : image, nom, courte accroche
   - Bouton « Plus de détails » ou clic sur l'image qui **zoome** dans le produit pour afficher la description complète, l'origine, les ingrédients, le mode d'application
   - Cette vue détaillée est une **superposition (modale animée)**, pas une navigation. Sortir revient exactement à l'étape sans perdre l'état.
   - Action : « Choisir » ajoute le produit au slot et passe à l'étape suivante ; « Passer cette étoile » avance sans choisir.
5. **Étape N+1 , Revue.** Récapitulatif : tous les slots, story arc complet, possibilité de modifier chaque slot.
6. **Étape N+2 , Quantité.** Saisie d'un nombre de coffrets souhaités (minimum configurable par l'admin, par défaut 5).
7. **Sortie : ajout à la demande.** Le tunnel génère un objet **« Coffret sur mesure »** dans le panier de demande, qui contient :
   - Référence : `custom-box-{timestamp}`
   - Quantité saisie
   - Composition : un exemplaire de chaque pièce choisie. Si l'utilisateur a saisi 5 coffrets, le devis listera 5× chaque pièce.
   - Statut : envoyé à l'admin pour traitement manuel (et plus tard automatique).

**Transitions :**
- Chaque passage d'étape est animé (slide horizontal, fondu enchaîné, ou défilement vertical avec scroll snap, au choix du prestataire mais cohérent).
- Le tout doit donner la sensation d'une **présentation cinématographique**, pas d'un formulaire web.
- Les particules dorées (effet « Sahara prestige » déjà existant sur les surfaces brunes) restent actives en arrière-plan.

**Comportements particuliers :**
- Persistance localStorage : la session reprend où elle s'était arrêtée si l'utilisateur ferme l'onglet.
- ESC ferme le tunnel avec confirmation si une composition est en cours.
- L'ouverture d'un produit en détail (zoom) doit utiliser **View Transitions API** (déjà câblée dans le projet) ou équivalent, pour une sensation de continuité.
- À la sortie d'un produit, retour exact à l'étape du tunnel sans rechargement.

### 5.3 Demande de devis (« Contact »)

Formulaire en deux étapes, panier de la demande visible à droite.

**Étape 01 , Votre maison** (FR) / **Your company** (EN)
- Nom de la société *
- Personne à contacter *
- Adresse email *
- Téléphone / WhatsApp

**Étape 02 , Le moment** / **The occasion**
- Sélection d'une occasion parmi une liste **administrée** : Fin d'année, Onboarding, Anniversaire, Presse, Mariage corporate, Saint-Valentin, Fête des Mères, Aïd el-Fitr, Aïd el-Adha, Ramadan, Noël, Hanouka, Nouvel An, Autre. **La liste doit être éditable depuis l'admin** (ajout, suppression, ordre, traductions par langue).
- Date d'événement
- Texte libre : « Parlez-nous du moment »

**La quantité disparaît du formulaire.** Elle est gérée **dans la barre latérale du panier**, ligne par ligne (un coffret = une ligne, quantité ajustable, MOQ respecté).

**Panier latéral :**
- Liste des coffrets ajoutés (curatés + sur-mesure)
- Pour chaque ligne : vignette, nom, badge « curated » ou « custom », sélecteur de quantité (− / +), MOQ affiché, bouton « Retirer »
- Sous-total visible : nombre de coffrets, nombre total de pièces
- Si vide : message d'invitation à parcourir les collections

**Soumission :**
- Validation Zod (champs requis, format email)
- Envoi du devis (phase 1 : email manuel via `mailto:`; phase 2 : POST `/api/inquiry` avec persistance Supabase + Resend transactional + Turnstile anti-spam , voir section 9.3 « Sécurité »)
- Confirmation : message remplaçant le formulaire (« Nous vous répondons sous 24h, votre concierge est attribué »)

### 5.4 Espace administrateur

Authentification email + mot de passe (pas de magic link, contrainte Supabase free-tier connue). Sessions persistantes avec rolling refresh tokens. Une page de connexion sobre, identité Barbaria.

**Modules CRUD :**

| Module | Opérations | Champs principaux |
|---|---|---|
| **Catégories** | Lire, modifier (création/suppression désactivées car 2 catégories fixes) | Slug, image hero, thème narratif, traductions FR/EN (nom, slogan, lede) |
| **Coffrets** | CRUD complet | Slug, catégorie, image hero, statut (brouillon/publié), MOQ par défaut, sortable, type (curaté ou composable), traductions FR/EN, composition (drag-drop des produits + réordonnancement) |
| **Produits** | CRUD complet | Slug, catégorie, ritual (tag interne), MOQ, formats, lead time, origine, étiquette ritual, héros, statut, traductions FR/EN (nom, court, lede), facettes, étapes d'application, images (upload Supabase Storage) |
| **Facettes** | CRUD par axe (ingrédient, usage, format, packaging, certification) | Valeurs FR/EN, ordre |
| **Occasions** *(nouveau)* | CRUD complet | Slug, traductions FR/EN, ordre, actif/inactif |
| **Ateliers** | CRUD complet | Slug, nom, région, année, image, traductions |
| **Journal** | CRUD complet (article éditorial textuel optionnel) | Slug, date, image, vedette, traductions |
| **Demandes (Inquiries)** | Lecture, modification de statut (Nouvelle, Contactée, Devisée, Gagnée, Perdue), notes internes | Détails de la maison, occasion, coffrets demandés avec quantités, message libre |
| **Activité (Audit log)** | Lecture filtrable par entité (produit, coffret, catégorie, etc.) et action (création, mise à jour, suppression, publication) | Acteur, horodatage, diff état avant/après |
| **Tableau de bord** | Stats simples : nombre de produits publiés, brouillons, coffrets publiés, demandes en cours, demandes ce mois | Liens rapides vers création |

**Exigences UX admin :**
- **Mobile-first** : la fondatrice doit pouvoir publier un coffret, modifier une description, ajouter une image et changer une quantité minimum depuis son téléphone.
- Barre latérale rétractable en drawer sur mobile, déclencheur burger dans la TopBar.
- Tables → cartes empilées en dessous du breakpoint tablette (768px).
- Champs de saisie pleine largeur sur mobile, labels au-dessus.
- Upload d'image avec aperçu, recadrage simple, alt-text obligatoire.
- Réordonnancement par boutons ↑↓ (pas de drag-drop sur mobile car incompatible avec tap).
- Boutons d'action ≥ 44×44 px (touch target WCAG).
- Confirmation explicite avant suppression destructive.
- Toast de confirmation pour chaque action (« Coffret enregistré », « Image uploadée »).
- Annulation possible dans les 5 secondes pour les suppressions (soft-delete optionnel).

---

## 6. Exigences techniques

### 6.1 Stack actuelle (à reprendre ou substituer)

- **Framework :** Next.js 16.2 (App Router, Turbopack, async params, View Transitions API)
- **Langage :** TypeScript 5
- **Style :** Tailwind CSS 4 (`@theme inline`), tokens CSS custom properties
- **i18n :** next-intl (locale prefix `as-needed`, défaut FR)
- **BDD :** PostgreSQL 17 (Supabase managé, projet `jnparcnvkghiuryarbac`, région eu-west-1)
- **ORM :** Drizzle ORM + migrations SQL versionnées
- **Auth :** Supabase Auth (email + mot de passe)
- **Storage :** Supabase Storage (bucket `product-images`, 8 Mo, MIME allowlist)
- **Animation :** motion (Framer Motion) v12, CSS transitions, View Transitions API
- **Hébergement :** Vercel
- **Analytique :** @vercel/analytics + speed-insights

Le prestataire peut proposer une autre stack (Remix, Astro, SvelteKit, etc.) à condition de garantir la migration des données et un coût total inférieur ou égal.

### 6.2 Schéma de base de données existant

Tables principales (déjà migrées sur Supabase) :
- `categories` (id, slug, sort_order, hero_image_path, story_theme_key, translations)
- `gift_boxes` (id, category_id, slug, status, is_customizable, default_quantity_min, hero_image_path, sort_order, translations, items)
- `products` (id, slug, ritual_id, category_id, subcategory_id, moq, formats, lead, origin, hero, status, translations, images, application_steps, facets)
- `rituals` (héritage de la première itération, conservée comme taxonomie interne)
- `ateliers`, `journal_cards`, `inquiries`, `inquiry_items`, `facets`, `admin_users`, `audit_log`

Ajouts à prévoir dans le périmètre :
- `occasions` (id, slug, sort_order, translations FR/EN, is_active)
- Modification de `inquiry_items` pour porter une référence à un coffret (custom ou curaté) + composition + quantité du coffret

**RLS Supabase :** Toutes les tables sont sous Row Level Security. Lecture publique restreinte aux lignes publiées. Écriture admin via une fonction `is_admin()` (SECURITY DEFINER) référencée dans les policies.

### 6.3 Hébergement, déploiement, CI/CD

- Déploiement continu via GitHub → Vercel.
- Branche `master` = production. Toute fusion déclenche un déploiement.
- Variables d'environnement gérées via Vercel + `.env.local` côté dév.
- Préviews de PR automatiques.
- Aucun script de build customisé requis (`next build`).

Le prestataire doit garantir :
- L'accès continu au dépôt GitHub
- L'accès au projet Supabase
- L'accès au compte Vercel
- La documentation de toutes les variables d'environnement requises

---

## 7. Exigences UX / Design

### 7.1 Charte graphique (existante, à respecter)

**Palette :**
- Fond principal (cream) : `#fcf9f3`
- Fond secondaire : `#f6f3ed`
- Couleur primaire (brun espresso) : `#2C1810`
- Or vif (sur fond brun) : `#c5a059`
- Or profond (sur fond crème, conforme WCAG AA) : `#8B6A2E`
- Texte principal : `#1c1c18`
- Texte secondaire : `#434843`
- Ligne (sandstone) : `#d1c7b7`

**Typographies :**
- Display : Cormorant Garamond (700, italic 400/600)
- Headline : Playfair Display (500/600)
- Body : Montserrat (400/500/600)
- Monospace : JetBrains Mono (chiffres spec uniquement)

**Identité visuelle :**
- Wordmark BARBARIA / MOROCCO en serif majuscules
- Ornement amazigh (deux losanges entrelacés, 4 pointes)
- Glyphe Tifinagh ⵣ (Yaz) comme marque ambient
- Effet **SaharaPrestige** (déjà implémenté) sur toutes les surfaces brunes : poussière d'or scintillante + halo qui dérive à vitesse constante avec direction aléatoire

### 7.2 Tonalité narrative

- **Cosmétiques** : « Sous les étoiles du Sahara » , métaphore de la constellation, chaque pièce est une étoile.
- **Épicerie fine** : « Sur la route des caravanes » , métaphore du voyage transsaharien, chaque pièce est une halte (Sijilmassa, Taliouine, Marrakech, Fès, Atlas).
- **Histoire** : Quatre chapitres (Antiquité, Médiéval, Tradition, Aujourd'hui) + chapitre Tifinagh + proverbe amazigh.
- Voix éditoriale : sobre, héritage, raffinement. Pas de jargon marketing.

### 7.3 Animations

- **SaharaPrestige** : actif partout où la surface est brune.
- **View Transitions API** : zoom de la vignette produit vers le hero produit (et retour).
- **Reveal on scroll** : éléments en fondu vers le haut (16px), stagger 80ms.
- **Hover lift** : cartes interactives, +2px translateY + ombre douce, 200ms.
- **Tunnel composition** : transitions full-screen entre étapes (cf. 5.2).
- Toutes les animations doivent respecter `prefers-reduced-motion` (déjà câblé dans la base existante).

---

## 8. Performance, SEO, accessibilité

### 8.1 Performance (Lighthouse, mobile)

| Métrique | Cible |
|---|---|
| LCP (Largest Contentful Paint) | < 2.5s |
| FID (First Input Delay) / INP | < 100ms / < 200ms |
| CLS (Cumulative Layout Shift) | < 0.1 |
| TBT (Total Blocking Time) | < 200ms |
| Performance Lighthouse score | ≥ 90 |
| Accessibility Lighthouse score | ≥ 95 |
| Best Practices Lighthouse score | ≥ 95 |
| SEO Lighthouse score | ≥ 95 |

**Optimisations attendues :**
- Images servies en AVIF/WebP via `next/image` ou équivalent
- Hero photo précachée
- Fonts chargées en `font-display: swap` avec preconnect
- Code splitting automatique par route
- Pas de tracking tiers en dehors d'@vercel/analytics

### 8.2 SEO

- Rendu serveur (SSR/SSG) sur toutes les pages publiques
- Méta titre + description par page, dérivées du contenu
- Open Graph + Twitter card par page
- JSON-LD `Organization` + `Product` + `BreadcrumbList`
- Sitemap XML automatique incluant les deux locales
- Robots.txt
- Hreflang FR/EN
- URLs propres et stables (pas de paramètres de requête nécessaires)

### 8.3 Accessibilité (WCAG 2.1 AA)

- Contraste texte / fond ≥ 4.5:1 pour le corps, ≥ 3:1 pour les titres ≥ 18px
- Focus visible sur tout élément interactif (clavier)
- ARIA labels sur tous les boutons sans texte (icônes)
- Lecteur d'écran : annonces sur ajout au panier, changement d'étape du wizard, soumission de formulaire
- Hiérarchie de titres respectée (h1 → h2 → h3 sans saut)
- Lang attribute sur HTML et sur tout bloc dans une langue secondaire
- Skip-to-content link
- Drawer / modale : focus trap, ESC pour fermer, retour de focus à l'ouverture
- `prefers-reduced-motion` respecté
- Aucun élément interactif sous 44×44 px (touch targets)

Le prestataire devra livrer un **rapport d'audit Lighthouse + axe-core** sur l'ensemble des pages publiques et admin.

---

## 9. Sécurité, RGPD, données

### 9.1 Authentification administrateur

- Email + mot de passe Supabase Auth
- Rotation des refresh tokens
- Session HTTP-only cookie, Secure, SameSite=Lax
- Logout via formulaire POST (pas de Link prefetch , leçon apprise)
- Pas de Multi-Factor Authentication en phase 1 (à ajouter en phase 2)

### 9.2 RLS Supabase

- Lecture publique : uniquement les lignes `status = 'published'`
- Écriture publique : aucune
- Toute écriture admin via fonction `is_admin()` SECURITY DEFINER
- GRANT EXECUTE sur `is_admin()` à `anon` et `authenticated` pour éviter les erreurs « permission denied »

### 9.3 Soumission de devis (phase 2)

- POST `/api/inquiry` : validation Zod côté serveur
- Anti-spam : Cloudflare Turnstile (vérification token côté serveur) + honeypot
- Rate limiting : 5 demandes / minute / IP, 50 / jour / IP
- Sanitisation du texte libre (échappement HTML pour l'email envoyé)
- Persistance dans `inquiries` + `inquiry_items` (Supabase)
- Email transactionnel via **Resend** (ou équivalent) : un email à `concierge@barbariamorocco.com` + auto-réponse à l'expéditeur
- Domaine `barbariamorocco.com` à vérifier dans Resend (DKIM + SPF + DMARC)
- Webhook Resend pour bounces / plaintes, mis à jour dans le record `inquiries`

### 9.4 RGPD

- Bannière de cookies (uniquement si tracking tiers ajouté ; pour l'instant @vercel/analytics est sans cookie)
- Mentions légales accessibles depuis le pied de page
- Politique de confidentialité détaillée (données collectées, durée de conservation, droits)
- Formulaire de contact : opt-in explicite pour la prise de contact commerciale ultérieure
- Adresse du DPO ou contact dédié pour exercice des droits

---

## 10. Contenu et langues

### 10.1 Langues

- **Français** : langue par défaut, sans préfixe URL
- **Anglais** : préfixe `/en/*`
- Toutes les pages, tous les coffrets, tous les produits, toutes les facettes et toutes les occasions doivent disposer des deux traductions
- Toggle FR/EN dans l'en-tête et le pied de page
- Hreflang automatique
- Pluriels gérés via next-intl (`{count, plural, ...}`)
- Aucune chaîne UI ne doit être en français dans le bundle anglais (et inversement)

### 10.2 Contenus existants à reprendre

- 2 catégories (cosmétiques + épicerie fine) avec traductions FR/EN
- 36 produits cosmétiques (catalogue B2B PDF de la cliente, 6 gammes × 6 produits)
- 3 coffrets curatés cosmétiques (Nila & Fleur d'Oranger, Rose & Aker Fassi, Rituel Naturel)
- 2 coffrets placeholders épicerie fine (à compléter par la cliente une fois les produits alimentaires choisis)
- 6 ateliers / coopératives
- 6 cartes journal
- Contenu narratif (4 chapitres Histoire + 6 symboles Tifinagh + proverbe amazigh)
- ~40 valeurs de facettes (ingrédients, usages, formats, packagings, certifications)

### 10.3 Médias

- Photos produits : qualité haute (au moins 1600px côté long), format paysage et carré, fond neutre.
- À ce jour : un set de 24 photos placeholder de qualité moyenne fourni avec le projet. **Remplacement par des photos de production professionnelles à prévoir** (hors périmètre du prestataire web sauf si compétence photo).
- Vidéo héroïque optionnelle (10–15 secondes, plan paysage Atlas / atelier, format mp4 ≤ 4 Mo).

---

## 11. Livrables attendus

1. **Code source** versionné Git, accessible à la cliente, propre, commenté, sous licence cédée à Barbaria Morocco.
2. **Base de données** migrée et seedée avec les données existantes + nouveau schéma `occasions` + `inquiry_items` étendu.
3. **Documentation technique** :
   - README d'installation locale
   - Diagramme d'architecture
   - Liste des variables d'environnement
   - Procédure de déploiement
   - Procédure de seed et de migration
4. **Guide d'administration** en français (PDF + en ligne) : comment ajouter un coffret, modifier une description, gérer les occasions, suivre les demandes.
5. **Rapport d'audit** : Lighthouse (mobile + desktop), axe-core, performance Web Vitals sur les 5 principales pages.
6. **Tests** : suite Playwright couvrant les parcours critiques (cf. section 12).
7. **Charte design** : Figma ou équivalent, à jour avec les tokens CSS, les composants UI et les variantes mobile/desktop.
8. **Formation** : 2 sessions de 1 heure avec la cliente (admin desktop + admin mobile).
9. **Garantie** : 30 jours de corrections de bugs après mise en production, à coût zéro.
10. **Maintenance** : devis distinct pour un contrat de maintenance évolutive et corrective (à proposer en option).

---

## 12. Critères de recette

La recette sera prononcée par la cliente à l'issue d'une vérification sur les points suivants :

### 12.1 Recette fonctionnelle

- Toutes les pages décrites en section 5.1 sont accessibles et rendent sans erreur en FR et EN.
- Le tunnel de composition fonctionne pour les deux catégories, persiste l'état, génère un coffret sur mesure ajouté au panier.
- Le panier de demande accepte coffrets curatés + sur-mesure, permet d'ajuster les quantités, respecte les MOQ.
- Le formulaire de contact valide les champs, soumet la demande, persiste en BDD, déclenche l'email.
- L'admin permet de créer/modifier/supprimer toutes les entités du périmètre (produits, coffrets, catégories, occasions, ateliers, journal, facettes).
- L'admin est utilisable depuis un smartphone iPhone 13 / Pixel 7 (chrome + safari).

### 12.2 Recette technique

- `npm run build` exit 0
- `npm test` (Playwright) : 100% des tests passent
- Audit Lighthouse mobile : tous les scores ≥ seuils définis en 8.1
- Audit axe-core : aucune violation critique ou sérieuse
- Pas d'erreur dans la console navigateur sur les parcours critiques
- Le site répond correctement à un test de charge léger (50 requêtes simultanées)
- Pas de variable secrète exposée dans le bundle client

### 12.3 Recette éditoriale

- Tous les textes FR et EN ont été relus par la cliente et validés
- Aucune chaîne « lorem ipsum » ou TODO dans le contenu publié
- Toutes les images ont un alt-text en deux langues

---

## 13. Calendrier

Le calendrier est à proposer par le prestataire. Indicatif :

- **Phase 1 , Cadrage et design** : 2 semaines (audit existant, maquettes, validation client)
- **Phase 2 , Développement front public** : 4 semaines
- **Phase 3 , Développement tunnel de composition** : 2 semaines (sous-projet à part)
- **Phase 4 , Admin** : 3 semaines
- **Phase 5 , Intégration email + Turnstile + RGPD** : 1 semaine
- **Phase 6 , Recette, audit, formation** : 2 semaines

Total estimé : **~14 semaines** soit ~3,5 mois.

Une mise en production progressive (par phase) est possible et même souhaitée.

---

## 14. Demande de chiffrage

Le prestataire est invité à soumettre une proposition comprenant :

1. **Méthodologie** : approche, équipe, rituels (agile / cycle V / autre).
2. **Décomposition du chiffrage** : par lot (cadrage, design, dev front, dev tunnel, dev admin, intégrations, recette, formation, garantie, maintenance), en jours/homme et en montant HT.
3. **Profils mobilisés** : nombre, séniorité, TJM (Tarif Journalier Moyen).
4. **Calendrier détaillé** : Gantt ou équivalent, jalons et livrables.
5. **Conditions de paiement** : acompte, versements intermédiaires, solde à la recette.
6. **Modalités de maintenance évolutive** : forfait mensuel proposé, périmètre, SLA.
7. **Références** : 3 projets comparables (B2B, e-commerce/devis, multilingue, design éditorial).
8. **Garanties** : durée, exclusions, niveau de service post-livraison.
9. **Hypothèses et limites** : ce qui est inclus, ce qui ne l'est pas, ce qui dépend de la cliente.

---

## 15. Modalités de réponse

- **Format attendu** : PDF + fichier source modifiable (Word, Pages, Google Docs).
- **Délai de réponse** : 3 semaines à compter de la réception de ce document.
- **Contact** : Taha El Bouzidi, ta.elbouzidi@gmail.com
- **Confidentialité** : ce document et toute donnée associée (catalogue, code, accès) sont confidentiels. Une convention de confidentialité (NDA) peut être signée préalablement à la transmission de l'accès au dépôt et à la base de données.

---

## 16. Annexes (sur demande)

- Catalogue B2B PDF (36 produits cosmétiques, prix internes, MOQ, marchés cibles)
- Présentation de marque (PPTX)
- Accès lecture seule au dépôt GitHub et à la base Supabase
- Maquettes Figma de l'existant
- Brief créatif amazigh (références culturelles, glyphes Tifinagh, palette inspirée)

---

*Fin du cahier des charges. Toute clarification ou question peut être adressée directement à l'émetteur.*
