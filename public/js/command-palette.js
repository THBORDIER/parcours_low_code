/**
 * Command Palette
 *
 * Global command palette with Ctrl/⌘+K shortcut
 * - Quick navigation to pages/articles
 * - Actions (toggle dark mode, clear history, etc.)
 * - Keyboard-first UX with accessibility
 */

class CommandPalette {
    constructor() {
        this.isOpen = false;
        this.articles = [];
        this.articlesLoaded = false;
        this.selectedIndex = 0;
        this.currentResults = [];
        this.previousFocus = null;
        this.debugMode = new URLSearchParams(window.location.search).has('debug');

        // Command categories
        this.actions = [
            {
                id: 'toggle-dark-mode',
                title: 'Toggle Dark Mode',
                icon: '🌓',
                category: 'action',
                keywords: ['dark', 'mode', 'theme', 'light'],
                action: () => this.toggleDarkMode()
            },
            {
                id: 'clear-history',
                title: 'Clear Recent History',
                icon: '🗑️',
                category: 'action',
                keywords: ['clear', 'history', 'recent', 'delete'],
                action: () => this.clearHistory()
            },
            {
                id: 'copy-link',
                title: 'Copy Current Page Link',
                icon: '🔗',
                category: 'action',
                keywords: ['copy', 'link', 'url', 'share'],
                action: () => this.copyLink()
            },
            {
                id: 'export-favorites',
                title: 'Export Favorites',
                icon: '📥',
                category: 'action',
                keywords: ['export', 'favorites', 'backup', 'save'],
                action: () => this.exportFavorites()
            }
        ];

        this.pages = [
            {
                id: 'home',
                title: 'Home',
                icon: '🏠',
                category: 'page',
                url: '/index.html',
                keywords: ['home', 'accueil', 'index']
            },
            {
                id: 'favorites',
                title: 'Favoris',
                icon: '⭐',
                category: 'page',
                url: '/favorites.html',
                keywords: ['favorites', 'favoris', 'starred']
            },
            {
                id: 'recent',
                title: 'Récents',
                icon: '🕒',
                category: 'page',
                url: '/recent.html',
                keywords: ['recent', 'récents', 'history', 'last']
            },
            {
                id: 'weweb',
                title: 'WeWeb',
                icon: '🎨',
                category: 'page',
                url: '/themes/weweb.html',
                keywords: ['weweb', 'frontend', 'ui']
            },
            {
                id: 'xano',
                title: 'Xano',
                icon: '⚙️',
                category: 'page',
                url: '/themes/xano.html',
                keywords: ['xano', 'backend', 'database']
            },
            {
                id: 'api',
                title: 'API & Backend',
                icon: '🔌',
                category: 'page',
                url: '/themes/api.html',
                keywords: ['api', 'backend', 'rest']
            },
            {
                id: 'bonnes-pratiques',
                title: 'Bonnes pratiques',
                icon: '✅',
                category: 'page',
                url: '/themes/bonnes-pratiques.html',
                keywords: ['bonnes', 'pratiques', 'best', 'practices']
            },
            {
                id: 'notes-diverses',
                title: 'Notes diverses',
                icon: '📝',
                category: 'page',
                url: '/themes/notes-diverses.html',
                keywords: ['notes', 'diverses', 'misc']
            },
            {
                id: 'retrospectives',
                title: 'Rétrospectives',
                icon: '📖',
                category: 'page',
                url: '/themes/retrospectives.html',
                keywords: ['rétrospectives', 'retrospectives', 'retro', 'projects']
            }
        ];
    }

    log(...args) {
        if (this.debugMode) {
            console.log('[CMD]', ...args);
        }
    }

    /**
     * Initialize command palette
     */
    async init() {
        this.log('Initializing command palette');

        // Create UI
        this.createUI();

        // Setup keyboard listener
        this.setupKeyboardListener();

        console.log('[CMD] ✅ Command palette ready (Ctrl/⌘+K)');
    }

    /**
     * Create UI elements
     */
    createUI() {
        const paletteHTML = `
            <div class="command-palette-overlay" id="cmd-palette-overlay" style="display: none;">
                <div class="command-palette-dialog" role="dialog" aria-modal="true" aria-labelledby="cmd-palette-title">
                    <div class="command-palette-header">
                        <span id="cmd-palette-title" class="sr-only">Command Palette</span>
                        <input
                            type="text"
                            id="cmd-palette-input"
                            class="command-palette-input"
                            placeholder="Rechercher une action, page ou article..."
                            aria-label="Search commands"
                            autocomplete="off"
                            spellcheck="false"
                        />
                        <kbd class="command-palette-hint">ESC</kbd>
                    </div>
                    <div class="command-palette-results" id="cmd-palette-results" role="listbox">
                        <!-- Results populated by JS -->
                    </div>
                    <div class="command-palette-footer">
                        <div class="command-palette-shortcuts">
                            <span><kbd>↑↓</kbd> Navigate</span>
                            <span><kbd>↵</kbd> Select</span>
                            <span><kbd>ESC</kbd> Close</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', paletteHTML);

        // Get elements
        this.overlay = document.getElementById('cmd-palette-overlay');
        this.input = document.getElementById('cmd-palette-input');
        this.results = document.getElementById('cmd-palette-results');

        // Setup input listener
        this.input.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        // Setup overlay click to close
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.close();
            }
        });

        // Setup keyboard navigation
        this.input.addEventListener('keydown', (e) => {
            this.handleKeyNavigation(e);
        });

        // Setup navbar button click
        const navbarBtn = document.getElementById('navbar-cmd-btn');
        if (navbarBtn) {
            navbarBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.open();
            });
        }
    }

    /**
     * Setup global keyboard listener
     */
    setupKeyboardListener() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/⌘+K to toggle
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.toggle();
                return;
            }

            // ESC to close
            if (e.key === 'Escape' && this.isOpen) {
                e.preventDefault();
                this.close();
                return;
            }
        });
    }

    /**
     * Toggle palette
     */
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    /**
     * Open palette
     */
    async open() {
        this.log('Opening command palette');

        // Load articles on first open
        if (!this.articlesLoaded) {
            await this.loadArticles();
        }

        // Store previous focus
        this.previousFocus = document.activeElement;

        // Show overlay
        this.overlay.style.display = 'flex';
        this.isOpen = true;

        // Focus input
        setTimeout(() => {
            this.input.focus();
            this.input.select();
        }, 50);

        // Show default results
        this.handleSearch('');

        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    /**
     * Close palette
     */
    close() {
        this.log('Closing command palette');

        this.overlay.style.display = 'none';
        this.isOpen = false;
        this.input.value = '';
        this.selectedIndex = 0;

        // Restore body scroll
        document.body.style.overflow = '';

        // Restore previous focus
        if (this.previousFocus) {
            this.previousFocus.focus();
            this.previousFocus = null;
        }
    }

    /**
     * Load articles from index
     */
    async loadArticles() {
        try {
            const baseUrl = window.location.pathname.includes('/themes/') ? '../public' : 'public';
            const response = await fetch(`${baseUrl}/data/articles-index.json`);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            this.articles = await response.json();
            this.articlesLoaded = true;
            this.log(`Loaded ${this.articles.length} articles`);
        } catch (error) {
            console.error('[CMD] Failed to load articles:', error);
            // Continue with actions and pages only
            this.articles = [];
            this.articlesLoaded = true;
        }
    }

    /**
     * Handle search
     */
    handleSearch(query) {
        const normalizedQuery = this.normalizeString(query);

        if (!query || query.trim().length === 0) {
            // Show default: recent actions and pages
            this.currentResults = [
                ...this.actions.slice(0, 4),
                ...this.pages.slice(0, 6)
            ];
        } else {
            // Search and score all items
            const scoredItems = [
                ...this.scoreItems(this.actions, normalizedQuery),
                ...this.scoreItems(this.pages, normalizedQuery),
                ...this.scoreArticles(normalizedQuery)
            ];

            // Sort by score and take top 12
            this.currentResults = scoredItems
                .sort((a, b) => b.score - a.score)
                .slice(0, 12);
        }

        this.selectedIndex = 0;
        this.renderResults();
    }

    /**
     * Score items (actions/pages)
     */
    scoreItems(items, query) {
        return items.map(item => {
            let score = 0;

            // Title match (highest priority)
            const normalizedTitle = this.normalizeString(item.title);
            if (normalizedTitle.includes(query)) {
                score += 10;
                if (normalizedTitle.startsWith(query)) {
                    score += 5;
                }
            }

            // Keywords match
            if (item.keywords) {
                item.keywords.forEach(keyword => {
                    if (this.normalizeString(keyword).includes(query)) {
                        score += 3;
                    }
                });
            }

            return { ...item, score };
        }).filter(item => item.score > 0);
    }

    /**
     * Score articles
     */
    scoreArticles(query) {
        return this.articles.map(article => {
            let score = 0;

            // Title match
            const normalizedTitle = this.normalizeString(article.title);
            if (normalizedTitle.includes(query)) {
                score += 8;
                if (normalizedTitle.startsWith(query)) {
                    score += 4;
                }
            }

            // Tags match
            if (article.tags) {
                article.tags.forEach(tag => {
                    if (this.normalizeString(tag).includes(query)) {
                        score += 5;
                    }
                });
            }

            // Keywords match
            if (article.keywords) {
                article.keywords.forEach(keyword => {
                    if (this.normalizeString(keyword).includes(query)) {
                        score += 3;
                    }
                });
            }

            // Theme match
            if (this.normalizeString(article.theme).includes(query)) {
                score += 2;
            }

            // Excerpt match (lower priority)
            if (article.excerpt && this.normalizeString(article.excerpt).includes(query)) {
                score += 1;
            }

            return {
                ...article,
                category: 'article',
                icon: '📄',
                score
            };
        }).filter(article => article.score > 0);
    }

    /**
     * Render results
     */
    renderResults() {
        if (this.currentResults.length === 0) {
            this.results.innerHTML = `
                <div class="command-palette-empty">
                    <p>Aucun résultat trouvé</p>
                </div>
            `;
            return;
        }

        this.results.innerHTML = this.currentResults.map((item, index) => {
            const isSelected = index === this.selectedIndex;
            const categoryLabel = this.getCategoryLabel(item.category);
            const subtitle = this.getItemSubtitle(item);

            return `
                <div
                    class="command-palette-item ${isSelected ? 'selected' : ''}"
                    data-index="${index}"
                    role="option"
                    aria-selected="${isSelected}"
                >
                    <span class="command-item-icon">${item.icon}</span>
                    <div class="command-item-content">
                        <div class="command-item-title">${this.escapeHtml(item.title)}</div>
                        ${subtitle ? `<div class="command-item-subtitle">${subtitle}</div>` : ''}
                    </div>
                    <span class="command-item-category">${categoryLabel}</span>
                </div>
            `;
        }).join('');

        // Add click handlers
        this.results.querySelectorAll('.command-palette-item').forEach((el, index) => {
            el.addEventListener('click', () => {
                this.selectedIndex = index;
                this.executeSelected();
            });
        });

        // Scroll selected into view
        this.scrollSelectedIntoView();
    }

    /**
     * Get category label
     */
    getCategoryLabel(category) {
        const labels = {
            action: '⚙️ Action',
            page: '🧭 Page',
            article: '📄 Article'
        };
        return labels[category] || '';
    }

    /**
     * Get item subtitle
     */
    getItemSubtitle(item) {
        if (item.category === 'article') {
            const theme = item.theme.charAt(0).toUpperCase() + item.theme.slice(1);
            const tags = item.tags ? item.tags.slice(0, 2).join(', ') : '';
            return tags ? `${theme} · ${tags}` : theme;
        }
        return '';
    }

    /**
     * Handle keyboard navigation
     */
    handleKeyNavigation(e) {
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.selectedIndex = Math.min(this.selectedIndex + 1, this.currentResults.length - 1);
                this.renderResults();
                break;

            case 'ArrowUp':
                e.preventDefault();
                this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
                this.renderResults();
                break;

            case 'Enter':
                e.preventDefault();
                this.executeSelected();
                break;

            case 'Tab':
                e.preventDefault();
                // Simple focus trap: keep focus in input
                break;
        }
    }

    /**
     * Execute selected item
     */
    executeSelected() {
        const selected = this.currentResults[this.selectedIndex];
        if (!selected) return;

        this.log('Executing:', selected.title);

        if (selected.category === 'action') {
            selected.action();
            this.close();
        } else if (selected.category === 'page') {
            window.location.href = selected.url;
        } else if (selected.category === 'article') {
            const baseUrl = window.location.pathname.includes('/themes/') ? '' : 'themes/';
            window.location.href = `${baseUrl}${selected.theme}.html?article=${encodeURIComponent(selected.path)}`;
        }
    }

    /**
     * Scroll selected item into view
     */
    scrollSelectedIntoView() {
        const selectedEl = this.results.querySelector('.command-palette-item.selected');
        if (selectedEl) {
            selectedEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }

    /**
     * Action: Toggle dark mode
     */
    toggleDarkMode() {
        if (window.powerUX && typeof window.powerUX.toggleTheme === 'function') {
            window.powerUX.toggleTheme();
        } else {
            // Fallback
            const current = document.documentElement.getAttribute('data-theme');
            const newTheme = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('parcours_low_code_theme', newTheme);
        }

        if (window.powerUX) {
            window.powerUX.showToast('Theme switched', 'success', 2000);
        }
    }

    /**
     * Action: Clear history
     */
    clearHistory() {
        if (confirm('Effacer tout l\'historique des articles récents ?')) {
            localStorage.removeItem('parcours_low_code_recent');

            if (window.powerUX) {
                window.powerUX.showToast('Historique effacé', 'success', 2000);
            }

            // Reload if on recent page
            if (window.location.pathname.includes('recent.html')) {
                window.location.reload();
            }
        }
    }

    /**
     * Action: Copy link
     */
    async copyLink() {
        const url = window.location.href;

        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(url);
                if (window.powerUX) {
                    window.powerUX.showToast('Lien copié', 'success', 2000);
                }
            } else {
                // Fallback: create input and select
                this.fallbackCopyLink(url);
            }
        } catch (error) {
            this.fallbackCopyLink(url);
        }
    }

    /**
     * Fallback copy link
     */
    fallbackCopyLink(url) {
        const input = document.createElement('input');
        input.value = url;
        input.style.position = 'fixed';
        input.style.top = '-1000px';
        document.body.appendChild(input);
        input.select();

        try {
            document.execCommand('copy');
            if (window.powerUX) {
                window.powerUX.showToast('Lien copié', 'success', 2000);
            }
        } catch (error) {
            if (window.powerUX) {
                window.powerUX.showToast('Impossible de copier le lien', 'error', 3000);
            }
        } finally {
            document.body.removeChild(input);
        }
    }

    /**
     * Action: Export favorites
     */
    exportFavorites() {
        const favorites = localStorage.getItem('parcours_low_code_favorites');

        if (!favorites || favorites === '[]') {
            if (window.powerUX) {
                window.powerUX.showToast('Aucun favori à exporter', 'info', 2000);
            }
            return;
        }

        const data = {
            exportDate: new Date().toISOString(),
            favorites: JSON.parse(favorites)
        };

        if (window.powerUX && typeof window.powerUX.exportToJSON === 'function') {
            window.powerUX.exportToJSON(data, `favoris-${Date.now()}.json`);
        } else {
            // Fallback
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `favoris-${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
        }

        if (window.powerUX) {
            window.powerUX.showToast('Favoris exportés', 'success', 2000);
        }
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
     * Escape HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    window.commandPalette = new CommandPalette();
    window.commandPalette.init();
});
