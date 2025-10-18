# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static HTML/CSS knowledge base for a Low-Code Developer training course (OpenClassrooms), focused on WeWeb and Xano stacks. The site is designed to be minimalist, fast, and deployed automatically to Vercel via GitHub.

## Development Commands

### Local Development

Start a local HTTP server to preview the site:

**Using Python 3:**
```bash
python -m http.server 8000
# Open http://localhost:8000
```

**Using Node.js:**
```bash
npx http-server
# Open http://localhost:8080
```

**Using VS Code:**
Install the "Live Server" extension and click "Go Live"

### Deployment

Deployment is automatic via Vercel. Every push to `main` branch triggers deployment.

```bash
git add .
git commit -m "Description des modifications"
git push
```

## Architecture

### File Structure

```
/
├── index.html                  # Homepage with theme cards
├── vercel.json                 # Vercel configuration (required)
│
├── themes/                     # Theme pages with two-column layout
│   ├── weweb.html             # Left: article list, Right: article display
│   ├── xano.html
│   ├── api.html
│   ├── bonnes-pratiques.html
│   └── notes-diverses.html
│
├── articles/                   # Article HTML fragments (no DOCTYPE)
│   ├── weweb/
│   ├── xano/
│   ├── api/
│   ├── bonnes-pratiques/
│   └── notes-diverses/
│
└── public/
    ├── css/style.css          # Global styles with CSS variables
    └── images/                # Images organized by theme
```

### Key Architectural Patterns

**Two-Column Layout System:**
- Theme pages (e.g., `themes/weweb.html`) use a fixed two-column grid layout
- Left column: Article navigation menu with `data-article` attributes
- Right column: Dynamic article display area (`id="article-display"`)
- Articles are loaded via vanilla JavaScript `fetch()` without page reload

**Article Structure:**
- Articles are HTML fragments (not complete documents)
- No `<html>`, `<head>`, or `<body>` tags
- Start directly with content (e.g., `<h1>Title</h1>`)
- Loaded dynamically into the right column of theme pages

**Dynamic Article Loading:**
Each theme page includes a vanilla JavaScript script that:
1. Listens for clicks on article links
2. Fetches the article HTML via `fetch()`
3. Injects content into `#article-display`
4. Manages active state styling

**CSS Design System:**
- Uses CSS custom properties (variables) in `:root`
- OpenClassrooms-inspired color scheme (purple/blue gradient)
- Primary color: `#6C63FF`, Secondary: `#3A86FF`
- Poppins font family from Google Fonts
- Responsive design with mobile breakpoint at 768px

## Adding New Content

### Adding a New Article

1. Create HTML file in appropriate `articles/[theme]/` directory
2. Use article structure (no DOCTYPE, start with `<h1>`)
3. Add link to corresponding theme page:

```html
<!-- In themes/weweb.html -->
<li><a href="#" data-article="../articles/weweb/mon-article.html">Title</a></li>
```

4. Place images in `public/images/[theme]/`
5. Reference images with relative paths: `../../public/images/weweb/image.jpg`

### Article Content Structure

**IMPORTANT: Before publishing any article, Claude must ask for:**
- 📅 Date of publication/update (format: DD/MM/YYYY)
- ⏱️ Time spent on the article

Each article should follow this pedagogical structure:

#### 🏷️ 1. Article Header
- **Title**: `<h1>` — short, descriptive, actionable
  - Example: "Comprendre le fonctionnement des Collections dans Xano"
- **Subtitle**: Sentence describing the article's objective
  - Example: "Dans cet article, je vais expliquer simplement ce qu'est une collection dans Xano, à quoi ça sert, et comment l'utiliser concrètement dans un workflow WeWeb."

#### 🔑 2. Metadata Block
Visual block at the beginning with icons:
- 🏷️ Catégorie: WeWeb / Xano / API / Base de données / Bonnes pratiques / Notes diverses
- 🎯 Niveau: Débutant / Intermédiaire / Avancé
- 🔍 Mots-clés: Relevant keywords
- 📅 Mise à jour: Date (format: DD/MM/YYYY)
- ⏱️ Temps passé: Time spent on article
- ⚙️ Stack utilisée: WeWeb + Xano (or other)

#### 📘 3. Quick Summary (TL;DR)
Colored box in light purple (OpenClassrooms style):
```html
<div class="tldr">
✅ <strong>TL;DR :</strong>
Brief summary of the key concept or solution.
</div>
```

#### 🤔 4. Initial Problem
- 🛑 **Problème rencontré**: Simple, concrete description of the need or issue
- 💡 **Exemple utilisateur**: User scenario illustrating the problem

#### 🔍 5. Simplified Explanation
Pedagogical section with analogies and small diagrams:
- Use analogies to make concepts accessible
- Include:
  - ✅ Bullet lists
  - 📊 Simple ASCII diagrams if needed
  - 🧠 Pedagogical tips

#### 🧪 6. Solution / Procedure
Organized step-by-step:
- Étape 1️⃣: First step
- Étape 2️⃣: Second step
- Étape 3️⃣: Third step
- 🔧 Code or configuration examples
- 📷 Screenshots illustrating the interface

#### 🧰 7. Useful Callout Boxes

**Attention Box:**
```html
<div class="callout callout-warning">
⚠️ <strong>Attention</strong><br>
Important warning or reminder
</div>
```

**Tip Box:**
```html
<div class="callout callout-tip">
✨ <strong>Astuce</strong><br>
Helpful tip or best practice
</div>
```

**Advanced Concept Box:**
```html
<div class="callout callout-advanced">
🔬 <strong>Pour aller plus loin</strong><br>
Advanced concepts, pagination, dynamic filters, security
</div>
```

#### 🧭 8. Concrete Example
Mini use case with code/JSON examples showing real implementation

#### 📌 9. Final Summary
```html
<div class="summary">
📌 <strong>À retenir :</strong>
<ul>
  <li>Key point 1</li>
  <li>Key point 2</li>
  <li>Key point 3</li>
</ul>
</div>
```

#### 🎓 10. Quick Quiz (optional, gamification)
- 🧠 **Question**: Test question
- ✅ **Réponse attendue**: Expected answer

#### 🔗 11. Useful Links
- Official documentation links
- Related articles within the knowledge base
- External tutorials

### Article HTML Template (Basic Structure)

```html
<h1>Article Title</h1>

<!-- Metadata block -->
<div class="metadata">
    <p>🏷️ <strong>Catégorie:</strong> WeWeb</p>
    <p>🎯 <strong>Niveau:</strong> Débutant</p>
    <p>🔍 <strong>Mots-clés:</strong> Collections, Data, API</p>
    <p>📅 <strong>Mise à jour:</strong> 18/10/2025</p>
    <p>⏱️ <strong>Temps passé:</strong> 2h30</p>
    <p>⚙️ <strong>Stack:</strong> WeWeb + Xano</p>
</div>

<!-- TL;DR -->
<div class="tldr">
✅ <strong>TL;DR :</strong>
Brief summary here.
</div>

<h2>🤔 Problème rencontré</h2>
<p>Description...</p>

<h2>🔍 Explication</h2>
<p>Content...</p>

<ul>
    <li>Point 1</li>
    <li>Point 2</li>
</ul>

<!-- Callout box example -->
<div class="callout callout-tip">
✨ <strong>Astuce</strong><br>
Helpful tip here.
</div>

<!-- Image with caption -->
<div class="figure">
    <img src="../../public/images/weweb/example.jpg" alt="Description">
    <p class="figure-caption">Figure 1: Description</p>
</div>

<!-- Code block -->
<pre><code>
code here
</code></pre>

<!-- Final summary -->
<div class="summary">
📌 <strong>À retenir :</strong>
<ul>
  <li>Key point 1</li>
  <li>Key point 2</li>
</ul>
</div>
```

### Adding a New Theme

1. Create `themes/new-theme.html` (copy existing theme file structure)
2. Create directory `articles/new-theme/`
3. Create directory `public/images/new-theme/`
4. Add navigation link to all pages' navbar
5. Add theme card to `index.html`

## Technical Constraints

- Pure HTML + CSS (no build step)
- Vanilla JavaScript only (no frameworks)
- No database, no backend
- Static file hosting on Vercel
- `vercel.json` required for deployment configuration
- Clean URLs enabled, no trailing slashes

## Vercel Configuration

The `vercel.json` file configures:
- Static site deployment (no build command)
- Cache headers for `/public/*` assets (1 year)
- Security headers (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)
- Output directory: root (`.`)

## File Naming Conventions

- Use kebab-case for HTML files: `mon-article.html`
- Avoid spaces and special characters
- Be descriptive and concise
- Match article filename to content topic
