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
    }

    /**
     * Initialise le module de recherche
     */
    async init() {
        if (this.initialized) return;

        try {
            // Charger l'index des articles
            const response = await fetch('../public/data/articles-index.json');
            if (!response.ok) throw new Error('Impossible de charger l\'index des articles');
            this.articles = await response.json();

            // Détecter le thème actuel à partir de l'URL
            this.detectCurrentTheme();

            // Initialiser les éléments DOM
            this.initDOM();

            this.initialized = true;
            console.log(`✅ Recherche initialisée : ${this.articles.length} articles chargés`);
        } catch (error) {
            console.error('❌ Erreur lors de l\'initialisation de la recherche:', error);
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

        // Événement de recherche en temps réel
        this.searchInput.addEventListener('input', (e) => {
            this.performSearch(e.target.value);
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
     * Effectue la recherche
     */
    performSearch(query) {
        if (!query || query.trim().length < 2) {
            this.resetSearch();
            return;
        }

        const normalizedQuery = this.normalizeString(query);
        let results = this.articles.filter(article => this.matchesQuery(article, normalizedQuery));

        // Filtrer par thème si mode "theme" activé
        if (this.searchScope === 'theme' && this.currentTheme) {
            results = results.filter(article => article.theme === this.currentTheme);
        }

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

        allLinks.forEach(li => {
            const link = li.querySelector('a');
            const articlePath = link.getAttribute('data-article');

            // Vérifier si cet article est dans les résultats
            const found = results.some(result => articlePath.includes(result.path.replace('../', '')));

            if (found) {
                li.style.display = 'block';
                this.highlightText(link, query);
            } else {
                li.style.display = 'none';
            }
        });

        // Afficher un message si aucun résultat
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
     * Affiche un message "aucun résultat"
     */
    showNoResultsMessage(count, container) {
        let noResultsDiv = container.querySelector('.no-results-message');

        if (count === 0) {
            if (!noResultsDiv) {
                noResultsDiv = document.createElement('div');
                noResultsDiv.className = 'no-results-message';
                noResultsDiv.innerHTML = '<p>Aucun article ne correspond à votre recherche.</p>';
                container.insertBefore(noResultsDiv, container.firstChild);
            }
        } else {
            if (noResultsDiv) {
                noResultsDiv.remove();
            }
        }
    }

    /**
     * Réinitialise la recherche
     */
    resetSearch() {
        const articlesList = document.getElementById('articles-menu');

        if (articlesList) {
            // Réafficher tous les articles
            const allLinks = articlesList.querySelectorAll('li');
            allLinks.forEach(li => {
                li.style.display = 'block';
            });

            // Supprimer le message "aucun résultat"
            const noResultsDiv = articlesList.parentElement.querySelector('.no-results-message');
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
