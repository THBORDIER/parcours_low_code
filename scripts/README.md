# Scripts

## generate-index.js

Génère l'index de recherche pour les articles.

**Usage:**
```bash
node scripts/generate-index.js
```

**Sortie:** `public/data/articles-index.json`

---

## lighthouse.mjs

Exécute des audits Lighthouse sur les pages principales du site.

**Prérequis:**
```bash
npm install
```

**Usage:**

1. Démarrer un serveur local en arrière-plan:
```bash
python -m http.server 8000 &
```

2. Exécuter le benchmark:
```bash
npm run lighthouse
```

**Sortie:**
- `reports/lighthouse/*.html` - Rapports HTML détaillés
- `reports/lighthouse/*.json` - Données JSON brutes
- `reports/lighthouse/summary-YYYY-MM-DD.md` - Résumé des scores

**Pages auditées:**
- Homepage (`/`)
- WeWeb Theme (`/themes/weweb.html`)
- Xano Theme (`/themes/xano.html`)

**Catégories auditées:**
- Performance
- Accessibility
- Best Practices
- SEO

**Note:** Les rapports sont exclus du versioning Git (voir `.gitignore`).
