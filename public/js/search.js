/**
 * Enhanced Article Search Module
 *
 * Features:
 * - Advanced search with filters (theme, category, level)
 * - Multiple sort options (relevance, A-Z, recent)
 * - Keyboard navigation (arrows, Enter, ESC)
 * - Search term highlighting
 * - Favorites system (localStorage)
 * - Recent articles history (localStorage)
 * - Related articles suggestions
 * - Dark mode toggle
 */

class ArticleSearch {
    constructor() {
        this.articles = [];
        this.currentTheme = null;
        this.searchInput = null;
        this.searchScope = 'global';
        this.initialized = false;
        this.debounceTimer = null;
        this.debugMode = new URLSearchParams(window.location.search).has('debug');

        // Filters & Sort
        this.activeFilters = {
            themes: [],
            categories: [],
            levels: []
        };
        this.currentSort = 'relevance';
        this.selectedResultIndex = -1;

        // LocalStorage keys
        this.FAVORITES_KEY = 'parcours_low_code_favorites';
        this.RECENT_KEY = 'parcours_low_code_recent';
        this.THEME_KEY = 'parcours_low_code_theme';
    }

    log(...args) {
        if (this.debugMode) {
            console.log('[SEARCH]', ...args);
        }
    }

    error(...args) {
        console.error('[SEARCH]', ...args);
    }

    /**
     * Initialize the search module
     */
    async init() {
        if (this.initialized) return;

        try {
            this.log('Initializing enhanced search...');

            // Load articles index
            const response = await fetch('../public/data/articles-index.json');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Unable to load articles index`);
            }
            this.articles = await response.json();
            this.log(`Loaded ${this.articles.length} articles`);

            // Detect current theme
            this.detectCurrentTheme();

            // Initialize DOM
            this.initDOM();

            // Initialize theme toggle
            this.initThemeToggle();

            // Initialize favorites & recent
            this.initFavorites();
            this.initRecent();

            // Initialize keyboard navigation
            this.initKeyboardNav();

            // Initialize related articles if on an article page
            this.initRelatedArticles();

            this.initialized = true;
            this.log('Search initialized successfully');
            console.log(`[SEARCH] ✅ Ready: ${this.articles.length} articles indexed`);
        } catch (error) {
            this.error('Failed to initialize search:', error);
            this.showSearchError();
        }
    }

    /**
     * Detect current theme from URL
     */
    detectCurrentTheme() {
        const currentPage = window.location.pathname;
        const themeMap = {
            'weweb.html': 'weweb',
            'xano.html': 'xano',
            'api.html': 'api',
            'bonnes-pratiques.html': 'bonnes-pratiques',
            'notes-diverses.html': 'notes-diverses',
            'retrospectives.html': 'retrospectives'
        };

        for (const [page, theme] of Object.entries(themeMap)) {
            if (currentPage.includes(page)) {
                this.currentTheme = theme;
                break;
            }
        }

        this.log(`Current theme: ${this.currentTheme || 'none (homepage)'}`);
    }

    /**
     * Initialize DOM elements and event listeners
     */
    initDOM() {
        this.searchInput = document.getElementById('global-search-input');
        const searchScopeToggle = document.getElementById('search-scope-toggle');

        if (!this.searchInput) {
            console.warn('⚠️ Search input not found');
            return;
        }

        // Search input with debounce
        this.searchInput.addEventListener('input', (e) => {
            this.debouncedSearch(e.target.value);
        });

        // Scope toggle (global vs theme)
        if (searchScopeToggle && this.currentTheme) {
            searchScopeToggle.addEventListener('change', (e) => {
                this.searchScope = e.target.checked ? 'theme' : 'global';
                this.performSearch(this.searchInput.value);
            });
        }

        // Initialize filter/sort controls if on index page
        this.initFilterControls();
    }

    /**
     * Initialize filter and sort controls
     */
    initFilterControls() {
        // Only on index page
        if (!window.location.pathname.includes('index.html') &&
            !window.location.pathname.endsWith('/')) {
            return;
        }

        const container = document.querySelector('.main-content .container');
        if (!container) return;

        // Create controls container
        const controlsHTML = `
            <div class="search-controls" id="search-controls" style="display: none;">
                <div class="search-filters">
                    <div class="filter-group">
                        <label>Thèmes</label>
                        <div class="filter-chips" id="theme-filters"></div>
                    </div>
                    <div class="filter-group">
                        <label>Niveaux</label>
                        <div class="filter-chips" id="level-filters"></div>
                    </div>
                </div>
                <div class="sort-controls">
                    <label for="sort-select">Trier par :</label>
                    <select id="sort-select" class="sort-select">
                        <option value="relevance">Pertinence</option>
                        <option value="title">Titre (A → Z)</option>
                        <option value="date">Plus récents</option>
                    </select>
                </div>
            </div>
        `;

        const searchResults = document.getElementById('search-results-container');
        if (searchResults) {
            searchResults.insertAdjacentHTML('beforebegin', controlsHTML);
        } else {
            container.insertAdjacentHTML('afterbegin', controlsHTML);
        }

        // Populate filters
        this.populateFilters();

        // Sort change
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.performSearch(this.searchInput.value);
            });
        }
    }

    /**
     * Populate filter chips
     */
    populateFilters() {
        const themes = [...new Set(this.articles.map(a => a.theme))].sort();
        const levels = [...new Set(this.articles.map(a => a.level).filter(l => l))].sort();

        // Theme filters
        const themeContainer = document.getElementById('theme-filters');
        if (themeContainer) {
            themes.forEach(theme => {
                const chip = document.createElement('div');
                chip.className = 'chip';
                chip.textContent = theme;
                chip.dataset.theme = theme;
                chip.addEventListener('click', () => this.toggleFilter('themes', theme, chip));
                themeContainer.appendChild(chip);
            });
        }

        // Level filters
        const levelContainer = document.getElementById('level-filters');
        if (levelContainer) {
            levels.forEach(level => {
                const chip = document.createElement('div');
                chip.className = 'chip';
                chip.textContent = level;
                chip.dataset.level = level;
                chip.addEventListener('click', () => this.toggleFilter('levels', level, chip));
                levelContainer.appendChild(chip);
            });
        }
    }

    /**
     * Toggle filter chip
     */
    toggleFilter(type, value, chipElement) {
        const index = this.activeFilters[type].indexOf(value);
        if (index > -1) {
            this.activeFilters[type].splice(index, 1);
            chipElement.classList.remove('active');
        } else {
            this.activeFilters[type].push(value);
            chipElement.classList.add('active');
        }

        this.performSearch(this.searchInput.value);
    }

    /**
     * Debounced search
     */
    debouncedSearch(query) {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        this.debounceTimer = setTimeout(() => {
            this.performSearch(query);
        }, 200);
    }

    /**
     * Perform search with filters and sorting
     */
    performSearch(query) {
        this.log(`Searching for: "${query}"`);

        if (!query || query.trim().length < 2) {
            this.resetSearch();
            return;
        }

        // Show controls on index page
        const controls = document.getElementById('search-controls');
        if (controls) {
            controls.style.display = 'block';
        }

        const normalizedQuery = this.normalizeString(query);
        let results = this.articles.filter(article =>
            this.matchesQuery(article, normalizedQuery) &&
            this.matchesFilters(article)
        );

        // Filter by scope
        if (this.searchScope === 'theme' && this.currentTheme) {
            results = results.filter(article => article.theme === this.currentTheme);
        }

        // Sort results
        results = this.sortResults(results, query);

        this.log(`Found ${results.length} results`);
        this.displayResults(results, query);
    }

    /**
     * Check if article matches query
     */
    matchesQuery(article, normalizedQuery) {
        // Title
        if (this.normalizeString(article.title).includes(normalizedQuery)) {
            return true;
        }

        // Category
        if (article.category && this.normalizeString(article.category).includes(normalizedQuery)) {
            return true;
        }

        // Level
        if (article.level && this.normalizeString(article.level).includes(normalizedQuery)) {
            return true;
        }

        // Keywords
        if (article.keywords && article.keywords.length > 0) {
            return article.keywords.some(keyword =>
                this.normalizeString(keyword).includes(normalizedQuery)
            );
        }

        // Excerpt
        if (article.excerpt && this.normalizeString(article.excerpt).includes(normalizedQuery)) {
            return true;
        }

        return false;
    }

    /**
     * Check if article matches active filters
     */
    matchesFilters(article) {
        // Theme filter
        if (this.activeFilters.themes.length > 0 &&
            !this.activeFilters.themes.includes(article.theme)) {
            return false;
        }

        // Level filter
        if (this.activeFilters.levels.length > 0 &&
            !this.activeFilters.levels.includes(article.level)) {
            return false;
        }

        return true;
    }

    /**
     * Sort results
     */
    sortResults(results, query) {
        const normalizedQuery = this.normalizeString(query);

        switch (this.currentSort) {
            case 'title':
                return results.sort((a, b) => a.title.localeCompare(b.title));

            case 'date':
                return results.sort((a, b) => {
                    // Parse DD/MM/YYYY format
                    const parseDate = (dateStr) => {
                        if (!dateStr) return new Date(0);
                        const [day, month, year] = dateStr.split('/');
                        return new Date(year, month - 1, day);
                    };
                    return parseDate(b.date) - parseDate(a.date);
                });

            case 'relevance':
            default:
                // Score by relevance
                return results.sort((a, b) => {
                    const scoreA = this.calculateRelevance(a, normalizedQuery);
                    const scoreB = this.calculateRelevance(b, normalizedQuery);
                    return scoreB - scoreA;
                });
        }
    }

    /**
     * Calculate relevance score
     */
    calculateRelevance(article, query) {
        let score = 0;

        // Title match (highest weight)
        if (this.normalizeString(article.title).includes(query)) {
            score += 10;
            if (this.normalizeString(article.title).startsWith(query)) {
                score += 5;
            }
        }

        // Keywords match
        if (article.keywords) {
            article.keywords.forEach(keyword => {
                if (this.normalizeString(keyword).includes(query)) {
                    score += 3;
                }
            });
        }

        // Category/Level match
        if (article.category && this.normalizeString(article.category).includes(query)) {
            score += 2;
        }
        if (article.level && this.normalizeString(article.level).includes(query)) {
            score += 1;
        }

        return score;
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
     * Display search results
     */
    displayResults(results, query) {
        const articlesList = document.getElementById('articles-menu');

        if (!articlesList) {
            this.displayResultsOnIndex(results, query);
            return;
        }

        // On theme page: filter list
        const allLinks = articlesList.querySelectorAll('li');
        let visibleCount = 0;

        allLinks.forEach(li => {
            const link = li.querySelector('a');
            const articlePath = link.getAttribute('data-article');

            const found = results.some(result =>
                articlePath.includes(result.path.replace('../', ''))
            );

            if (found) {
                li.style.display = 'block';
                this.highlightText(link, query);
                visibleCount++;
            } else {
                li.style.display = 'none';
            }
        });

        this.showResultsCounter(visibleCount, articlesList.parentElement);
        this.showNoResultsMessage(results.length, articlesList.parentElement);
    }

    /**
     * Display results on index page
     */
    displayResultsOnIndex(results, query) {
        let resultsContainer = document.getElementById('search-results-container');

        if (!resultsContainer) {
            const mainContent = document.querySelector('.main-content .container');
            resultsContainer = document.createElement('div');
            resultsContainer.id = 'search-results-container';
            resultsContainer.className = 'search-results';
            resultsContainer.setAttribute('aria-live', 'polite');
            resultsContainer.setAttribute('aria-atomic', 'true');

            const controls = document.getElementById('search-controls');
            if (controls) {
                controls.insertAdjacentElement('afterend', resultsContainer);
            } else {
                mainContent.insertBefore(resultsContainer, mainContent.firstChild);
            }
        }

        if (results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <p>Aucun article trouvé pour "${query}"</p>
                </div>
            `;
            return;
        }

        resultsContainer.innerHTML = `
            <div class="results-header">
                <h2>Résultats de recherche : "${this.highlightHTML(query, query)}"</h2>
                <p>${results.length} article(s) trouvé(s)</p>
            </div>
            <div class="results-grid" id="results-grid">
                ${results.map((article, index) => this.createResultCard(article, query, index)).join('')}
            </div>
        `;

        // Reset selected index
        this.selectedResultIndex = -1;
    }

    /**
     * Create result card with highlighting
     */
    createResultCard(article, query, index) {
        const themeLabel = article.theme.charAt(0).toUpperCase() + article.theme.slice(1);
        const levelBadge = article.level ?
            `<span class="badge level-${article.level.toLowerCase()}">${article.level}</span>` : '';
        const categoryBadge = article.category ?
            `<span class="badge category">${article.category}</span>` : '';

        const highlightedTitle = this.highlightHTML(article.title, query);
        const favoriteIcon = this.isFavorite(article.path) ? '⭐' : '☆';

        return `
            <div class="result-card" data-index="${index}" tabindex="0">
                <div class="result-header">
                    <h3>${highlightedTitle}</h3>
                    <button class="favorite-btn ${this.isFavorite(article.path) ? 'active' : ''}"
                            data-path="${article.path}"
                            aria-label="Ajouter aux favoris"
                            title="Ajouter aux favoris">
                        ${favoriteIcon}
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
                ${article.keywords.length > 0 ? `
                    <div class="result-keywords">
                        🔍 ${article.keywords.slice(0, 5).map(k => this.highlightHTML(k, query)).join(', ')}
                    </div>
                ` : ''}
                <a href="themes/${article.theme}.html?article=${encodeURIComponent(article.path)}"
                   class="result-link">
                    Lire l'article →
                </a>
            </div>
        `;
    }

    /**
     * Highlight search terms in HTML
     */
    highlightHTML(text, query) {
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
     * Highlight text in element (for theme pages)
     */
    highlightText(element, query) {
        if (!query || query.trim().length < 2) return;

        const originalText = element.textContent;
        element.innerHTML = this.highlightHTML(originalText, query);
    }

    /**
     * Show results counter
     */
    showResultsCounter(count, container) {
        let counterDiv = container.querySelector('.search-results-counter');

        if (count > 0) {
            if (!counterDiv) {
                counterDiv = document.createElement('div');
                counterDiv.className = 'search-results-counter';
                counterDiv.setAttribute('aria-live', 'polite');
                container.insertBefore(counterDiv, container.firstChild);
            }
            counterDiv.innerHTML = `<p>📊 ${count} article${count > 1 ? 's' : ''} trouvé${count > 1 ? 's' : ''}</p>`;
            counterDiv.style.display = 'block';
        } else if (counterDiv) {
            counterDiv.style.display = 'none';
        }
    }

    /**
     * Show no results message
     */
    showNoResultsMessage(count, container) {
        let noResultsDiv = container.querySelector('.no-results-message');

        if (count === 0) {
            if (!noResultsDiv) {
                noResultsDiv = document.createElement('div');
                noResultsDiv.className = 'no-results-message';
                noResultsDiv.setAttribute('aria-live', 'assertive');
                noResultsDiv.innerHTML = '<p>❌ Aucun article ne correspond à votre recherche.</p>';
                container.insertBefore(noResultsDiv, container.firstChild);
            }
            noResultsDiv.style.display = 'block';
        } else if (noResultsDiv) {
            noResultsDiv.style.display = 'none';
        }
    }

    /**
     * Reset search
     */
    resetSearch() {
        this.log('Resetting search');

        // Hide controls
        const controls = document.getElementById('search-controls');
        if (controls) {
            controls.style.display = 'none';
        }

        // Reset filters
        this.activeFilters = { themes: [], categories: [], levels: [] };
        document.querySelectorAll('.chip.active').forEach(chip => {
            chip.classList.remove('active');
        });

        const articlesList = document.getElementById('articles-menu');
        if (articlesList) {
            const allLinks = articlesList.querySelectorAll('li');
            allLinks.forEach(li => {
                li.style.display = 'block';
                const link = li.querySelector('a');
                if (link) {
                    link.textContent = link.textContent; // Remove highlights
                }
            });

            const container = articlesList.parentElement;
            const counterDiv = container.querySelector('.search-results-counter');
            const noResultsDiv = container.querySelector('.no-results-message');

            if (counterDiv) counterDiv.remove();
            if (noResultsDiv) noResultsDiv.remove();
        }

        const resultsContainer = document.getElementById('search-results-container');
        if (resultsContainer) {
            resultsContainer.innerHTML = '';
        }
    }

    showSearchError() {
        if (this.searchInput) {
            this.searchInput.disabled = true;
            this.searchInput.placeholder = 'Recherche indisponible';
            this.searchInput.title = 'Impossible de charger l\'index de recherche';
        }
    }

    /**
     * ======================
     * DARK MODE
     * ======================
     */
    initThemeToggle() {
        // Create toggle button
        const navbarSearch = document.querySelector('.navbar-search');
        if (!navbarSearch) return;

        const toggle = document.createElement('div');
        toggle.className = 'theme-toggle';
        toggle.setAttribute('role', 'button');
        toggle.setAttribute('aria-label', 'Toggle dark mode');
        toggle.setAttribute('tabindex', '0');
        navbarSearch.appendChild(toggle);

        // Load saved theme
        const savedTheme = localStorage.getItem(this.THEME_KEY) ||
                          (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        this.setTheme(savedTheme);

        // Toggle on click
        toggle.addEventListener('click', () => this.toggleTheme());
        toggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggleTheme();
            }
        });
    }

    toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const newTheme = current === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(this.THEME_KEY, theme);
        this.log(`Theme set to: ${theme}`);
    }

    /**
     * ======================
     * FAVORITES
     * ======================
     */
    initFavorites() {
        // Add favorite buttons to search results (delegated event)
        document.addEventListener('click', (e) => {
            if (e.target.closest('.favorite-btn')) {
                e.preventDefault();
                const btn = e.target.closest('.favorite-btn');
                const path = btn.dataset.path;
                this.toggleFavorite(path, btn);
            }
        });

        // Display favorites on homepage
        this.displayFavorites();
    }

    getFavorites() {
        const favorites = localStorage.getItem(this.FAVORITES_KEY);
        return favorites ? JSON.parse(favorites) : [];
    }

    saveFavorites(favorites) {
        localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(favorites));
    }

    isFavorite(path) {
        return this.getFavorites().includes(path);
    }

    toggleFavorite(path, btnElement) {
        let favorites = this.getFavorites();
        const index = favorites.indexOf(path);

        if (index > -1) {
            favorites.splice(index, 1);
            if (btnElement) {
                btnElement.classList.remove('active');
                btnElement.textContent = '☆';
            }
        } else {
            favorites.push(path);
            if (btnElement) {
                btnElement.classList.add('active');
                btnElement.textContent = '⭐';
            }
        }

        this.saveFavorites(favorites);
        this.displayFavorites();
        this.log(`Favorite toggled: ${path}`);
    }

    displayFavorites() {
        // Only on homepage
        if (!window.location.pathname.includes('index.html') &&
            !window.location.pathname.endsWith('/')) {
            return;
        }

        const favorites = this.getFavorites();
        if (favorites.length === 0) return;

        const container = document.querySelector('.main-content .container');
        if (!container) return;

        let favSection = document.getElementById('favorites-section');
        if (!favSection) {
            favSection = document.createElement('div');
            favSection.id = 'favorites-section';
            favSection.className = 'favorites-section';
            container.insertBefore(favSection, container.firstChild);
        }

        const favoriteArticles = this.articles.filter(a => favorites.includes(a.path));

        favSection.innerHTML = `
            <div class="section-header">
                <h2>⭐ Mes Favoris</h2>
            </div>
            ${favoriteArticles.length > 0 ? `
                <div class="results-grid">
                    ${favoriteArticles.map(article => this.createResultCard(article, '', -1)).join('')}
                </div>
            ` : `
                <div class="empty-state">
                    <p>Aucun favori pour le moment. Cliquez sur ⭐ pour ajouter des articles.</p>
                </div>
            `}
        `;
    }

    /**
     * ======================
     * RECENT ARTICLES
     * ======================
     */
    initRecent() {
        // Track article views (on theme pages)
        if (this.currentTheme) {
            this.trackArticleView();
        }

        // Display recent on homepage
        this.displayRecent();
    }

    getRecent() {
        const recent = localStorage.getItem(this.RECENT_KEY);
        return recent ? JSON.parse(recent) : [];
    }

    saveRecent(recent) {
        localStorage.setItem(this.RECENT_KEY, JSON.stringify(recent));
    }

    addToRecent(path, title) {
        let recent = this.getRecent();

        // Remove if already exists
        recent = recent.filter(item => item.path !== path);

        // Add to beginning
        recent.unshift({ path, title, timestamp: Date.now() });

        // Keep only last 10
        recent = recent.slice(0, 10);

        this.saveRecent(recent);
        this.log(`Added to recent: ${title}`);
    }

    trackArticleView() {
        // Listen for article loads
        const articleDisplay = document.getElementById('article-display');
        if (!articleDisplay) return;

        const observer = new MutationObserver(() => {
            const h1 = articleDisplay.querySelector('h1');
            if (h1) {
                const title = h1.textContent;
                const activeLink = document.querySelector('#articles-menu a.active');
                if (activeLink) {
                    const path = activeLink.getAttribute('data-article');
                    this.addToRecent(path, title);
                }
            }
        });

        observer.observe(articleDisplay, { childList: true, subtree: true });
    }

    displayRecent() {
        // Only on homepage
        if (!window.location.pathname.includes('index.html') &&
            !window.location.pathname.endsWith('/')) {
            return;
        }

        const recent = this.getRecent();
        if (recent.length === 0) return;

        const container = document.querySelector('.main-content .container');
        if (!container) return;

        let recentSection = document.getElementById('recent-section');
        if (!recentSection) {
            recentSection = document.createElement('div');
            recentSection.id = 'recent-section';
            recentSection.className = 'recent-section';

            const favSection = document.getElementById('favorites-section');
            if (favSection) {
                favSection.insertAdjacentElement('afterend', recentSection);
            } else {
                container.insertBefore(recentSection, container.firstChild);
            }
        }

        const recentArticles = recent
            .map(item => this.articles.find(a => a.path === item.path))
            .filter(Boolean);

        recentSection.innerHTML = `
            <div class="section-header">
                <h2>🕒 Récemment consultés</h2>
            </div>
            <div class="results-grid">
                ${recentArticles.slice(0, 6).map(article => this.createResultCard(article, '', -1)).join('')}
            </div>
        `;
    }

    /**
     * ======================
     * KEYBOARD NAVIGATION
     * ======================
     */
    initKeyboardNav() {
        document.addEventListener('keydown', (e) => {
            const resultsGrid = document.getElementById('results-grid');
            if (!resultsGrid) return;

            const cards = Array.from(resultsGrid.querySelectorAll('.result-card'));
            if (cards.length === 0) return;

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    this.selectedResultIndex = Math.min(this.selectedResultIndex + 1, cards.length - 1);
                    this.highlightSelectedResult(cards);
                    break;

                case 'ArrowUp':
                    e.preventDefault();
                    this.selectedResultIndex = Math.max(this.selectedResultIndex - 1, 0);
                    this.highlightSelectedResult(cards);
                    break;

                case 'Enter':
                    if (this.selectedResultIndex >= 0) {
                        e.preventDefault();
                        const link = cards[this.selectedResultIndex].querySelector('.result-link');
                        if (link) link.click();
                    }
                    break;

                case 'Escape':
                    if (this.searchInput && this.searchInput.value) {
                        e.preventDefault();
                        this.searchInput.value = '';
                        this.resetSearch();
                        this.searchInput.focus();
                    }
                    break;
            }
        });

        // Show keyboard hints
        this.showKeyboardHints();
    }

    highlightSelectedResult(cards) {
        cards.forEach((card, index) => {
            if (index === this.selectedResultIndex) {
                card.style.outline = '2px solid var(--primary-color)';
                card.style.outlineOffset = '2px';
                card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } else {
                card.style.outline = 'none';
            }
        });
    }

    showKeyboardHints() {
        // Only on desktop
        if (window.innerWidth < 768) return;

        const hint = document.createElement('div');
        hint.className = 'keyboard-hint';
        hint.innerHTML = `
            <kbd>↑</kbd> <kbd>↓</kbd> Naviguer
            <kbd>Enter</kbd> Ouvrir
            <kbd>ESC</kbd> Effacer
        `;
        document.body.appendChild(hint);

        // Show on first search
        this.searchInput.addEventListener('input', () => {
            setTimeout(() => {
                hint.classList.add('visible');
                setTimeout(() => hint.classList.remove('visible'), 3000);
            }, 500);
        }, { once: true });
    }

    /**
     * ======================
     * RELATED ARTICLES
     * ======================
     */
    initRelatedArticles() {
        // Only on theme pages
        if (!this.currentTheme) return;

        const articleDisplay = document.getElementById('article-display');
        if (!articleDisplay) return;

        // Watch for article loads
        const observer = new MutationObserver(() => {
            const h1 = articleDisplay.querySelector('h1');
            if (h1 && !document.getElementById('related-articles')) {
                const activeLink = document.querySelector('#articles-menu a.active');
                if (activeLink) {
                    const path = activeLink.getAttribute('data-article');
                    this.displayRelatedArticles(path);
                }
            }
        });

        observer.observe(articleDisplay, { childList: true, subtree: true });
    }

    displayRelatedArticles(currentPath) {
        const currentArticle = this.articles.find(a => currentPath.includes(a.path.replace('../', '')));
        if (!currentArticle) return;

        // Find related articles (same theme)
        const related = this.articles
            .filter(a => a.theme === currentArticle.theme && a.path !== currentArticle.path)
            .slice(0, 3);

        if (related.length === 0) return;

        const articleDisplay = document.getElementById('article-display');
        if (!articleDisplay) return;

        const relatedHTML = `
            <div class="related-articles" id="related-articles">
                <h2>📚 Articles liés</h2>
                <div class="related-grid">
                    ${related.map(article => `
                        <a href="#" class="related-card" data-article="${article.path}">
                            <h3>${article.title}</h3>
                            ${article.excerpt ? `<p>${article.excerpt.substring(0, 100)}...</p>` : ''}
                        </a>
                    `).join('')}
                </div>
            </div>
        `;

        articleDisplay.insertAdjacentHTML('beforeend', relatedHTML);

        // Handle related article clicks
        document.querySelectorAll('.related-card').forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                const articlePath = card.getAttribute('data-article');

                // Update active link
                document.querySelectorAll('#articles-menu a').forEach(link => {
                    if (link.getAttribute('data-article') === articlePath) {
                        link.click();
                    }
                });
            });
        });
    }
}

// Global instance
const articleSearch = new ArticleSearch();

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    articleSearch.init();
});
