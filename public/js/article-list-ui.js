/**
 * Article List UI Component
 *
 * Shared component for rendering article lists with:
 * - Sort/filter controls
 * - Article cards
 * - Pagination
 * - Tag filtering
 * - Favorites integration
 */

class ArticleListUI {
    constructor(options = {}) {
        this.favorites = [];
        this.FAVORITES_KEY = 'parcours_low_code_favorites';
        this.debugMode = new URLSearchParams(window.location.search).has('debug');

        // Configuration
        this.config = {
            resultsPerPage: options.resultsPerPage || 50,
            showSearchToggle: options.showSearchToggle !== false,
            showThemeFilter: options.showThemeFilter || false,
            compactMode: options.compactMode || false,
            ...options
        };

        this.loadFavorites();
    }

    log(...args) {
        if (this.debugMode) {
            console.log('[ARTICLE-LIST-UI]', ...args);
        }
    }

    /**
     * Load favorites from localStorage
     */
    loadFavorites() {
        const stored = localStorage.getItem(this.FAVORITES_KEY);
        const favoritePaths = stored ? JSON.parse(stored) : [];
        this.favorites = favoritePaths;
    }

    /**
     * Check if article is favorite
     */
    isFavorite(path) {
        return this.favorites.includes(path);
    }

    /**
     * Toggle favorite
     */
    toggleFavorite(path, callback) {
        const stored = localStorage.getItem(this.FAVORITES_KEY);
        let favorites = stored ? JSON.parse(stored) : [];

        const index = favorites.indexOf(path);
        if (index > -1) {
            favorites.splice(index, 1);
        } else {
            favorites.push(path);
        }

        localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(favorites));
        this.loadFavorites();

        // Show toast
        if (window.powerUX) {
            const message = index > -1 ? 'Retiré des favoris' : 'Ajouté aux favoris';
            window.powerUX.showToast(message, 'success', 2000);
        }

        if (callback) callback();
    }

    /**
     * Create article card HTML
     */
    createArticleCard(article, options = {}) {
        const { query = '', showTheme = false, compact = false } = options;

        const themeLabel = article.theme.charAt(0).toUpperCase() + article.theme.slice(1);
        const levelBadge = article.level ?
            `<span class="badge level-${article.level.toLowerCase()}">${article.level}</span>` : '';
        const categoryBadge = article.category ?
            `<span class="badge category">${article.category}</span>` : '';

        const isFavorite = this.isFavorite(article.path);
        const favoriteIcon = isFavorite ? '⭐' : '☆';

        const tagsHTML = article.tags && article.tags.length > 0 ? `
            <div class="article-tags">
                ${article.tags.slice(0, 4).map(tag => `
                    <span class="tag-chip-small" data-tag="${tag}">${tag}</span>
                `).join('')}
            </div>
        ` : '';

        const highlightedTitle = query ? this.highlightText(article.title, query) : article.title;

        return `
            <div class="article-card ${compact ? 'article-card-compact' : ''}">
                <div class="article-header">
                    <h3><a href="themes/${article.theme}.html?article=${encodeURIComponent(article.path)}">${highlightedTitle}</a></h3>
                    <button class="favorite-btn-small ${isFavorite ? 'active' : ''}"
                            data-path="${article.path}"
                            aria-label="Favoris"
                            title="Ajouter aux favoris">
                        ${favoriteIcon}
                    </button>
                </div>
                <div class="article-badges">
                    ${showTheme ? `<span class="badge theme">${themeLabel}</span>` : ''}
                    ${categoryBadge}
                    ${levelBadge}
                </div>
                ${article.excerpt && !compact ? `
                    <p class="article-excerpt">${article.excerpt.substring(0, 120)}...</p>
                ` : ''}
                ${tagsHTML}
            </div>
        `;
    }

    /**
     * Create controls HTML
     */
    createControlsHTML(options = {}) {
        const {
            showSearchToggle = this.config.showSearchToggle,
            showThemeFilter = this.config.showThemeFilter,
            themes = [],
            tags = [],
            controlsId = 'article-controls'
        } = options;

        return `
            <div class="search-controls" id="${controlsId}">
                ${showSearchToggle ? `
                <div class="search-options">
                    <label class="search-toggle">
                        <input type="checkbox" class="search-in-content-toggle" checked>
                        <span>Rechercher dans le contenu</span>
                    </label>
                </div>
                ` : ''}
                <div class="search-filters">
                    ${showThemeFilter && themes.length > 0 ? `
                    <div class="filter-group">
                        <label>Thèmes</label>
                        <div class="filter-chips theme-filter-chips">
                            ${themes.map(theme => `
                                <div class="chip" data-theme="${theme}">${theme}</div>
                            `).join('')}
                        </div>
                    </div>
                    ` : ''}
                    ${tags.length > 0 ? `
                    <div class="filter-group">
                        <label>Tags</label>
                        <div class="filter-chips tag-filter-chips">
                            ${tags.map(tag => `
                                <div class="chip tag-chip" data-tag="${tag}">${tag}</div>
                            `).join('')}
                        </div>
                    </div>
                    ` : ''}
                </div>
                <div class="sort-controls">
                    <label for="article-sort-select">Trier par :</label>
                    <select class="sort-select article-sort-select">
                        <option value="relevance">Pertinence</option>
                        <option value="title">Titre (A → Z)</option>
                        <option value="date">Plus récents</option>
                    </select>
                    <button class="btn-secondary reset-filters-btn" style="margin-left: 10px;">
                        Réinitialiser
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Sort articles
     */
    sortArticles(articles, sortBy = 'relevance') {
        switch (sortBy) {
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
                return articles;
        }
    }

    /**
     * Render paginated articles
     */
    renderPaginatedArticles(articles, currentPage, container, options = {}) {
        const { resultsPerPage = this.config.resultsPerPage, loadMoreBtnId = 'load-more-btn' } = options;

        const startIndex = 0;
        const endIndex = currentPage * resultsPerPage;
        const displayed = articles.slice(startIndex, endIndex);
        const hasMore = endIndex < articles.length;

        container.innerHTML = displayed
            .map(article => this.createArticleCard(article, options))
            .join('');

        // Return info for load more button
        return {
            hasMore,
            remaining: articles.length - endIndex,
            displayedCount: displayed.length,
            totalCount: articles.length
        };
    }

    /**
     * Highlight text
     */
    highlightText(text, query) {
        if (!query || query.trim().length < 2) return text;

        const normalizedQuery = this.normalizeString(query);
        const words = text.split(/\b/);

        return words.map(word => {
            const normalizedWord = this.normalizeString(word);
            if (normalizedWord.includes(normalizedQuery)) {
                return `<mark class="highlight">${word}</mark>`;
            }
            return word;
        }).join('');
    }

    /**
     * Normalize string for search
     */
    normalizeString(str) {
        return str
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
    }

    /**
     * Filter articles by query
     */
    filterByQuery(articles, query, searchInContent = true) {
        if (!query || query.trim().length < 2) return articles;

        const normalizedQuery = this.normalizeString(query);

        return articles.filter(article => {
            // Title
            if (this.normalizeString(article.title).includes(normalizedQuery)) {
                return true;
            }

            // Keywords
            if (article.keywords && article.keywords.length > 0) {
                const keywordMatch = article.keywords.some(keyword =>
                    this.normalizeString(keyword).includes(normalizedQuery)
                );
                if (keywordMatch) return true;
            }

            // Tags
            if (article.tags && article.tags.length > 0) {
                const tagMatch = article.tags.some(tag =>
                    this.normalizeString(tag).includes(normalizedQuery)
                );
                if (tagMatch) return true;
            }

            // Excerpt (only if searchInContent is true)
            if (searchInContent && article.excerpt) {
                if (this.normalizeString(article.excerpt).includes(normalizedQuery)) {
                    return true;
                }
            }

            // Category
            if (article.category && this.normalizeString(article.category).includes(normalizedQuery)) {
                return true;
            }

            return false;
        });
    }

    /**
     * Filter articles by tags
     */
    filterByTags(articles, tags) {
        if (tags.length === 0) return articles;

        return articles.filter(article => {
            return tags.some(tag => article.tags && article.tags.includes(tag));
        });
    }

    /**
     * Filter articles by themes
     */
    filterByThemes(articles, themes) {
        if (themes.length === 0) return articles;

        return articles.filter(article => themes.includes(article.theme));
    }

    /**
     * Get top tags from articles
     */
    getTopTags(articles, limit = 20) {
        const tagCounts = {};
        articles.forEach(article => {
            if (article.tags) {
                article.tags.forEach(tag => {
                    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                });
            }
        });

        return Object.keys(tagCounts)
            .sort((a, b) => tagCounts[b] - tagCounts[a])
            .slice(0, limit);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ArticleListUI;
}
