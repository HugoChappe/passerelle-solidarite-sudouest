# Passerelle Solidaire — Feux Sud-Ouest

Site statique une page, aucun build, aucune dépendance serveur. Ouvrir `index.html` suffit.

## Connecter le formulaire "Proposer une solution" à un Google Sheet

Le formulaire envoie ses données à un Google Form, qui les écrit automatiquement
dans le Google Sheet lié — pas de backend à héberger ni à maintenir.

1. Créer un Google Form avec exactement 5 questions, dans cet ordre : **Type**,
   **Titre**, **Lien**, **Description**, **Email** (toutes en réponse courte /
   paragraphe).
2. Dans l'onglet Réponses du Form, cliquer sur l'icône Sheets pour créer le
   Google Sheet lié.
3. Récupérer l'URL d'action et les identifiants de champs :
   - Menu ⋮ → « Obtenir un lien prérempli », remplir chaque champ avec un texte
     reconnaissable (ex. `TYPE_ICI`, `TITRE_ICI`...), copier le lien généré.
   - Dans ce lien, l'`actionUrl` = la partie entre `.../forms/d/e/` et
     `/viewform`, à réutiliser comme `https://docs.google.com/forms/d/e/FORM_ID/formResponse`.
   - Chaque `entry.XXXXXXXXX=` du lien correspond à une question (repérable
     grâce au texte saisi).
4. Dans [script.js](script.js), renseigner `GOOGLE_FORM_CONFIG` :
   - `actionUrl` → l'URL `.../formResponse` trouvée à l'étape 3.
   - `entries.type` / `titre` / `lien` / `description` / `email` → les 5
     `entry.XXXXXXXXX` correspondants.

Tant que `actionUrl` n'est pas renseignée, le formulaire affiche un message
d'erreur explicite au lieu d'échouer silencieusement. (`entries.type` a un
placeholder par défaut — tant qu'il n'est pas remplacé, la colonne "Type" du
Sheet reste vide mais le reste du formulaire fonctionne normalement.)

### Distinction Proposition / Signalement

Le champ **Type** (`proposition` ou `signalement`) est un champ caché du
formulaire, rempli automatiquement :
- Les boutons "Proposer une solution" (header + section "Autres initiatives")
  ouvrent la popin avec `type=proposition`.
- Le lien "Signaler un problème" affiché sous chaque ressource (généré
  automatiquement par [script.js](script.js) à partir de chaque `.card`) ouvre
  la même popin avec `type=signalement`, en pré-remplissant le nom et le lien
  de la ressource concernée.

Les deux arrivent dans le même Sheet ; la colonne "Type" permet de filtrer.

## Vérifier le site sur Google Search Console

`robots.txt` et `sitemap.xml` sont déjà en place à la racine (une seule URL,
le site étant une page unique avec ancres). Pour vérifier la propriété :

1. Aller sur [search.google.com/search-console](https://search.google.com/search-console),
   « Ajouter une propriété » → choisir **Préfixe d'URL** (pas "Domaine", qui
   demande un enregistrement DNS impossible à faire sur un sous-domaine
   `*.vercel.app`) → entrer `https://passerelle-solidarite-sudouest.vercel.app`.
2. Choisir la méthode **Balise HTML** (la plus simple ici) : Google donne une
   ligne du type `<meta name="google-site-verification" content="XXXXXXX" />`.
3. Envoie-moi cette ligne, je la colle dans [index.html](index.html) (un
   emplacement est déjà marqué juste après la meta description) et je déploie.
4. Une fois déployé, clique "Vérifier" dans Search Console.
5. Une fois vérifié : menu **Sitemaps** (barre latérale) → entrer `sitemap.xml`
   → Envoyer.

## Ajouter une initiative dans "Autres initiatives communautaires"

La section `#autres` dans [index.html](index.html) est volontairement vide.
Pour ajouter une carte, dupliquer la structure `<article class="card">...</article>`
utilisée dans les autres sections et l'insérer avant `<div class="empty-state">`.
