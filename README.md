# Base de connaissance - Formation Développeur Low-Code (OpenClassrooms)

Site statique de base de connaissances pour le parcours Développeur Low-Code, avec un focus sur les stacks **WeWeb** et **Xano**.

## Description

Ce site regroupe mes notes personnelles, mon expérience, et des explications issues des tutoriels officiels WeWeb et Xano. L'objectif est de structurer mon apprentissage sous forme de tutoriels et d'articles organisés par thème.

## Technologies utilisées

- **HTML5** - Structure des pages
- **CSS3** - Styles et design
- **JavaScript vanilla** - Navigation dynamique des articles
- **Vercel** - Hébergement et déploiement continu

## Structure du projet

```
/
├── index.html                  # Page d'accueil
├── vercel.json                 # Configuration Vercel
├── README.md                   # Ce fichier
│
├── themes/                     # Pages thématiques
│   ├── weweb.html
│   ├── xano.html
│   ├── api.html
│   ├── bonnes-pratiques.html
│   └── notes-diverses.html
│
├── articles/                   # Articles organisés par thème
│   ├── weweb/
│   │   ├── introduction-weweb.html
│   │   ├── composants-weweb.html
│   │   └── variables-workflow.html
│   ├── xano/
│   │   ├── introduction-xano.html
│   │   ├── base-de-donnees.html
│   │   └── api-endpoints.html
│   ├── api/
│   │   ├── rest-api.html
│   │   ├── authentification.html
│   │   └── integration-weweb-xano.html
│   ├── bonnes-pratiques/
│   │   ├── organisation-projet.html
│   │   ├── conventions-nommage.html
│   │   └── optimisation-performance.html
│   └── notes-diverses/
│       ├── ressources-utiles.html
│       ├── astuces-productivite.html
│       └── outils-complementaires.html
│
└── public/                     # Assets statiques
    ├── css/
    │   └── style.css           # Styles globaux
    └── images/                 # Images organisées par thème
        ├── weweb/
        ├── xano/
        ├── api/
        ├── bonnes-pratiques/
        └── notes-diverses/
```

## Déploiement sur Vercel

### Prérequis

- Un compte GitHub
- Un compte Vercel (gratuit)
- Git installé sur votre machine

### Étapes de déploiement

#### 1. Créer un repository GitHub

```bash
# Dans le répertoire du projet
git init
git add .
git commit -m "Initial commit - Base de connaissance Low-Code"
```

Créez un nouveau repository sur GitHub, puis :

```bash
git remote add origin https://github.com/VOTRE-USERNAME/VOTRE-REPO.git
git branch -M main
git push -u origin main
```

#### 2. Connecter à Vercel

1. Allez sur [vercel.com](https://vercel.com)
2. Cliquez sur **"Add New Project"**
3. Importez votre repository GitHub
4. Vercel détectera automatiquement la configuration via `vercel.json`
5. Cliquez sur **"Deploy"**

#### 3. Déploiement automatique

Chaque fois que vous poussez du code sur la branche `main`, Vercel déploiera automatiquement les changements.

```bash
# Après avoir modifié des fichiers
git add .
git commit -m "Description des modifications"
git push
```

Le site sera accessible à l'URL : `https://votre-projet.vercel.app`

### Configuration du domaine personnalisé (optionnel)

Dans le dashboard Vercel :
1. Allez dans **Settings** > **Domains**
2. Ajoutez votre nom de domaine
3. Suivez les instructions pour configurer les DNS

## Ajouter un nouvel article

### 1. Créer le fichier HTML de l'article

Créez un nouveau fichier dans le dossier approprié :

```bash
# Exemple pour un article WeWeb
articles/weweb/mon-nouvel-article.html
```

### 2. Structure de l'article

Utilisez cette structure HTML :

```html
<h1>Titre de l'article</h1>

<h2>Section principale</h2>

<p>
    Votre contenu ici...
</p>

<h3>Sous-section</h3>

<ul>
    <li>Point 1</li>
    <li>Point 2</li>
</ul>

<h2>Autre section</h2>

<p>
    Plus de contenu...
</p>

<!-- Pour ajouter une image -->
<div class="figure">
    <img src="../public/images/weweb/nom-image.jpg" alt="Description">
    <p class="figure-caption">Figure 1 : Description de l'image</p>
</div>

<!-- Pour du code -->
<pre><code>
Votre code ici
</code></pre>
```

### 3. Ajouter l'article au menu

Ouvrez le fichier de thème correspondant (ex: `themes/weweb.html`) et ajoutez un lien dans la liste :

```html
<ul id="articles-menu">
    <li><a href="#" data-article="../articles/weweb/introduction-weweb.html">Introduction à WeWeb</a></li>
    <!-- Ajoutez votre nouvel article ici -->
    <li><a href="#" data-article="../articles/weweb/mon-nouvel-article.html">Mon nouvel article</a></li>
</ul>
```

### 4. Ajouter des images (optionnel)

1. Placez vos images dans le dossier approprié :
   ```
   public/images/weweb/mon-image.jpg
   ```

2. Référencez-les dans votre article :
   ```html
   <img src="../../public/images/weweb/mon-image.jpg" alt="Description">
   ```

### 5. Committer et pousser

```bash
git add .
git commit -m "Ajout article : Mon nouvel article"
git push
```

Le site sera automatiquement mis à jour sur Vercel en quelques secondes.

## Personnalisation

### Modifier les couleurs

Éditez les variables CSS dans `public/css/style.css` :

```css
:root {
    --primary-blue: #2c5aa0;      /* Bleu principal */
    --secondary-blue: #4a7cc7;    /* Bleu secondaire */
    --light-blue: #e8f0f9;        /* Bleu clair */
    --dark-gray: #2d3748;         /* Gris foncé */
    /* ... */
}
```

### Ajouter un nouveau thème

1. Créez une nouvelle page dans `themes/nouveau-theme.html` (copiez un fichier existant)
2. Créez le dossier `articles/nouveau-theme/`
3. Créez le dossier `public/images/nouveau-theme/`
4. Ajoutez le lien dans la navbar de toutes les pages :
   ```html
   <li><a href="themes/nouveau-theme.html">Nouveau thème</a></li>
   ```

## Développement local

Pour tester le site en local, vous pouvez utiliser un serveur HTTP simple :

### Avec Python 3

```bash
python -m http.server 8000
```

Puis ouvrez `http://localhost:8000` dans votre navigateur.

### Avec Node.js (http-server)

```bash
npx http-server
```

Puis ouvrez `http://localhost:8080` dans votre navigateur.

### Avec VS Code

Installez l'extension **Live Server** et cliquez sur "Go Live" en bas à droite.

## Fonctionnalités

- Navigation fluide entre les articles
- Design responsive (mobile, tablette, desktop)
- Chargement dynamique des articles sans rechargement de page
- Mise en cache des assets pour performance optimale
- Structure extensible et facile à maintenir

## Bonnes pratiques

### Nommage des fichiers

- Utilisez des noms descriptifs en kebab-case : `mon-article.html`
- Évitez les espaces et caractères spéciaux
- Utilisez des noms en anglais pour les fichiers techniques

### Organisation du contenu

- Un article = un fichier HTML
- Pas de duplication de contenu
- Utilisez des titres hiérarchiques (h1, h2, h3)
- Ajoutez des exemples de code quand pertinent

### Images

- Compressez vos images avant de les ajouter (TinyPNG, Squoosh)
- Utilisez des formats modernes (WebP) quand possible
- Ajoutez toujours un attribut `alt` descriptif
- Dimensions recommandées : max 1200px de largeur

## Support et contribution

Ce projet est personnel mais vous pouvez :
- Forker le repository pour créer votre propre base de connaissances
- Proposer des améliorations via Pull Request
- Signaler des bugs via Issues

## Licence

Ce projet est sous licence MIT - vous êtes libre de l'utiliser et le modifier.

## Auteur

Élève du parcours Développeur Low-Code chez OpenClassrooms

---

**Note :** Ce site est conçu pour être minimaliste, rapide et facile à maintenir. Il n'utilise aucun framework JavaScript complexe, aucune base de données, et ne nécessite aucune optimisation SEO particulière.
