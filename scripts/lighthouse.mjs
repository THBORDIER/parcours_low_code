#!/usr/bin/env node

/**
 * Lighthouse Performance Benchmark Script - v2.0
 *
 * Fully self-contained: starts HTTP server, runs audits, generates reports, cleans up
 * Usage: npm run lighthouse
 */

import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const handler = require('serve-handler');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

// Configuration
const PREFERRED_PORT = 4173;
const FALLBACK_PORTS = [8080, 3000, 5000, 8888];
const REPORTS_DIR = path.join(ROOT_DIR, 'reports', 'lighthouse');

// Pages to audit
const PAGES = [
    { name: 'Homepage', path: '/index.html' },
    { name: 'WeWeb Theme', path: '/themes/weweb.html' },
    { name: 'Xano Theme', path: '/themes/xano.html' }
];

/**
 * Log with [LH] prefix
 */
function log(...args) {
    console.log('[LH]', ...args);
}

function error(...args) {
    console.error('[LH]', ...args);
}

/**
 * Find available port
 */
async function findAvailablePort() {
    const ports = [PREFERRED_PORT, ...FALLBACK_PORTS];

    for (const port of ports) {
        try {
            await new Promise((resolve, reject) => {
                const server = http.createServer();
                server.once('error', reject);
                server.once('listening', () => {
                    server.close();
                    resolve();
                });
                server.listen(port);
            });
            return port;
        } catch (err) {
            // Port in use, try next
        }
    }

    throw new Error('No available ports found');
}

/**
 * Start embedded HTTP server
 */
async function startServer(port) {
    log(`Starting embedded HTTP server on port ${port}...`);

    const server = http.createServer((request, response) => {
        return handler(request, response, {
            public: ROOT_DIR,
            cleanUrls: true,
            trailingSlash: false
        });
    });

    await new Promise((resolve, reject) => {
        server.once('error', reject);
        server.once('listening', resolve);
        server.listen(port);
    });

    log(`✅ Server started at http://localhost:${port}`);
    return server;
}

/**
 * Health check - verify URL responds
 */
async function healthCheck(url, maxAttempts = 5) {
    log(`Health check: ${url}`);

    for (let i = 0; i < maxAttempts; i++) {
        try {
            const response = await fetch(url);
            if (response.ok) {
                log(`✅ Health check passed`);
                return true;
            }
        } catch (err) {
            if (i < maxAttempts - 1) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
    }

    throw new Error(`Health check failed after ${maxAttempts} attempts`);
}

/**
 * Check Chrome availability
 */
async function checkChromeAvailability() {
    try {
        const installations = await chromeLauncher.Launcher.getInstallations();
        if (installations.length === 0) {
            error('❌ Chrome/Chromium not found!');
            error('');
            error('Solutions:');
            error('1. Install Google Chrome or Chromium');
            error('2. Set CHROME_PATH environment variable');
            error('   Example: set CHROME_PATH="C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"');
            error('');
            return false;
        }
        log(`✅ Chrome found: ${installations[0]}`);
        return true;
    } catch (err) {
        error('❌ Error detecting Chrome:', err.message);
        return false;
    }
}

/**
 * Ensure reports directory exists with timestamp subfolder
 */
function ensureReportsDir() {
    const timestamp = new Date().toISOString()
        .replace(/T/, '_')
        .replace(/:/g, '-')
        .slice(0, -5); // YYYY-MM-DD_HH-mm

    const reportDir = path.join(REPORTS_DIR, timestamp);

    if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
        log(`📁 Created reports directory: ${reportDir}`);
    }

    return reportDir;
}

/**
 * Run Lighthouse audit on a single page
 */
async function runLighthouse(baseUrl, page, reportDir) {
    const url = `${baseUrl}${page.path}`;
    log('');
    log(`🔍 Auditing: ${page.name}`);
    log(`   URL: ${url}`);

    let chrome;
    try {
        chrome = await chromeLauncher.launch({
            chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu']
        });

        const options = {
            logLevel: 'error', // Reduce noise
            output: ['json', 'html'],
            onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
            port: chrome.port
        };

        const runnerResult = await lighthouse(url, options);

        // Extract scores
        const { lhr } = runnerResult;
        const scores = {
            performance: Math.round(lhr.categories.performance.score * 100),
            accessibility: Math.round(lhr.categories.accessibility.score * 100),
            bestPractices: Math.round(lhr.categories['best-practices'].score * 100),
            seo: Math.round(lhr.categories.seo.score * 100)
        };

        // Generate filenames
        const safePageName = page.name.replace(/[^a-z0-9]/gi, '-').toLowerCase();
        const htmlFilename = `${safePageName}.report.html`;
        const jsonFilename = `${safePageName}.report.json`;

        // Save reports
        const htmlPath = path.join(reportDir, htmlFilename);
        const jsonPath = path.join(reportDir, jsonFilename);

        fs.writeFileSync(htmlPath, runnerResult.report[1]);
        fs.writeFileSync(jsonPath, runnerResult.report[0]);

        log(`✅ ${page.name} completed:`);
        log(`   Performance: ${scores.performance}`);
        log(`   Accessibility: ${scores.accessibility}`);
        log(`   Best Practices: ${scores.bestPractices}`);
        log(`   SEO: ${scores.seo}`);
        log(`   📄 Reports: ${htmlFilename}, ${jsonFilename}`);

        // Extract opportunities for documentation
        const opportunities = lhr.audits;
        const topOpportunities = Object.values(opportunities)
            .filter(audit => audit.score !== null && audit.score < 1 && audit.details?.overallSavingsMs > 0)
            .sort((a, b) => b.details.overallSavingsMs - a.details.overallSavingsMs)
            .slice(0, 5)
            .map(audit => ({
                title: audit.title,
                savings: Math.round(audit.details.overallSavingsMs) + 'ms'
            }));

        return {
            pageName: page.name,
            scores,
            htmlFilename,
            jsonFilename,
            opportunities: topOpportunities
        };
    } finally {
        if (chrome) {
            await chrome.kill();
        }
    }
}

/**
 * Generate summary markdown
 */
function generateSummary(results, reportDir) {
    const timestamp = new Date().toLocaleString('fr-FR');
    const summary = [
        '# Lighthouse Audit Report',
        '',
        `**Date:** ${timestamp}`,
        `**Node:** ${process.version}`,
        `**Platform:** ${process.platform}`,
        '',
        '## Scores',
        '',
        '| Page | Performance | Accessibility | Best Practices | SEO |',
        '|------|-------------|---------------|----------------|-----|'
    ];

    results.forEach(result => {
        summary.push(
            `| ${result.pageName} | ${result.scores.performance} | ${result.scores.accessibility} | ${result.scores.bestPractices} | ${result.scores.seo} |`
        );
    });

    summary.push('');
    summary.push('## Reports');
    summary.push('');

    results.forEach(result => {
        summary.push(`### ${result.pageName}`);
        summary.push(`- HTML: [${result.htmlFilename}](./${result.htmlFilename})`);
        summary.push(`- JSON: [${result.jsonFilename}](./${result.jsonFilename})`);
        summary.push('');
    });

    // Add top opportunities
    summary.push('## Top Opportunities');
    summary.push('');
    results.forEach(result => {
        if (result.opportunities && result.opportunities.length > 0) {
            summary.push(`### ${result.pageName}`);
            result.opportunities.forEach((opp, idx) => {
                summary.push(`${idx + 1}. **${opp.title}** (${opp.savings})`);
            });
            summary.push('');
        }
    });

    const summaryPath = path.join(reportDir, 'summary.md');
    fs.writeFileSync(summaryPath, summary.join('\n'));

    log(`\n📊 Summary: ${summaryPath}`);
    return summaryPath;
}

/**
 * Main execution
 */
async function main() {
    console.log('');
    log('🚀 Lighthouse Benchmark - Self-Contained Edition');
    log('================================================');
    console.log('');

    // Check Chrome
    const hasChrome = await checkChromeAvailability();
    if (!hasChrome) {
        process.exit(1);
    }

    // Find available port
    let port;
    try {
        port = await findAvailablePort();
    } catch (err) {
        error('❌ Cannot find available port:', err.message);
        process.exit(1);
    }

    // Prepare reports directory
    const reportDir = ensureReportsDir();

    // Start server
    let server;
    try {
        server = await startServer(port);
        const baseUrl = `http://localhost:${port}`;

        // Health check
        await healthCheck(baseUrl);

        // Run audits
        const results = [];
        for (const page of PAGES) {
            try {
                const result = await runLighthouse(baseUrl, page, reportDir);
                results.push(result);
            } catch (error) {
                error(`❌ Error auditing ${page.name}:`, error.message);
            }
        }

        // Generate summary
        if (results.length > 0) {
            generateSummary(results, reportDir);
            log('');
            log('✅ All audits complete!');
            log(`📁 Reports: ${reportDir}`);
            console.log('');
        } else {
            error('');
            error('❌ No audits completed successfully');
            process.exit(1);
        }
    } catch (err) {
        error('❌ Fatal error:', err.message);
        throw err;
    } finally {
        // Clean up: close server
        if (server) {
            server.close();
            log('🛑 Server stopped');
        }
    }
}

main().catch(error => {
    error('💥 Unhandled error:', error);
    process.exit(1);
});
