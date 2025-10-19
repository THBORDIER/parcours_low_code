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
 * Extrait les métadonnées d'un fichier HTML
 */
function extractMetadata(htmlContent, filePath) {
    // Extraire le titre (première balise <h1>)
    const titleMatch = htmlContent.match(/<h1[^>]*>(.*?)<\/h1>/i);
    const title = titleMatch ? titleMatch[1].trim() : 'Sans titre';

    // Extraire la catégorie
    const categoryMatch = htmlContent.match(/🏷️\s*<strong>Catégorie:<\/strong>\s*([^<]+)/i);
    const category = categoryMatch ? categoryMatch[1].trim() : '';

    // Extraire le niveau
    const levelMatch = htmlContent.match(/🎯\s*<strong>Niveau:<\/strong>\s*([^<]+)/i);
    const level = levelMatch ? levelMatch[1].trim() : '';

    // Extraire les mots-clés
    const keywordsMatch = htmlContent.match(/🔍\s*<strong>Mots-clés:<\/strong>\s*([^<]+)/i);
    const keywords = keywordsMatch ? keywordsMatch[1].trim().split(',').map(k => k.trim()) : [];

    // Déterminer le thème à partir du chemin
    const relativePath = path.relative(ARTICLES_DIR, filePath);
    const theme = relativePath.split(path.sep)[0];

    // Chemin relatif pour l'URL (avec slashes Unix)
    const urlPath = '../articles/' + relativePath.replace(/\\/g, '/');

    return {
        title,
        category,
        level,
        keywords,
        theme,
        path: urlPath
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
