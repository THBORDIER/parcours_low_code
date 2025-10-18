🎯 Cahier des charges – Site Web de base de connaissances Low-Code (WeWeb \& Xano)

1\. Objectif du site



Créer un site statique simple (HTML + CSS) hébergé automatiquement sur Vercel, déployé en continu via un repository GitHub (fichier vercel.json obligatoire).

Ce site représente ma base de connaissances personnelle dans le cadre de ma formation Développeur Low-Code OpenClassrooms, en utilisant les stacks WeWeb et Xano.



Le site doit être minimaliste, rapide à générer, lisible, sans SEO, sans optimisation particulière.



2\. Structure générale

🔷 Page d’accueil (index.html)



Titre principal :

"Base de connaissance – Formation Développeur Low-Code (OpenClassrooms)"



Texte de présentation :



Je suis élève OpenClassrooms sur le parcours Développeur Low-Code.



Ce site regroupe mes notes personnelles, mon expérience, et des explications issues des tutoriels officiels WeWeb et Xano.



Objectif : structurer mon apprentissage sous forme de tutoriels et d’articles organisés par thème.



🔷 Navigation (Navbar)



Apparente sur toutes les pages



Position fixe, en haut



Liste de thèmes (exemple) :



WeWeb



Xano



API \& Backend



Bonnes pratiques



Notes diverses



Chaque thème renvoie vers une page listant les articles associés.



🔷 Pages de thème



Layout en deux colonnes :



Colonne gauche : liste des articles sous forme de liens.



Colonne droite : article affiché au clic.



Un fichier HTML par article.



Les articles sont rédigés simplement en HTML (possibilité d’y insérer des images placées dans des dossiers nommés par thème).



🔷 Gestion des images



Arborescence :



/public/images/weweb/

/public/images/xano/

/public/images/api/





Chaque image doit pouvoir être appelée dans les articles via un chemin statique.



3\. Contraintes techniques

✅ Stack



Pur HTML + CSS



Aucune base de données



Aucun framework JS requis (sauf petit script natif si nécessaire pour navigation ou affichage dynamique basique)



✅ Déploiement continu



Création d’un fichier vercel.json pour définir le build et le routing.



Tout commit sur la branche main de GitHub déclenche le déploiement automatique sur Vercel.



✅ Arborescence attendue

/ (racine)

&nbsp; index.html

&nbsp; /themes/

&nbsp;   weweb.html

&nbsp;   xano.html

&nbsp;   api.html

&nbsp; /articles/

&nbsp;   weweb/

&nbsp;     article1.html

&nbsp;     article2.html

&nbsp;   xano/

&nbsp;     article1.html

&nbsp; /public/

&nbsp;   /css/style.css

&nbsp;   /images/

&nbsp;     /weweb/

&nbsp;     /xano/

vercel.json

README.md



4\. Style visuel



Design épuré et lisible.



Typographie simple (Arial, Roboto ou équivalent standard)



Couleurs sobres (ton bleu/gris)



Aucune animation complexe.



5\. Fonctionnalités souhaitées



Navigation fluide entre les articles.



Possibilité d’ajouter facilement de nouveaux fichiers HTML d’article.



Page article doit pouvoir inclure :



Titres (h1, h2…)



Paragraphes



Images avec numéros + titres



Liens internes



6\. Livrables attendus



Code source complet du site.



Fichier vercel.json prêt à l’emploi.



Instructions automatiques :



Créer le repo GitHub.



Pousser le code.



Connecter à Vercel.



Déployer automatiquement.



README.md contenant les instructions pour ajouter un article manuellement.



7\. Exemple de texte d’accueil



Bienvenue sur ma base de connaissance du parcours Développeur Low-Code chez OpenClassrooms.

Ce site regroupe mes notes personnelles issues de ma pratique et des tutoriels officiels WeWeb et Xano.

Objectif : structurer mon apprentissage en partageant chaque concept sous forme d’article clair et illustré.



✅ Ta mission pour l'IA (Claude) :



Générer ce site complet + configuration Vercel + pipeline GitHub + structure fichiers.

