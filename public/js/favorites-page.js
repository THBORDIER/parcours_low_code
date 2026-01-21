/**
 * Favorites Page Script
 * Handles the favorites.html page functionality
 */

class FavoritesPage {
    constructor() {
        this.FAVORITES_KEY = 'parcours_low_code_favorites';
        this.articles = [];
        this.favorites = [];
        this.filteredArticles = [];
        this.currentSort = 'recent';
    }

    async init() {
        try {
            // Load articles index
            const response = await fetch('public/data/articles-index.json');
            if (!response.ok) throw new Error('Failed to load articles index');
            this.articles = await response.json();

            // Load favorites from localStorage
            this.loadFavorites();

            // Setup event listeners
            this.setupEventListeners();

            // Display favorites
            this.displayFavorites();

            console.log('[FAVORITES] ✅ Initialized');
        } catch (error) {
            console.error('[FAVORITES] Failed to initialize:', error);
            this.showError();
        }
    }

    loadFavorites() {
        const stored = localStorage.getItem(this.FAVORITES_KEY);
        this.favorites = stored ? JSON.parse(stored) : [];
    }

    saveFavorites() {
        localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(this.favorites));
    }

    setupEventListeners() {
        // Export button
        const exportBtn = document.getElementById('export-favorites');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportFavorites());
        }

        // Import button
        const importBtn = document.getElementById('import-favorites');
        const fileInput = document.getElementById('import-file-input');
        if (importBtn && fileInput) {
            importBtn.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', (e) => this.importFavorites(e));
        }

        // Sort select
        const sortSelect = document.getElementById('favorites-sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.displayFavorites();
            });
        }
    }

    displayFavorites() {
        const container = document.getElementById('favorites-container');
        if (!container) return;

        if (this.favorites.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">⭐</div>
                    <h2>Aucun favori pour le moment</h2>
                    <p>Cliquez sur l'étoile (⭐) sur un article pour l'ajouter à vos favoris.</p>
                    <a href="index.html" class="btn-primary">Parcourir les articles</a>
                </div>
            `;
            return;
        }

        // Get favorite articles
        let favoriteArticles = this.articles.filter(a => this.favorites.includes(a.path));

        // Sort
        favoriteArticles = this.sortArticles(favoriteArticles);

        // Build HTML
        container.innerHTML = `
            <div class="results-grid">
                ${favoriteArticles.map(article => this.createArticleCard(article)).join('')}
            </div>
        `;

        // Add remove favorite handlers
        container.querySelectorAll('.favorite-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const path = btn.dataset.path;
                this.removeFavorite(path);
            });
        });
    }

    sortArticles(articles) {
        switch (this.currentSort) {
            case 'title':
                return articles.sort((a, b) => a.title.localeCompare(b.title));
            case 'theme':
                return articles.sort((a, b) => a.theme.localeCompare(b.theme));
            case 'recent':
            default:
                // Keep order from favorites array (most recent first)
                return articles.sort((a, b) => {
                    return this.favorites.indexOf(b.path) - this.favorites.indexOf(a.path);
                });
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

        return `
            <div class="result-card card-hover-lift">
                <div class="result-header">
                    <h3>${article.title}</h3>
                    <button class="favorite-btn active"
                            data-path="${article.path}"
                            aria-label="Retirer des favoris"
                            title="Retirer des favoris">
                        ⭐
                    </button>
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

    removeFavorite(path) {
        const index = this.favorites.indexOf(path);
        if (index > -1) {
            this.favorites.splice(index, 1);
            this.saveFavorites();
            this.displayFavorites();

            // Show toast
            if (window.powerUX) {
                powerUX.showToast('Article retiré des favoris', 'info');
            }
        }
    }

    exportFavorites() {
        if (this.favorites.length === 0) {
            if (window.powerUX) {
                powerUX.showToast('Aucun favori à exporter', 'error');
            }
            return;
        }

        const data = {
            exportDate: new Date().toISOString(),
            favorites: this.favorites
        };

        if (window.powerUX) {
            powerUX.exportToJSON(data, `favoris-${Date.now()}.json`);
            powerUX.showToast(`${this.favorites.length} favoris exportés`, 'success');
        }
    }

    async importFavorites(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            if (window.powerUX) {
                const data = await powerUX.importFromJSON(file);

                if (!data.favorites || !Array.isArray(data.favorites)) {
                    throw new Error('Format de fichier invalide');
                }

                // Merge with existing favorites (avoid duplicates)
                const newFavorites = [...new Set([...this.favorites, ...data.favorites])];
                const addedCount = newFavorites.length - this.favorites.length;

                this.favorites = newFavorites;
                this.saveFavorites();
                this.displayFavorites();

                powerUX.showToast(`${addedCount} favoris importés`, 'success');
            }
        } catch (error) {
            console.error('[FAVORITES] Import error:', error);
            if (window.powerUX) {
                powerUX.showToast('Erreur lors de l\'importation: ' + error.message, 'error');
            }
        }

        // Reset file input
        event.target.value = '';
    }

    showError() {
        const container = document.getElementById('favorites-container');
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
    const favoritesPage = new FavoritesPage();
    favoritesPage.init();
});
