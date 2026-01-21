# Backlog - Améliorations du site

**Date de génération:** 21/01/2026
**Source:** Audit DOC-INIT-01

---

## 🚀 Quick Wins (Impact élevé, Effort faible)

### QW-01: Ajouter un favicon
**Priorité:** Haute
**Impact:** UX, SEO, Professionnalisme
**Effort:** 15 min
**Description:** Ajouter un favicon.ico à la racine et les déclarations dans les `<head>` des pages.

### QW-02: Créer robots.txt
**Priorité:** Haute
**Impact:** SEO
**Effort:** 10 min
**Description:** Créer un fichier robots.txt à la racine pour guider les crawlers.
```
User-agent: *
Allow: /
Sitemap: https://[domain]/sitemap.xml
```

### QW-03: Ajouter meta description sur toutes les pages
**Priorité:** Haute
**Impact:** SEO
**Effort:** 1h
**Description:** Ajouter des meta descriptions uniques et pertinentes sur index.html et toutes les pages themes/*.html

### QW-04: Ajouter Open Graph tags
**Priorité:** Moyenne
**Impact:** Partage social, SEO
**Effort:** 1h
**Description:** Ajouter meta OG (og:title, og:description, og:image, og:type, og:url) sur toutes les pages principales

### QW-05: Optimiser les images PNG
**Priorité:** Moyenne
**Impact:** Performance, Core Web Vitals
**Effort:** 30 min
**Description:** Convertir les 5 PNG en WebP/AVIF avec fallback, ou compresser avec TinyPNG. Cibles:
- `suivis deploy dashboard.png` (60KB)
- `panneaugauche.png` (40KB)
- `bouton deploy.png` (24KB)
- `bouton deploy clic.png` (20KB)

### QW-06: Ajouter width/height sur balises <img>
**Priorité:** Moyenne
**Impact:** Performance (CLS)
**Effort:** 30 min
**Description:** Ajouter width/height explicites sur toutes les images pour éviter le Cumulative Layout Shift.

### QW-07: Précharger la police Poppins
**Priorité:** Moyenne
**Impact:** Performance (LCP, FCP)
**Effort:** 15 min
**Description:** Ajouter `<link rel="preload">` pour Poppins dans le `<head>` des pages.

---

## 📊 SEO

### SEO-01: Créer un sitemap.xml
**Priorité:** Haute
**Impact:** SEO, Indexation
**Effort:** 1h
**Description:** Générer un sitemap.xml listant toutes les pages (index.html, themes/*.html). Peut être généré automatiquement via script Node.js.

### SEO-02: Ajouter structured data (JSON-LD)
**Priorité:** Moyenne
**Impact:** SEO, Rich snippets
**Effort:** 2h
**Description:** Ajouter du structured data sur les articles:
- Schema.org Article
- breadcrumbList
- WebSite avec searchAction

### SEO-03: Ajouter balises canonical
**Priorité:** Moyenne
**Impact:** SEO
**Effort:** 30 min
**Description:** Ajouter `<link rel="canonical">` sur toutes les pages pour éviter duplicate content.

### SEO-04: Optimiser les titres <title>
**Priorité:** Moyenne
**Impact:** SEO, CTR
**Effort:** 30 min
**Description:** Vérifier que tous les titles sont uniques, descriptifs, < 60 caractères, avec keywords.

### SEO-05: Ajouter Twitter Card tags
**Priorité:** Basse
**Impact:** Partage social
**Effort:** 30 min
**Description:** Ajouter meta Twitter Card (twitter:card, twitter:title, twitter:description, twitter:image)

---

## ⚡ Performance

### PERF-01: Implémenter lazy-loading pour les images
**Priorité:** Haute
**Impact:** Performance, LCP
**Effort:** 30 min
**Description:** Ajouter `loading="lazy"` sur toutes les images non critiques (below the fold).

### PERF-02: Minifier le CSS
**Priorité:** Moyenne
**Impact:** Performance
**Effort:** 30 min
**Description:** Créer une version minifiée de style.css et l'utiliser en production.

### PERF-03: Minifier le JavaScript
**Priorité:** Moyenne
**Impact:** Performance
**Effort:** 30 min
**Description:** Minifier search.js pour réduire la taille du fichier.

### PERF-04: Ajouter font-display: swap
**Priorité:** Moyenne
**Impact:** Performance (FCP)
**Effort:** 5 min
**Description:** Ajouter `&display=swap` à l'URL Google Fonts pour éviter FOIT (Flash of Invisible Text).

### PERF-05: Implémenter Service Worker (optionnel)
**Priorité:** Basse
**Impact:** Performance, Offline
**Effort:** 3h
**Description:** Créer un service worker pour cache des assets et support offline (headers déjà configurés dans vercel.json).

---

## ♿ Accessibilité

### A11Y-01: Ajouter skip-to-content link
**Priorité:** Haute
**Impact:** Accessibilité (navigation clavier)
**Effort:** 30 min
**Description:** Ajouter un lien "Aller au contenu" invisible mais accessible au clavier en début de navbar.

### A11Y-02: Vérifier les contrastes de couleurs
**Priorité:** Haute
**Impact:** Accessibilité (WCAG)
**Effort:** 1h
**Description:** Auditer tous les contrastes texte/background avec un outil (WebAIM, Lighthouse) et corriger si nécessaire.

### A11Y-03: Ajouter aria-current sur nav active
**Priorité:** Moyenne
**Impact:** Accessibilité
**Effort:** 30 min
**Description:** Ajouter `aria-current="page"` sur le lien de navigation de la page actuelle.

### A11Y-04: Tester la navigation complète au clavier
**Priorité:** Moyenne
**Impact:** Accessibilité
**Effort:** 1h
**Description:** S'assurer que tout le site est navigable uniquement au clavier (Tab, Enter, Esc). Vérifier focus visible.

### A11Y-05: Ajouter focus-visible sur éléments interactifs
**Priorité:** Moyenne
**Impact:** Accessibilité, UX
**Effort:** 30 min
**Description:** Améliorer les styles de focus avec `:focus-visible` pour meilleure visibilité.

### A11Y-06: Ajouter aria-live pour résultats de recherche
**Priorité:** Basse
**Impact:** Accessibilité (screen readers)
**Effort:** 30 min
**Description:** Ajouter `aria-live="polite"` sur la zone de résultats de recherche.

---

## 🛡️ Sécurité

### SEC-01: Ajouter Content-Security-Policy
**Priorité:** Haute
**Impact:** Sécurité (XSS)
**Effort:** 1h
**Description:** Ajouter CSP header dans vercel.json pour limiter les sources de scripts/styles autorisées.

### SEC-02: Ajouter Subresource Integrity (SRI)
**Priorité:** Moyenne
**Impact:** Sécurité
**Effort:** 30 min
**Description:** Ajouter des hash SRI sur Google Fonts et autres CDN externes.

### SEC-03: Ajouter Referrer-Policy
**Priorité:** Basse
**Impact:** Sécurité, Confidentialité
**Effort:** 5 min
**Description:** Ajouter header `Referrer-Policy: strict-origin-when-cross-origin` dans vercel.json.

### SEC-04: Vérifier HTTPS strict
**Priorité:** Basse
**Impact:** Sécurité
**Effort:** 5 min
**Description:** S'assurer que le site force HTTPS (normalement géré par Vercel).

---

## 🧹 Qualité du code

### CODE-01: Créer un fichier de configuration EditorConfig
**Priorité:** Basse
**Impact:** Qualité, Cohérence
**Effort:** 15 min
**Description:** Ajouter .editorconfig pour normaliser indentation/encoding entre éditeurs.

### CODE-02: Ajouter un linter HTML (htmlhint/linthtml)
**Priorité:** Basse
**Impact:** Qualité
**Effort:** 1h
**Description:** Configurer un linter HTML pour détecter erreurs/mauvaises pratiques.

### CODE-03: Ajouter Prettier pour formatage
**Priorité:** Basse
**Impact:** Qualité, Cohérence
**Effort:** 30 min
**Description:** Configurer Prettier pour formatter automatiquement HTML/CSS/JS.

### CODE-04: Documenter les conventions de code
**Priorité:** Basse
**Impact:** Maintenabilité
**Effort:** 1h
**Description:** Créer un guide de style (CONTRIBUTING.md) pour les nouvelles contributions.

---

## 📝 Contenu

### CONTENT-01: Vérifier articles sans métadonnées
**Priorité:** Moyenne
**Impact:** Recherche, UX
**Effort:** 2h
**Description:** S'assurer que tous les 55 articles ont bien le bloc métadonnées complet (catégorie, niveau, mots-clés, date, temps).

### CONTENT-02: Ajouter images manquantes
**Priorité:** Basse
**Impact:** UX, Pédagogie
**Effort:** Variable
**Description:** Certains articles mentionnent des images à ajouter (ex: introduction-weweb.html mentionne "image à ajouter").

### CONTENT-03: Créer page 404 personnalisée
**Priorité:** Moyenne
**Impact:** UX
**Effort:** 1h
**Description:** Créer 404.html avec design cohérent et liens de navigation.

---

## 🔧 Outillage

### TOOL-01: Créer script de build
**Priorité:** Moyenne
**Impact:** DX, Automatisation
**Effort:** 2h
**Description:** Créer un script build qui:
- Génère l'index de recherche
- Minifie CSS/JS
- Optimise images
- Génère sitemap

### TOOL-02: Ajouter CI/CD checks
**Priorité:** Basse
**Impact:** Qualité
**Effort:** 2h
**Description:** Configurer GitHub Actions pour:
- Linter HTML
- Vérifier index de recherche à jour
- Tests de base (liens cassés)

### TOOL-03: Ajouter analytics (optionnel)
**Priorité:** Basse
**Impact:** Mesure
**Effort:** 1h
**Description:** Intégrer Plausible/Simple Analytics (respectueux vie privée) pour suivre usage.

---

## 📊 Résumé par priorité

**Haute priorité (7 items):**
- QW-01, QW-02, QW-03
- SEO-01
- PERF-01
- A11Y-01, A11Y-02
- SEC-01

**Moyenne priorité (17 items):**
- QW-04, QW-05, QW-06, QW-07
- SEO-02, SEO-03, SEO-04
- PERF-02, PERF-03, PERF-04
- A11Y-03, A11Y-04, A11Y-05
- SEC-02
- CONTENT-01, CONTENT-03
- TOOL-01

**Basse priorité (11 items):**
- SEO-05
- PERF-05
- A11Y-06
- SEC-03, SEC-04
- CODE-01, CODE-02, CODE-03, CODE-04
- CONTENT-02
- TOOL-02, TOOL-03

**Total:** 35 items
