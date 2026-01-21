/**
 * Script d'optimisation d'images
 * Convertit les PNG en WebP et génère les dimensions
 *
 * Usage: node scripts/optimize-images.mjs
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

// Configuration
const IMAGE_DIRS = ['public/images'];
const WEBP_QUALITY = 85; // Qualité WebP (0-100)
const PNG_EXTENSIONS = ['.png', '.jpg', '.jpeg'];

/**
 * Trouve tous les fichiers images
 */
function findImages(dir) {
    const images = [];
    const fullPath = path.join(ROOT_DIR, dir);

    function scanDir(currentPath) {
        const entries = fs.readdirSync(currentPath, { withFileTypes: true });

        for (const entry of entries) {
            const entryPath = path.join(currentPath, entry.name);

            if (entry.isDirectory()) {
                scanDir(entryPath);
            } else if (entry.isFile()) {
                const ext = path.extname(entry.name).toLowerCase();
                if (PNG_EXTENSIONS.includes(ext) && !entry.name.endsWith('.webp')) {
                    images.push(entryPath);
                }
            }
        }
    }

    if (fs.existsSync(fullPath)) {
        scanDir(fullPath);
    }

    return images;
}

/**
 * Convertit une image en WebP
 */
async function convertToWebP(imagePath) {
    try {
        const ext = path.extname(imagePath);
        const webpPath = imagePath.replace(ext, '.webp');

        // Si le fichier WebP existe déjà, on skip
        if (fs.existsSync(webpPath)) {
            console.log(`⏭️  Skip (exists): ${path.relative(ROOT_DIR, webpPath)}`);
            return { skipped: true, path: webpPath };
        }

        // Charger l'image et obtenir les métadonnées
        const image = sharp(imagePath);
        const metadata = await image.metadata();

        // Convertir en WebP
        await image
            .webp({ quality: WEBP_QUALITY })
            .toFile(webpPath);

        // Obtenir les tailles
        const originalSize = fs.statSync(imagePath).size;
        const webpSize = fs.statSync(webpPath).size;
        const savings = ((originalSize - webpSize) / originalSize * 100).toFixed(1);

        console.log(`✅ Converted: ${path.relative(ROOT_DIR, imagePath)}`);
        console.log(`   → ${path.relative(ROOT_DIR, webpPath)}`);
        console.log(`   ${metadata.width}x${metadata.height} | ${(originalSize / 1024).toFixed(1)}KB → ${(webpSize / 1024).toFixed(1)}KB (${savings}% savings)`);

        return {
            original: imagePath,
            webp: webpPath,
            width: metadata.width,
            height: metadata.height,
            originalSize,
            webpSize,
            savings
        };
    } catch (error) {
        console.error(`❌ Error converting ${imagePath}:`, error.message);
        return { error: true, path: imagePath, message: error.message };
    }
}

/**
 * Extrait les dimensions d'une image
 */
async function getImageDimensions(imagePath) {
    try {
        const metadata = await sharp(imagePath).metadata();
        return {
            width: metadata.width,
            height: metadata.height,
            path: imagePath
        };
    } catch (error) {
        console.error(`❌ Error reading ${imagePath}:`, error.message);
        return null;
    }
}

/**
 * Génère un rapport des dimensions pour mise à jour manuelle
 */
function generateDimensionsReport(dimensions) {
    const reportPath = path.join(ROOT_DIR, 'Docs', 'IMAGE-DIMENSIONS.md');

    let report = `# 📐 Image Dimensions Report\n\n`;
    report += `Generated: ${new Date().toLocaleString('fr-FR')}\n\n`;
    report += `## Instructions\n\n`;
    report += `Add these width/height attributes to your <img> tags to prevent Cumulative Layout Shift (CLS).\n\n`;
    report += `## Images\n\n`;

    for (const dim of dimensions) {
        const relativePath = path.relative(ROOT_DIR, dim.path).replace(/\\/g, '/');
        report += `### ${path.basename(dim.path)}\n`;
        report += `**Path:** \`${relativePath}\`\n`;
        report += `**Dimensions:** ${dim.width}x${dim.height}\n`;
        report += `**HTML:**\n`;
        report += `\`\`\`html\n`;
        report += `<img src="..." alt="..." width="${dim.width}" height="${dim.height}">\n`;
        report += `\`\`\`\n\n`;
    }

    fs.writeFileSync(reportPath, report, 'utf8');
    console.log(`\n📄 Dimensions report: ${reportPath}`);
}

/**
 * Script principal
 */
async function main() {
    console.log('🖼️  Image Optimization Script\n');
    console.log('=' .repeat(60));

    // 1. Trouver toutes les images
    let allImages = [];
    for (const dir of IMAGE_DIRS) {
        const images = findImages(dir);
        allImages = allImages.concat(images);
    }

    console.log(`\n📊 Found ${allImages.length} images to process\n`);

    if (allImages.length === 0) {
        console.log('✅ No images to optimize');
        return;
    }

    // 2. Convertir en WebP
    console.log('🔄 Converting to WebP...\n');
    const results = [];
    for (const imagePath of allImages) {
        const result = await convertToWebP(imagePath);
        if (!result.skipped && !result.error) {
            results.push(result);
        }
    }

    // 3. Obtenir les dimensions de toutes les images (originales + WebP)
    console.log('\n📐 Extracting dimensions...\n');
    const dimensions = [];
    for (const imagePath of allImages) {
        const dim = await getImageDimensions(imagePath);
        if (dim) {
            dimensions.push(dim);
        }
    }

    // 4. Générer le rapport
    if (dimensions.length > 0) {
        generateDimensionsReport(dimensions);
    }

    // 5. Résumé
    console.log('\n' + '='.repeat(60));
    console.log('📊 Summary\n');

    if (results.length > 0) {
        const totalOriginal = results.reduce((sum, r) => sum + r.originalSize, 0);
        const totalWebP = results.reduce((sum, r) => sum + r.webpSize, 0);
        const totalSavings = ((totalOriginal - totalWebP) / totalOriginal * 100).toFixed(1);

        console.log(`✅ Converted: ${results.length} images`);
        console.log(`📦 Size: ${(totalOriginal / 1024).toFixed(1)}KB → ${(totalWebP / 1024).toFixed(1)}KB`);
        console.log(`💾 Savings: ${totalSavings}%`);
    } else {
        console.log(`✅ All images already optimized (${allImages.length} WebP files exist)`);
    }

    console.log('\n✨ Done!');
}

// Exécuter
main().catch(console.error);
