/**
 * Navbar Component
 *
 * Single source of truth for the site navbar
 * Automatically injects navbar HTML and manages active states
 */

class Navbar {
    constructor() {
        this.currentPath = window.location.pathname;
        this.debugMode = new URLSearchParams(window.location.search).has('debug');
    }

    log(...args) {
        if (this.debugMode) {
            console.log('[NAVBAR]', ...args);
        }
    }

    /**
     * Initialize navbar
     */
    init() {
        const root = document.getElementById('navbar-root');
        if (!root) {
            console.warn('[NAVBAR] navbar-root element not found');
            return;
        }

        this.log('Initializing navbar');
        this.render(root);
        console.log('[NAVBAR] ✅ Navbar initialized');
    }

    /**
     * Render navbar HTML
     */
    render(root) {
        const basePath = this.getBasePath();
        const isThemePage = this.isThemePage();
        const themeName = this.getThemeName();

        root.innerHTML = `
            <nav class="navbar">
                <div class="navbar-container">
                    <a href="${basePath}index.html" class="navbar-brand" ${this.isActive('index.html') ? 'aria-current="page"' : ''}>
                        Base de Connaissance Low-Code
                    </a>
                    <ul class="navbar-menu">
                        <li><a href="${basePath}themes/weweb.html" ${this.isActive('weweb.html') ? 'aria-current="page"' : ''}>WeWeb</a></li>
                        <li><a href="${basePath}themes/xano.html" ${this.isActive('xano.html') ? 'aria-current="page"' : ''}>Xano</a></li>
                        <li><a href="${basePath}themes/api.html" ${this.isActive('api.html') ? 'aria-current="page"' : ''}>API & Backend</a></li>
                        <li><a href="${basePath}themes/bonnes-pratiques.html" ${this.isActive('bonnes-pratiques.html') ? 'aria-current="page"' : ''}>Bonnes pratiques</a></li>
                        <li><a href="${basePath}themes/notes-diverses.html" ${this.isActive('notes-diverses.html') ? 'aria-current="page"' : ''}>Notes diverses</a></li>
                        <li><a href="${basePath}themes/retrospectives.html" ${this.isActive('retrospectives.html') ? 'aria-current="page"' : ''}>Rétrospectives</a></li>
                        <li><a href="${basePath}favorites.html" ${this.isActive('favorites.html') ? 'aria-current="page"' : ''}>Favoris</a></li>
                        <li><a href="${basePath}recent.html" ${this.isActive('recent.html') ? 'aria-current="page"' : ''}>Récents</a></li>
                    </ul>
                    <div class="navbar-search">
                        <input type="text" id="global-search-input" placeholder="Rechercher un article..." aria-label="Rechercher un article">
                        <span class="search-icon">🔍</span>
                        ${isThemePage ? `
                        <label class="search-scope-toggle">
                            <input type="checkbox" id="search-scope-toggle">
                            <span>Dans ${themeName} uniquement</span>
                        </label>
                        ` : ''}
                        <button class="navbar-cmd-btn" id="navbar-cmd-btn" aria-label="Open command palette">
                            <kbd>⌘K</kbd>
                        </button>
                    </div>
                </div>
            </nav>
        `;

        this.log('Navbar rendered');
    }

    /**
     * Get base path depending on current location
     */
    getBasePath() {
        // If we're in /themes/, go up one level
        if (this.currentPath.includes('/themes/')) {
            return '../';
        }
        // Otherwise we're at root level
        return '';
    }

    /**
     * Check if a page is active
     */
    isActive(pageName) {
        // Exact match for filename
        if (this.currentPath.endsWith(pageName)) {
            return true;
        }

        // Special case: index.html or root /
        if (pageName === 'index.html' &&
            (this.currentPath === '/' || this.currentPath.endsWith('/index.html'))) {
            return true;
        }

        return false;
    }

    /**
     * Check if current page is a theme page
     */
    isThemePage() {
        return this.currentPath.includes('/themes/');
    }

    /**
     * Get current theme name for display
     */
    getThemeName() {
        const themeNames = {
            'weweb.html': 'WeWeb',
            'xano.html': 'Xano',
            'api.html': 'API',
            'bonnes-pratiques.html': 'Bonnes pratiques',
            'notes-diverses.html': 'Notes diverses',
            'retrospectives.html': 'Rétrospectives'
        };

        for (const [file, name] of Object.entries(themeNames)) {
            if (this.currentPath.endsWith(file)) {
                return name;
            }
        }

        return 'ce thème';
    }
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    const navbar = new Navbar();
    navbar.init();
});
