/**
 * Module de recherche d'articles
 *
 * Permet de rechercher dans les articles par :
 * - Titre
 * - Mots-clés
 * - Catégorie
 * - Niveau
 *
 * Supporte la recherche globale et par thème
 */

class ArticleSearch {
    constructor() {
        this.articles = [];
        this.currentTheme = null;
        this.searchInput = null;
        this.searchScope = 'global'; // 'global' ou 'theme'
        this.initialized = false;
        this.debounceTimer = null;
        this.debugMode = new URLSearchParams(window.location.search).has('debug');
    }

    /**
     * Log avec préfixe [APP] et mode debug
     */
    log(...args) {
        if (this.debugMode) {
            console.log('[APP]', ...args);
        }
    }

    error(...args) {
        console.error('[APP]', ...args);
    }

    /**
     * Initialise le module de recherche
     */
    async init() {
        if (this.initialized) return;

        try {
            // Charger l'index des articles
            this.log('Loading articles index...');
            const response = await fetch('../public/data/articles-index.json');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Unable to load articles index`);
            }
            this.articles = await response.json();
            this.log(`Loaded ${this.articles.length} articles`);

            // Détecter le thème actuel à partir de l'URL
            this.detectCurrentTheme();
            this.log(`Current theme: ${this.currentTheme || 'none (index page)'}`);

            // Initialiser les éléments DOM
            this.initDOM();

            this.initialized = true;
            this.log('Search initialized successfully');
            console.log(`[APP] ✅ Search ready: ${this.articles.length} articles indexed`);
        } catch (error) {
            this.error('Failed to initialize search:', error);
            this.showSearchError();
        }
    }

    /**
     * Affiche un message d'erreur si l'index ne peut pas être chargé
     */
    showSearchError() {
        if (this.searchInput) {
            this.searchInput.disabled = true;
            this.searchInput.placeholder = 'Recherche indisponible';
            this.searchInput.title = 'Impossible de charger l\'index de recherche';
        }
    }

    /**
     * Détecte le thème actuel à partir de l'URL
     */
    detectCurrentTheme() {
        const currentPage = window.location.pathname;

        if (currentPage.includes('/weweb.html')) {
            this.currentTheme = 'weweb';
        } else if (currentPage.includes('/xano.html')) {
            this.currentTheme = 'xano';
        } else if (currentPage.includes('/api.html')) {
            this.currentTheme = 'api';
        } else if (currentPage.includes('/bonnes-pratiques.html')) {
            this.currentTheme = 'bonnes-pratiques';
        } else if (currentPage.includes('/notes-diverses.html')) {
            this.currentTheme = 'notes-diverses';
        }
    }

    /**
     * Initialise les éléments DOM
     */
    initDOM() {
        this.searchInput = document.getElementById('global-search-input');
        const searchScopeToggle = document.getElementById('search-scope-toggle');

        if (!this.searchInput) {
            console.warn('⚠️ Champ de recherche non trouvé');
            return;
        }

        // Événement de recherche en temps réel avec debounce
        this.searchInput.addEventListener('input', (e) => {
            this.debouncedSearch(e.target.value);
        });

        // Toggle entre recherche globale et par thème
        if (searchScopeToggle && this.currentTheme) {
            searchScopeToggle.addEventListener('change', (e) => {
                this.searchScope = e.target.checked ? 'theme' : 'global';
                this.performSearch(this.searchInput.value);
            });
        }
    }

    /**
     * Recherche avec debounce (délai de 200ms)
     */
    debouncedSearch(query) {
        // Annuler le timer précédent
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        // Créer un nouveau timer
        this.debounceTimer = setTimeout(() => {
            this.performSearch(query);
        }, 200);
    }

    /**
     * Effectue la recherche
     */
    performSearch(query) {
        this.log(`Searching for: "${query}"`);

        if (!query || query.trim().length < 2) {
            this.resetSearch();
            return;
        }

        const normalizedQuery = this.normalizeString(query);
        let results = this.articles.filter(article => this.matchesQuery(article, normalizedQuery));

        // Filtrer par thème si mode "theme" activé
        if (this.searchScope === 'theme' && this.currentTheme) {
            results = results.filter(article => article.theme === this.currentTheme);
            this.log(`Filtered to theme "${this.currentTheme}": ${results.length} results`);
        }

        this.log(`Found ${results.length} results`);
        this.displayResults(results, query);
    }

    /**
     * Vérifie si un article correspond à la requête
     */
    matchesQuery(article, normalizedQuery) {
        // Recherche dans le titre
        if (this.normalizeString(article.title).includes(normalizedQuery)) {
            return true;
        }

        // Recherche dans la catégorie
        if (article.category && this.normalizeString(article.category).includes(normalizedQuery)) {
            return true;
        }

        // Recherche dans le niveau
        if (article.level && this.normalizeString(article.level).includes(normalizedQuery)) {
            return true;
        }

        // Recherche dans les mots-clés
        if (article.keywords && article.keywords.length > 0) {
            return article.keywords.some(keyword =>
                this.normalizeString(keyword).includes(normalizedQuery)
            );
        }

        return false;
    }

    /**
     * Normalise une chaîne pour la recherche (minuscules, sans accents)
     */
    normalizeString(str) {
        return str
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
    }

    /**
     * Affiche les résultats de recherche
     */
    displayResults(results, query) {
        const articlesList = document.getElementById('articles-menu');

        if (!articlesList) {
            // Si on est sur index.html, afficher dans un conteneur dédié
            this.displayResultsOnIndex(results, query);
            return;
        }

        // Sur une page thème, filtrer la liste existante
        const allLinks = articlesList.querySelectorAll('li');
        let visibleCount = 0;

        allLinks.forEach(li => {
            const link = li.querySelector('a');
            const articlePath = link.getAttribute('data-article');

            // Vérifier si cet article est dans les résultats
            const found = results.some(result => articlePath.includes(result.path.replace('../', '')));

            if (found) {
                li.style.display = 'block';
                this.highlightText(link, query);
                visibleCount++;
            } else {
                li.style.display = 'none';
            }
        });

        // Afficher un compteur et message si aucun résultat
        this.showResultsCounter(visibleCount, articlesList.parentElement);
        this.showNoResultsMessage(results.length, articlesList.parentElement);
    }

    /**
     * Affiche les résultats sur la page index.html
     */
    displayResultsOnIndex(results, query) {
        let resultsContainer = document.getElementById('search-results-container');

        if (!resultsContainer) {
            // Créer le conteneur de résultats
            const mainContent = document.querySelector('.main-content .container');
            resultsContainer = document.createElement('div');
            resultsContainer.id = 'search-results-container';
            resultsContainer.className = 'search-results';
            resultsContainer.setAttribute('aria-live', 'polite');
            resultsContainer.setAttribute('aria-atomic', 'true');
            mainContent.insertBefore(resultsContainer, mainContent.firstChild);
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
                <h2>Résultats de recherche : "${query}"</h2>
                <p>${results.length} article(s) trouvé(s)</p>
            </div>
            <div class="results-grid">
                ${results.map(article => this.createResultCard(article)).join('')}
            </div>
        `;
    }

    /**
     * Crée une carte de résultat
     */
    createResultCard(article) {
        const themeLabel = article.theme.charAt(0).toUpperCase() + article.theme.slice(1);
        const levelBadge = article.level ? `<span class="badge level-${article.level.toLowerCase()}">${article.level}</span>` : '';
        const categoryBadge = article.category ? `<span class="badge category">${article.category}</span>` : '';

        return `
            <div class="result-card">
                <div class="result-header">
                    <h3>${article.title}</h3>
                    <div class="result-badges">
                        <span class="badge theme">${themeLabel}</span>
                        ${categoryBadge}
                        ${levelBadge}
                    </div>
                </div>
                ${article.keywords.length > 0 ? `
                    <div class="result-keywords">
                        🔍 ${article.keywords.slice(0, 5).join(', ')}
                    </div>
                ` : ''}
                <a href="themes/${article.theme}.html?article=${encodeURIComponent(article.path)}" class="result-link">
                    Lire l'article →
                </a>
            </div>
        `;
    }

    /**
     * Surligne le texte recherché
     */
    highlightText(element, query) {
        // Fonctionnalité future : surligner les termes recherchés
        // Pour l'instant, on garde le texte tel quel
    }

    /**
     * Affiche un compteur de résultats
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
        } else {
            if (counterDiv) {
                counterDiv.style.display = 'none';
            }
        }
    }

    /**
     * Affiche un message "aucun résultat"
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
        } else {
            if (noResultsDiv) {
                noResultsDiv.style.display = 'none';
            }
        }
    }

    /**
     * Réinitialise la recherche
     */
    resetSearch() {
        this.log('Resetting search');
        const articlesList = document.getElementById('articles-menu');

        if (articlesList) {
            // Réafficher tous les articles
            const allLinks = articlesList.querySelectorAll('li');
            allLinks.forEach(li => {
                li.style.display = 'block';
            });

            // Supprimer le compteur et message "aucun résultat"
            const container = articlesList.parentElement;
            const counterDiv = container.querySelector('.search-results-counter');
            const noResultsDiv = container.querySelector('.no-results-message');

            if (counterDiv) {
                counterDiv.remove();
            }
            if (noResultsDiv) {
                noResultsDiv.remove();
            }
        }

        // Sur index.html, cacher le conteneur de résultats
        const resultsContainer = document.getElementById('search-results-container');
        if (resultsContainer) {
            resultsContainer.innerHTML = '';
        }
    }
}

// Instance globale
const articleSearch = new ArticleSearch();

// Initialiser la recherche au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    articleSearch.init();
});
