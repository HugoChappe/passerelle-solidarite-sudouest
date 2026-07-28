# Passerelle Solidaire — Feux Sud-Ouest

Site statique une page, aucun build, aucune dépendance serveur. Ouvrir `index.html` suffit.

## Connecter le formulaire "Proposer une solution" à un Google Sheet

Le formulaire envoie ses données à un Google Form, qui les écrit automatiquement
dans le Google Sheet lié — pas de backend à héberger ni à maintenir.

1. Créer un Google Form avec exactement 4 questions, dans cet ordre : **Titre**,
   **Lien**, **Description**, **Email** (toutes en réponse courte / paragraphe).
2. Dans l'onglet Réponses du Form, cliquer sur l'icône Sheets pour créer le
   Google Sheet lié.
3. Récupérer l'URL d'action et les identifiants de champs :
   - Ouvrir le Form en mode aperçu, clic droit → « Afficher le code source »,
     chercher `action="https://docs.google.com/forms/d/e/.../formResponse"`.
   - Chercher les `entry.XXXXXXXXX` associés à chaque question (un par `name=`
     d'input dans le HTML du Form).
4. Dans [script.js](script.js), remplacer les valeurs de `GOOGLE_FORM_CONFIG` :
   - `actionUrl` → l'URL `.../formResponse` trouvée à l'étape 3.
   - `entries.titre` / `lien` / `description` / `email` → les 4 `entry.XXXXXXXXX`
     correspondants, dans le même ordre que les questions du Form.

Tant que ces valeurs ne sont pas renseignées, le formulaire affiche un message
d'erreur explicite au lieu d'échouer silencieusement.

## Ajouter une initiative dans "Autres initiatives communautaires"

La section `#autres` dans [index.html](index.html) est volontairement vide.
Pour ajouter une carte, dupliquer la structure `<article class="card">...</article>`
utilisée dans les autres sections et l'insérer avant `<div class="empty-state">`.
