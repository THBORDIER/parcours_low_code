#!/usr/bin/env node

/**
 * Script de génération d'index pour la recherche d'articles
 *
 * Ce script scanne tous les fichiers HTML dans articles/ et extrait :
 * - Le titre
 * - Les métadonnées (catégorie, niveau, mots-clés)
 * - Le chemin du fichier
 *
 * Génère public/data/articles-index.json
 */

const fs = require('fs');
const path = require('path');

// Configuration
const ARTICLES_DIR = path.join(__dirname, '..', 'articles');
const OUTPUT_FILE = path.join(__dirname, '..', 'public', 'data', 'articles-index.json');

/**
 * Récupère tous les fichiers HTML récursivement
 */
function getAllHtmlFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            getAllHtmlFiles(filePath, fileList);
        } else if (file.endsWith('.html')) {
            fileList.push(filePath);
        }
    });

    return fileList;
}

/**
 * Nettoie le HTML pour extraire le texte brut
 */
function stripHtml(html) {
    return html
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Extrait les tags depuis le contenu HTML
 */
function extractTags(htmlContent, theme, keywords, category) {
    const tags = new Set();

    // 1. Ajouter le thème comme tag
    tags.add(theme);

    // 2. Chercher des tags explicites dans un commentaire HTML
    // Format: <!-- tags: xano, auth, api -->
    const tagsCommentMatch = htmlContent.match(/<!--\s*tags:\s*([^>]+)\s*-->/i);
    if (tagsCommentMatch) {
        const explicitTags = tagsCommentMatch[1].split(',').map(t => t.trim().toLowerCase());
        explicitTags.forEach(tag => {
            if (tag) tags.add(tag);
        });
    }

    // 3. Ajouter les keywords comme tags (limitées aux 3 premières)
    if (keywords && keywords.length > 0) {
        keywords.slice(0, 3).forEach(kw => {
            const normalized = kw.toLowerCase().trim();
            if (normalized.length > 2) {
                tags.add(normalized);
            }
        });
    }

    // 4. Ajouter la catégorie comme tag si présente
    if (category && category.trim()) {
        tags.add(category.toLowerCase());
    }

    // 5. Détecter des tags techniques communs dans le contenu
    const technicalTerms = [
        'api', 'rest', 'jwt', 'auth', 'authentication', 'database', 'sql',
        'weweb', 'xano', 'stripe', 'brevo', 'webhook', 'frontend', 'backend',
        'debug', 'error', 'bug', 'fix', 'workflow', 'query', 'filter',
        'component', 'variable', 'collection', 'endpoint', 'middleware'
    ];

    const contentLower = htmlContent.toLowerCase();
    technicalTerms.forEach(term => {
        // Compter les occurrences (minimum 3 pour être considéré comme tag)
        const regex = new RegExp(`\\b${term}\\b`, 'gi');
        const matches = contentLower.match(regex);
        if (matches && matches.length >= 3) {
            tags.add(term);
        }
    });

    // Convertir en array et limiter à 8 tags max
    return Array.from(tags).slice(0, 8);
}

/**
 * Extrait les métadonnées d'un fichier HTML
 */
function extractMetadata(htmlContent, filePath) {
    // Extraire le titre (première balise <h1>)
    const titleMatch = htmlContent.match(/<h1[^>]*>(.*?)<\/h1>/i);
    const title = titleMatch ? stripHtml(titleMatch[1]) : 'Sans titre';

    // Extraire la catégorie
    const categoryMatch = htmlContent.match(/🏷️\s*<strong>Catégorie:<\/strong>\s*([^<]+)/i);
    const category = categoryMatch ? categoryMatch[1].trim() : '';

    // Extraire le niveau
    const levelMatch = htmlContent.match(/🎯\s*<strong>Niveau:<\/strong>\s*([^<]+)/i);
    const level = levelMatch ? levelMatch[1].trim() : '';

    // Extraire les mots-clés
    const keywordsMatch = htmlContent.match(/🔍\s*<strong>Mots-clés:<\/strong>\s*([^<]+)/i);
    const keywords = keywordsMatch ? keywordsMatch[1].trim().split(',').map(k => k.trim()) : [];

    // Extraire la date de mise à jour
    const dateMatch = htmlContent.match(/📅\s*<strong>Mise à jour:<\/strong>\s*([^<]+)/i);
    const date = dateMatch ? dateMatch[1].trim() : '';

    // Extraire le temps passé
    const timeMatch = htmlContent.match(/⏱️\s*<strong>Temps passé:<\/strong>\s*([^<]+)/i);
    const timeSpent = timeMatch ? timeMatch[1].trim() : '';

    // Extraire le TL;DR comme extrait/description (limité à 180 caractères)
    const tldrMatch = htmlContent.match(/<div class="tldr"[^>]*>(.*?)<\/div>/is);
    let excerpt = '';
    if (tldrMatch) {
        excerpt = stripHtml(tldrMatch[1])
            .replace(/^✅\s*TL;DR\s*:\s*/i, '')
            .substring(0, 180);
        if (excerpt.length === 180) excerpt += '...';
    } else {
        // Si pas de TL;DR, extraire le premier paragraphe
        const firstPMatch = htmlContent.match(/<p[^>]*>(.*?)<\/p>/i);
        if (firstPMatch) {
            excerpt = stripHtml(firstPMatch[1]).substring(0, 180);
            if (excerpt.length === 180) excerpt += '...';
        }
    }

    // Déterminer le thème à partir du chemin
    const relativePath = path.relative(ARTICLES_DIR, filePath);
    const theme = relativePath.split(path.sep)[0];

    // Chemin relatif pour l'URL (avec slashes Unix)
    const urlPath = '../articles/' + relativePath.replace(/\\/g, '/');

    // Extraire les tags
    const tags = extractTags(htmlContent, theme, keywords, category);

    return {
        title,
        category,
        level,
        keywords,
        theme,
        path: urlPath,
        date,
        timeSpent,
        excerpt,
        tags
    };
}

/**
 * Génère l'index de tous les articles
 */
function generateIndex() {
    console.log('🔍 Scan des articles...');

    const htmlFiles = getAllHtmlFiles(ARTICLES_DIR);
    console.log(`📄 ${htmlFiles.length} fichiers HTML trouvés`);

    const articles = [];

    htmlFiles.forEach(filePath => {
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const metadata = extractMetadata(content, filePath);
            articles.push(metadata);
            console.log(`✅ ${metadata.title} (${metadata.theme})`);
        } catch (error) {
            console.error(`❌ Erreur lors du traitement de ${filePath}:`, error.message);
        }
    });

    // Créer le répertoire de sortie si nécessaire
    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
        console.log(`📁 Création du répertoire ${outputDir}`);
    }

    // Écrire le fichier JSON
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(articles, null, 2), 'utf-8');
    console.log(`\n✨ Index généré avec succès : ${OUTPUT_FILE}`);
    console.log(`📊 Total : ${articles.length} articles indexés\n`);

    // Afficher un résumé par thème
    const byTheme = articles.reduce((acc, article) => {
        acc[article.theme] = (acc[article.theme] || 0) + 1;
        return acc;
    }, {});

    console.log('📈 Résumé par thème :');
    Object.entries(byTheme).forEach(([theme, count]) => {
        console.log(`   - ${theme}: ${count} article(s)`);
    });
}

// Exécution
try {
    generateIndex();
} catch (error) {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
}
