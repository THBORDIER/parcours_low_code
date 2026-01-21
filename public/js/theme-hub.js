/**
 * Theme Hub Enhancer
 *
 * Progressive enhancement for theme pages:
 * - Adds sorting, filtering, pagination
 * - Maintains fallback to HTML list when JS is off
 * - Reuses ArticleListUI component
 */

class ThemeHub {
    constructor() {
        this.articles = [];
        this.filteredArticles = [];
        this.currentTheme = null;
        this.currentPage = 1;
        this.resultsPerPage = 50;

        // Filters
        this.activeFilters = {
            tags: [],
            query: ''
        };
        this.currentSort = 'relevance';
        this.searchInContent = true;

        // UI Component
        this.ui = new ArticleListUI({
            resultsPerPage: this.resultsPerPage,
            showSearchToggle: true,
            showThemeFilter: false,
            compactMode: false
        });

        this.debugMode = new URLSearchParams(window.location.search).has('debug');
    }

    log(...args) {
        if (this.debugMode) {
            console.log('[THEME-HUB]', ...args);
        }
    }

    /**
     * Initialize theme hub
     */
    async init() {
        try {
            // Detect theme from data attribute
            this.currentTheme = document.body.dataset.theme;
            if (!this.currentTheme) {
                this.log('No data-theme attribute found, enhancement skipped');
                return;
            }

            this.log(`Enhancing theme page: ${this.currentTheme}`);

            // Load articles index
            const response = await fetch('../public/data/articles-index.json');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Unable to load articles index`);
            }

            const allArticles = await response.json();
            this.articles = allArticles.filter(a => a.theme === this.currentTheme);

            this.log(`Loaded ${this.articles.length} articles for theme ${this.currentTheme}`);

            // Enhance the page
            this.enhancePage();

            console.log(`[THEME-HUB] ✅ Enhanced ${this.currentTheme} page with ${this.articles.length} articles`);
        } catch (error) {
            console.error('[THEME-HUB] Failed to enhance theme page:', error);
            // Fail silently, fallback to HTML list
        }
    }

    /**
     * Enhance the page with controls and card view
     */
    enhancePage() {
        const articlesList = document.querySelector('.articles-list');
        if (!articlesList) {
            this.log('articles-list container not found');
            return;
        }

        const originalList = document.getElementById('articles-menu');
        if (!originalList) {
            this.log('articles-menu list not found');
            return;
        }

        // Hide original list but keep for fallback
        originalList.style.display = 'none';
        originalList.setAttribute('data-original-list', 'true');

        // Get top tags for this theme
        const topTags = this.ui.getTopTags(this.articles, 15);

        // Create controls
        const controlsHTML = this.ui.createControlsHTML({
            showSearchToggle: true,
            showThemeFilter: false,
            tags: topTags,
            controlsId: 'theme-article-controls'
        });

        // Create containers
        const enhancementHTML = `
            <div class="theme-enhancement">
                <div class="theme-header">
                    <span class="article-count" id="theme-article-count">${this.articles.length} articles</span>
                </div>
                ${controlsHTML}
                <div class="articles-grid" id="theme-articles-grid"></div>
                <div class="load-more-container" id="theme-load-more-container" style="display: none;">
                    <button class="load-more-btn" id="theme-load-more-btn">
                        Afficher plus
                    </button>
                </div>
            </div>
        `;

        // Insert after the h2
        const h2 = articlesList.querySelector('h2');
        if (h2) {
            h2.insertAdjacentHTML('afterend', enhancementHTML);
        } else {
            articlesList.insertAdjacentHTML('beforeend', enhancementHTML);
        }

        // Initialize controls
        this.initControls();

        // Initial render
        this.applyFiltersAndRender();
    }

    /**
     * Initialize controls and event listeners
     */
    initControls() {
        // Sort select
        const sortSelect = document.querySelector('.article-sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.applyFiltersAndRender();
            });
        }

        // Search in content toggle
        const searchToggle = document.querySelector('.search-in-content-toggle');
        if (searchToggle) {
            searchToggle.addEventListener('change', (e) => {
                this.searchInContent = e.target.checked;
                this.applyFiltersAndRender();
            });
        }

        // Tag chips
        document.querySelectorAll('.tag-filter-chips .chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const tag = chip.dataset.tag;
                this.toggleTagFilter(tag, chip);
            });
        });

        // Reset filters button
        const resetBtn = document.querySelector('.reset-filters-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetFilters();
            });
        }

        // Favorite buttons (event delegation)
        document.addEventListener('click', (e) => {
            if (e.target.closest('.favorite-btn-small')) {
                const btn = e.target.closest('.favorite-btn-small');
                const path = btn.dataset.path;
                this.ui.toggleFavorite(path, () => {
                    this.applyFiltersAndRender();
                });
            }
        });

        // Tag chips in cards (event delegation)
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('tag-chip-small')) {
                const tag = e.target.dataset.tag;
                const chip = document.querySelector(`.tag-filter-chips .chip[data-tag="${tag}"]`);
                this.toggleTagFilter(tag, chip);
            }
        });

        // Listen to global search (from navbar)
        const globalSearchInput = document.getElementById('global-search-input');
        if (globalSearchInput) {
            let debounceTimer;
            globalSearchInput.addEventListener('input', (e) => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    this.activeFilters.query = e.target.value;
                    this.applyFiltersAndRender();
                }, 300);
            });
        }
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
        document.querySelectorAll(`[data-tag="${tag}"]`).forEach(chip => {
            if (index > -1) {
                chip.classList.remove('active');
            } else {
                chip.classList.add('active');
            }
        });

        this.applyFiltersAndRender();
    }

    /**
     * Reset all filters
     */
    resetFilters() {
        this.activeFilters = { tags: [], query: '' };
        this.currentSort = 'relevance';
        this.currentPage = 1;

        // Reset UI
        document.querySelectorAll('.chip.active').forEach(chip => {
            chip.classList.remove('active');
        });

        const sortSelect = document.querySelector('.article-sort-select');
        if (sortSelect) sortSelect.value = 'relevance';

        const globalSearchInput = document.getElementById('global-search-input');
        if (globalSearchInput) globalSearchInput.value = '';

        this.applyFiltersAndRender();

        if (window.powerUX) {
            window.powerUX.showToast('Filtres réinitialisés', 'info', 2000);
        }
    }

    /**
     * Apply filters and render
     */
    applyFiltersAndRender() {
        let filtered = [...this.articles];

        // Apply query filter
        if (this.activeFilters.query) {
            filtered = this.ui.filterByQuery(filtered, this.activeFilters.query, this.searchInContent);
        }

        // Apply tag filter
        if (this.activeFilters.tags.length > 0) {
            filtered = this.ui.filterByTags(filtered, this.activeFilters.tags);
        }

        // Sort
        filtered = this.ui.sortArticles(filtered, this.currentSort);

        this.filteredArticles = filtered;
        this.currentPage = 1;

        // Update count
        const countEl = document.getElementById('theme-article-count');
        if (countEl) {
            if (filtered.length === this.articles.length) {
                countEl.textContent = `${this.articles.length} articles`;
            } else {
                countEl.textContent = `${filtered.length} / ${this.articles.length} articles`;
            }
        }

        // Render
        this.renderPage();
    }

    /**
     * Render current page
     */
    renderPage() {
        const grid = document.getElementById('theme-articles-grid');
        const loadMoreContainer = document.getElementById('theme-load-more-container');
        const loadMoreBtn = document.getElementById('theme-load-more-btn');

        if (!grid) return;

        // Handle empty state
        if (this.filteredArticles.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <p class="empty-state-icon">🔍</p>
                    <p class="empty-state-title">Aucun article trouvé</p>
                    <p class="empty-state-text">Essayez de modifier vos filtres ou votre recherche.</p>
                    <button class="btn-primary reset-empty-filters-btn">Réinitialiser les filtres</button>
                </div>
            `;

            // Add reset handler for empty state button
            const resetEmptyBtn = grid.querySelector('.reset-empty-filters-btn');
            if (resetEmptyBtn) {
                resetEmptyBtn.addEventListener('click', () => this.resetFilters());
            }

            loadMoreContainer.style.display = 'none';
            return;
        }

        // Render articles
        const paginationInfo = this.ui.renderPaginatedArticles(
            this.filteredArticles,
            this.currentPage,
            grid,
            {
                query: this.activeFilters.query,
                showTheme: false,
                compact: false
            }
        );

        // Handle load more button
        if (paginationInfo.hasMore) {
            loadMoreContainer.style.display = 'block';
            loadMoreBtn.textContent = `Afficher plus (${Math.min(this.resultsPerPage, paginationInfo.remaining)} articles restants)`;

            // Remove old listener and add new one
            const newBtn = loadMoreBtn.cloneNode(true);
            loadMoreBtn.parentNode.replaceChild(newBtn, loadMoreBtn);

            newBtn.addEventListener('click', () => {
                this.currentPage++;
                this.renderPage();

                // Smooth scroll to new content
                setTimeout(() => {
                    const cards = grid.querySelectorAll('.article-card');
                    if (cards[paginationInfo.displayedCount]) {
                        cards[paginationInfo.displayedCount].scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, 100);
            });
        } else {
            loadMoreContainer.style.display = 'none';
        }
    }
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if ArticleListUI is available
    if (typeof ArticleListUI === 'undefined') {
        console.error('[THEME-HUB] ArticleListUI not loaded');
        return;
    }

    const themeHub = new ThemeHub();
    themeHub.init();
});
