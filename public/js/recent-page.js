/**
 * Recent Articles Page Script
 * Handles the recent.html page functionality
 */

class RecentPage {
    constructor() {
        this.RECENT_KEY = 'parcours_low_code_recent';
        this.articles = [];
        this.recentItems = [];
        this.currentSort = 'recent';
    }

    async init() {
        try {
            // Load articles index
            const response = await fetch('public/data/articles-index.json');
            if (!response.ok) throw new Error('Failed to load articles index');
            this.articles = await response.json();

            // Load recent from localStorage
            this.loadRecent();

            // Setup event listeners
            this.setupEventListeners();

            // Display recent
            this.displayRecent();

            console.log('[RECENT] ✅ Initialized');
        } catch (error) {
            console.error('[RECENT] Failed to initialize:', error);
            this.showError();
        }
    }

    loadRecent() {
        const stored = localStorage.getItem(this.RECENT_KEY);
        this.recentItems = stored ? JSON.parse(stored) : [];
    }

    saveRecent() {
        localStorage.setItem(this.RECENT_KEY, JSON.stringify(this.recentItems));
    }

    setupEventListeners() {
        // Clear history button
        const clearBtn = document.getElementById('clear-history');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearHistory());
        }

        // Sort select
        const sortSelect = document.getElementById('recent-sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.displayRecent();
            });
        }
    }

    displayRecent() {
        const container = document.getElementById('recent-container');
        if (!container) return;

        if (this.recentItems.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🕒</div>
                    <h2>Aucun historique pour le moment</h2>
                    <p>Consultez des articles pour les voir apparaître ici.</p>
                    <a href="index.html" class="btn-primary">Parcourir les articles</a>
                </div>
            `;
            return;
        }

        // Match recent items with articles
        let recentArticles = this.recentItems
            .map(item => {
                const article = this.articles.find(a => a.path === item.path);
                return article ? { ...article, viewedAt: item.timestamp } : null;
            })
            .filter(Boolean);

        // Sort
        recentArticles = this.sortArticles(recentArticles);

        // Build HTML
        container.innerHTML = `
            <div class="results-grid">
                ${recentArticles.map(article => this.createArticleCard(article)).join('')}
            </div>
        `;
    }

    sortArticles(articles) {
        switch (this.currentSort) {
            case 'title':
                return articles.sort((a, b) => a.title.localeCompare(b.title));
            case 'theme':
                return articles.sort((a, b) => a.theme.localeCompare(b.theme));
            case 'recent':
            default:
                return articles.sort((a, b) => b.viewedAt - a.viewedAt);
        }
    }

    createArticleCard(article) {
        const themeLabel = article.theme.charAt(0).toUpperCase() + article.theme.slice(1);
        const levelBadge = article.level ?
            `<span class="badge level-${article.level.toLowerCase()}">${article.level}</span>` : '';
        const categoryBadge = article.category ?
            `<span class="badge category">${article.category}</span>` : '';

        // Tags
        const tagsHTML = article.tags && article.tags.length > 0 ?
            `<div class="result-tags">
                ${article.tags.slice(0, 5).map(tag =>
                    `<span class="tag-chip">${tag}</span>`
                ).join('')}
            </div>` : '';

        // Timestamp
        const relativeTime = window.powerUX ?
            powerUX.formatRelativeTime(article.viewedAt) : '';

        return `
            <div class="result-card card-hover-lift">
                <div class="result-header">
                    <h3>${article.title}</h3>
                    ${relativeTime ? `<span class="timestamp">${relativeTime}</span>` : ''}
                </div>
                <div class="result-badges">
                    <span class="badge theme">${themeLabel}</span>
                    ${categoryBadge}
                    ${levelBadge}
                </div>
                ${article.excerpt ? `
                    <p class="result-excerpt">${article.excerpt}</p>
                ` : ''}
                ${tagsHTML}
                <a href="themes/${article.theme}.html?article=${encodeURIComponent(article.path)}"
                   class="result-link">
                    Lire l'article →
                </a>
            </div>
        `;
    }

    clearHistory() {
        if (this.recentItems.length === 0) return;

        const confirmed = confirm('Êtes-vous sûr de vouloir effacer tout l\'historique ?');
        if (!confirmed) return;

        this.recentItems = [];
        this.saveRecent();
        this.displayRecent();

        if (window.powerUX) {
            powerUX.showToast('Historique effacé', 'success');
        }
    }

    showError() {
        const container = document.getElementById('recent-container');
        if (container) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">❌</div>
                    <h2>Erreur de chargement</h2>
                    <p>Impossible de charger les articles. Veuillez réessayer.</p>
                    <button class="btn-primary" onclick="location.reload()">Recharger</button>
                </div>
            `;
        }
    }
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    const recentPage = new RecentPage();
    recentPage.init();
});
