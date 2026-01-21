# 📚 Documentation - Index

**Projet:** Base de Connaissance Low-Code (OpenClassrooms)
**Dernière mise à jour:** 21/01/2026

---

## 🗂️ Navigation

### 📊 Documents principaux
- **[DASHBOARD.md](DASHBOARD.md)** - État du projet, métriques, stack, audit
- **[Backlog/TODO.md](Backlog/TODO.md)** - Liste des améliorations à faire

### 🏗️ Domaines de travail

#### Bootstrap (Initialisation)
- **[Bootstrap/CURRENT.md](Domaines/Bootstrap/CURRENT.md)** - Travail en cours
- **[Bootstrap/DONE.md](Domaines/Bootstrap/DONE.md)** - Travail terminé

---

## 📖 Autres documentations du projet

### Documentation utilisateur
- **[README.md](../README.md)** - Documentation principale du projet
- **[CLAUDE.md](../CLAUDE.md)** - Instructions pour Claude Code
- **[cahier_des_charges.md](../cahier_des_charges.md)** - Cahier des charges

### Configuration
- **[vercel.json](../vercel.json)** - Configuration déploiement Vercel
- **[.gitignore](../.gitignore)** - Fichiers ignorés par Git

---

## 🎯 Quick Links

### Développement
- **Articles:** `articles/` (55 fichiers HTML)
- **Thèmes:** `themes/` (6 pages thématiques)
- **Styles:** `public/css/style.css`
- **Scripts:** `public/js/search.js`
- **Indexation:** `scripts/generate-index.js`

### Résultats d'audit
- **Quick Wins:** Voir [Backlog/TODO.md](Backlog/TODO.md#-quick-wins-impact-élevé-effort-faible)
- **SEO:** 7 améliorations identifiées
- **Performance:** 5 améliorations identifiées
- **Accessibilité:** 4 améliorations identifiées
- **Sécurité:** 2 améliorations identifiées
- **Total:** 35 items dans le backlog

---

## 📊 Statistiques du projet

- **Pages:** 7 (1 index + 6 thèmes)
- **Articles:** 55
- **Images:** 5 (156KB)
- **Lignes de code:** ~3000
- **Stack:** HTML5 + CSS3 + JavaScript (Vanilla)
- **Node.js:** v24.12.0 (pour scripts)

---

## 🔄 Workflow

### Initialisation (Bootstrap)
1. ✅ Création structure Docs/
2. ✅ Audit complet du repository
3. ✅ Génération du backlog
4. ✅ Documentation DASHBOARD
5. 🔄 Vous êtes ici!

### Prochaines phases
1. **SEO de base** - Quick wins SEO (favicon, robots.txt, meta, sitemap)
2. **Performance** - Optimisation images, lazy-loading, minification
3. **Accessibilité** - Skip link, contrastes, navigation clavier
4. **Sécurité** - CSP, SRI, headers additionnels
5. **Outillage** - Build script, linting, CI/CD

---

## 📝 Conventions

### Nommage des fichiers
- `CURRENT.md` - Travail en cours dans un domaine
- `DONE.md` - Travail terminé dans un domaine
- `TODO.md` - Backlog d'améliorations

### Structure des domaines
```
Domaines/
└── [NomDomaine]/
    ├── CURRENT.md    # Tâches en cours
    └── DONE.md       # Historique des tâches terminées
```

### Préfixes de logs
- `[BOOTSTRAP]` - Logs d'initialisation
- `[SEO]` - Logs d'optimisation SEO
- `[PERF]` - Logs d'optimisation performance
- `[A11Y]` - Logs d'accessibilité
- `[SEC]` - Logs de sécurité

---

## 🚀 Commandes rapides

```bash
# Lire le dashboard
cat Docs/DASHBOARD.md

# Voir le backlog
cat Docs/Backlog/TODO.md

# Voir travail en cours
cat Docs/Domaines/Bootstrap/CURRENT.md

# Générer index de recherche
node scripts/generate-index.js

# Démarrer serveur local
python -m http.server 8000
```

---

## 🆘 Aide

### Questions fréquentes

**Q: Où trouver l'état actuel du projet?**
R: Voir [DASHBOARD.md](DASHBOARD.md)

**Q: Quelles sont les prochaines tâches prioritaires?**
R: Voir [Backlog/TODO.md](Backlog/TODO.md#-quick-wins-impact-élevé-effort-faible)

**Q: Comment ajouter un nouvel article?**
R: Voir [CLAUDE.md](../CLAUDE.md#adding-a-new-article)

**Q: Comment déployer le site?**
R: `git push origin master` - Vercel déploie automatiquement

**Q: Comment tester en local?**
R: `python -m http.server 8000` ou `npx http-server`

---

_Index généré par Ralph Loop - DOC-INIT-01_
