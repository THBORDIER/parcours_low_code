/**
 * Home Hub Module
 *
 * Manages the homepage hub with sections:
 * - Recent articles (Reprendre)
 * - Favorites
 * - Popular tags
 * - All articles with sort/filter
 */

class HomeHub {
    constructor() {
        this.articles = [];
        this.favorites = [];
        this.recent = [];
        this.allArticles = [];
        this.currentPage = 1;
        this.resultsPerPage = 50;

        // Filters
        this.activeFilters = {
            themes: [],
            tags: []
        };
        this.currentSort = 'relevance';
        this.searchInContent = true;

        // LocalStorage keys
        this.FAVORITES_KEY = 'parcours_low_code_favorites';
        this.RECENT_KEY = 'parcours_low_code_recent';
    }

    /**
     * Initialize the home hub
     */
    async init() {
        try {
            // Load articles index
            const response = await fetch('public/data/articles-index.json');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Unable to load articles index`);
            }
            this.articles = await response.json();
            console.log(`[HOME-HUB] Loaded ${this.articles.length} articles`);

            // Load favorites and recent from localStorage
            this.loadFavorites();
            this.loadRecent();

            // Render all sections
            this.renderRecentSection();
            this.renderFavoritesSection();
            this.renderPopularTags();
            this.renderAllArticles();

            // Initialize controls
            this.initControls();

            // Init floating help button
            this.initFloatingHelpButton();

            console.log('[HOME-HUB] ✅ Home hub initialized');
        } catch (error) {
            console.error('[HOME-HUB] Failed to initialize:', error);
        }
    }

    /**
     * Load favorites from localStorage
     */
    loadFavorites() {
        const stored = localStorage.getItem(this.FAVORITES_KEY);
        const favoritePaths = stored ? JSON.parse(stored) : [];
        this.favorites = this.articles.filter(a => favoritePaths.includes(a.path));
    }

    /**
     * Load recent articles from localStorage
     */
    loadRecent() {
        const stored = localStorage.getItem(this.RECENT_KEY);
        const recentItems = stored ? JSON.parse(stored) : [];
        this.recent = recentItems
            .map(item => this.articles.find(a => a.path === item.path))
            .filter(Boolean)
            .slice(0, 5);
    }

    /**
     * Render recent articles section
     */
    renderRecentSection() {
        const section = document.getElementById('recent-section');
        const grid = document.getElementById('recent-grid');

        if (this.recent.length === 0) {
            section.style.display = 'none';
            return;
        }

        section.style.display = 'block';
        grid.innerHTML = this.recent
            .map(article => this.createArticleCard(article))
            .join('');
    }

    /**
     * Render favorites section
     */
    renderFavoritesSection() {
        const section = document.getElementById('favorites-section');
        const grid = document.getElementById('favorites-grid');

        if (this.favorites.length === 0) {
            section.style.display = 'none';
            return;
        }

        section.style.display = 'block';
        grid.innerHTML = this.favorites
            .slice(0, 5)
            .map(article => this.createArticleCard(article))
            .join('');
    }

    /**
     * Render popular tags section
     */
    renderPopularTags() {
        const grid = document.getElementById('popular-tags-grid');

        // Count tag occurrences
        const tagCounts = {};
        this.articles.forEach(article => {
            if (article.tags && Array.isArray(article.tags)) {
                article.tags.forEach(tag => {
                    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                });
            }
        });

        // Sort by count and get top 15
        const popularTags = Object.entries(tagCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15)
            .map(([tag, count]) => ({ tag, count }));

        grid.innerHTML = popularTags
            .map(({ tag, count }) => `
                <span class="popular-tag-chip" data-tag="${tag}">
                    ${tag} <span class="tag-count">(${count})</span>
                </span>
            `)
            .join('');

        // Add click handlers
        grid.querySelectorAll('.popular-tag-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const tag = chip.dataset.tag;
                this.toggleTagFilter(tag);
            });
        });
    }

    /**
     * Render all articles section
     */
    renderAllArticles() {
        // Apply filters and sort
        let filtered = this.articles;

        // Apply theme filter
        if (this.activeFilters.themes.length > 0) {
            filtered = filtered.filter(a => this.activeFilters.themes.includes(a.theme));
        }

        // Apply tag filter
        if (this.activeFilters.tags.length > 0) {
            filtered = filtered.filter(a => {
                return this.activeFilters.tags.some(tag =>
                    a.tags && a.tags.includes(tag)
                );
            });
        }

        // Sort
        filtered = this.sortArticles(filtered);

        // Store for pagination
        this.allArticles = filtered;
        this.currentPage = 1;

        // Update count
        const countEl = document.getElementById('article-count');
        countEl.textContent = `(${filtered.length} articles)`;

        // Render first page
        this.renderArticlesPage();
    }

    /**
     * Render articles page with pagination
     */
    renderArticlesPage() {
        const grid = document.getElementById('all-articles-grid');
        const loadMoreContainer = document.getElementById('home-load-more-container');
        const loadMoreBtn = document.getElementById('home-load-more-btn');

        const startIndex = 0;
        const endIndex = this.currentPage * this.resultsPerPage;
        const displayed = this.allArticles.slice(startIndex, endIndex);
        const hasMore = endIndex < this.allArticles.length;

        grid.innerHTML = displayed
            .map(article => this.createArticleCard(article))
            .join('');

        // Show/hide load more button
        if (hasMore) {
            loadMoreContainer.style.display = 'block';
            const remaining = this.allArticles.length - endIndex;
            loadMoreBtn.textContent = `Afficher plus (${Math.min(this.resultsPerPage, remaining)} articles restants)`;

            // Remove old listener and add new one
            const newBtn = loadMoreBtn.cloneNode(true);
            loadMoreBtn.parentNode.replaceChild(newBtn, loadMoreBtn);
            newBtn.addEventListener('click', () => {
                this.currentPage++;
                this.renderArticlesPage();
                // Smooth scroll to new content
                setTimeout(() => {
                    const cards = grid.querySelectorAll('.article-card');
                    if (cards[displayed.length]) {
                        cards[displayed.length].scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, 100);
            });
        } else {
            loadMoreContainer.style.display = 'none';
        }
    }

    /**
     * Sort articles
     */
    sortArticles(articles) {
        switch (this.currentSort) {
            case 'title':
                return [...articles].sort((a, b) => a.title.localeCompare(b.title));

            case 'date':
                return [...articles].sort((a, b) => {
                    const parseDate = (dateStr) => {
                        if (!dateStr) return new Date(0);
                        const [day, month, year] = dateStr.split('/');
                        return new Date(year, month - 1, day);
                    };
                    return parseDate(b.date) - parseDate(a.date);
                });

            case 'relevance':
            default:
                // Keep original order (relevance based on index order)
                return articles;
        }
    }

    /**
     * Create article card HTML
     */
    createArticleCard(article) {
        const themeLabel = article.theme.charAt(0).toUpperCase() + article.theme.slice(1);
        const levelBadge = article.level ?
            `<span class="badge level-${article.level.toLowerCase()}">${article.level}</span>` : '';
        const categoryBadge = article.category ?
            `<span class="badge category">${article.category}</span>` : '';

        const isFavorite = this.favorites.some(f => f.path === article.path);
        const favoriteIcon = isFavorite ? '⭐' : '☆';

        const tagsHTML = article.tags && article.tags.length > 0 ? `
            <div class="article-tags">
                ${article.tags.slice(0, 4).map(tag => `
                    <span class="tag-chip-small" data-tag="${tag}">${tag}</span>
                `).join('')}
            </div>
        ` : '';

        return `
            <div class="article-card">
                <div class="article-header">
                    <h3><a href="/themes/${article.theme}.html?article=${encodeURIComponent(article.path)}">${article.title}</a></h3>
                    <button class="favorite-btn-small ${isFavorite ? 'active' : ''}"
                            data-path="${article.path}"
                            aria-label="Favoris"
                            title="Ajouter aux favoris">
                        ${favoriteIcon}
                    </button>
                </div>
                <div class="article-badges">
                    <span class="badge theme">${themeLabel}</span>
                    ${categoryBadge}
                    ${levelBadge}
                </div>
                ${article.excerpt ? `
                    <p class="article-excerpt">${article.excerpt.substring(0, 120)}...</p>
                ` : ''}
                ${tagsHTML}
            </div>
        `;
    }

    /**
     * Initialize controls (filters, sort)
     */
    initControls() {
        // Populate theme filters
        const themes = [...new Set(this.articles.map(a => a.theme))].sort();
        const themeFilters = document.getElementById('home-theme-filters');
        themeFilters.innerHTML = themes.map(theme => `
            <div class="chip" data-theme="${theme}">${theme}</div>
        `).join('');

        themeFilters.querySelectorAll('.chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const theme = chip.dataset.theme;
                this.toggleThemeFilter(theme, chip);
            });
        });

        // Populate tag filters (top 20 tags)
        const tagCounts = {};
        this.articles.forEach(article => {
            if (article.tags) {
                article.tags.forEach(tag => {
                    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                });
            }
        });
        const topTags = Object.keys(tagCounts)
            .sort((a, b) => tagCounts[b] - tagCounts[a])
            .slice(0, 20);

        const tagFilters = document.getElementById('home-tag-filters');
        tagFilters.innerHTML = topTags.map(tag => `
            <div class="chip tag-chip" data-tag="${tag}">${tag}</div>
        `).join('');

        tagFilters.querySelectorAll('.chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const tag = chip.dataset.tag;
                this.toggleTagFilter(tag, chip);
            });
        });

        // Sort select
        const sortSelect = document.getElementById('home-sort-select');
        sortSelect.addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.renderAllArticles();
        });

        // Search in content toggle
        const searchInContentToggle = document.getElementById('home-search-in-content');
        searchInContentToggle.addEventListener('change', (e) => {
            this.searchInContent = e.target.checked;
        });

        // Favorite button delegation
        document.addEventListener('click', (e) => {
            if (e.target.closest('.favorite-btn-small')) {
                const btn = e.target.closest('.favorite-btn-small');
                const path = btn.dataset.path;
                this.toggleFavorite(path);
            }
        });

        // Tag chip delegation (in article cards)
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('tag-chip-small')) {
                const tag = e.target.dataset.tag;
                this.toggleTagFilter(tag);
            }
        });
    }

    /**
     * Toggle theme filter
     */
    toggleThemeFilter(theme, chipElement) {
        const index = this.activeFilters.themes.indexOf(theme);
        if (index > -1) {
            this.activeFilters.themes.splice(index, 1);
            if (chipElement) chipElement.classList.remove('active');
        } else {
            this.activeFilters.themes.push(theme);
            if (chipElement) chipElement.classList.add('active');
        }
        this.renderAllArticles();
    }

    /**
     * Toggle tag filter
     */
    toggleTagFilter(tag, chipElement) {
        const index = this.activeFilters.tags.indexOf(tag);
        if (index > -1) {
            this.activeFilters.tags.splice(index, 1);
            if (chipElement) chipElement.classList.remove('active');
        } else {
            this.activeFilters.tags.push(tag);
            if (chipElement) chipElement.classList.add('active');
        }

        // Update all tag chips to reflect active state
        document.querySelectorAll('[data-tag="' + tag + '"]').forEach(chip => {
            if (index > -1) {
                chip.classList.remove('active');
            } else {
                chip.classList.add('active');
            }
        });

        this.renderAllArticles();
    }

    /**
     * Toggle favorite
     */
    toggleFavorite(path) {
        const stored = localStorage.getItem(this.FAVORITES_KEY);
        let favorites = stored ? JSON.parse(stored) : [];

        const index = favorites.indexOf(path);
        if (index > -1) {
            favorites.splice(index, 1);
        } else {
            favorites.push(path);
        }

        localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(favorites));

        // Reload and re-render
        this.loadFavorites();
        this.renderFavoritesSection();
        this.renderAllArticles();

        // Show toast
        if (window.powerUX) {
            const message = index > -1 ? 'Retiré des favoris' : 'Ajouté aux favoris';
            window.powerUX.showToast(message, 'success', 2000);
        }
    }

    /**
     * Initialize floating help button
     */
    initFloatingHelpButton() {
        const btn = document.getElementById('floating-help-btn');
        if (btn && window.powerUX) {
            btn.addEventListener('click', () => {
                window.powerUX.showKeyboardHelp();
            });
        }
    }
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    const homeHub = new HomeHub();
    homeHub.init();
});
