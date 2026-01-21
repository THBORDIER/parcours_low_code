/**
 * Power UX Library
 *
 * Provides:
 * - Toast notifications
 * - Keyboard shortcuts
 * - Keyboard help modal
 * - Utility functions
 */

class PowerUX {
    constructor() {
        this.toasts = [];
        this.shortcuts = new Map();
        this.modalOpen = false;
        this.lastKeyTime = 0;
        this.lastKey = '';
    }

    /**
     * Initialize Power UX features
     */
    init() {
        this.createToastContainer();
        this.createKeyboardHelpModal();
        this.initGlobalShortcuts();
        console.log('[POWER-UX] ✅ Initialized');
    }

    /**
     * ======================
     * TOAST NOTIFICATIONS
     * ======================
     */
    createToastContainer() {
        if (document.querySelector('.toast-container')) return;

        const container = document.createElement('div');
        container.className = 'toast-container';
        container.setAttribute('aria-live', 'polite');
        container.setAttribute('aria-atomic', 'false');
        document.body.appendChild(container);
    }

    showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const icons = {
            success: '✅',
            error: '❌',
            info: 'ℹ️'
        };

        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || icons.info}</span>
            <div class="toast-content">
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" aria-label="Fermer">×</button>
        `;

        const container = document.querySelector('.toast-container');
        container.appendChild(toast);

        // Close button
        toast.querySelector('.toast-close').addEventListener('click', () => {
            this.removeToast(toast);
        });

        // Auto-remove
        if (duration > 0) {
            setTimeout(() => {
                this.removeToast(toast);
            }, duration);
        }

        return toast;
    }

    removeToast(toast) {
        toast.classList.add('toast-exit');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }

    /**
     * ======================
     * KEYBOARD HELP MODAL
     * ======================
     */
    createKeyboardHelpModal() {
        if (document.querySelector('.keyboard-help-modal')) return;

        const modal = document.createElement('div');
        modal.className = 'keyboard-help-modal';
        modal.id = 'keyboard-help-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-labelledby', 'keyboard-help-title');
        modal.setAttribute('aria-modal', 'true');

        modal.innerHTML = `
            <div class="keyboard-help-content">
                <div class="keyboard-help-header">
                    <h2 id="keyboard-help-title">⌨️ Raccourcis clavier</h2>
                    <button class="keyboard-help-close" aria-label="Fermer">×</button>
                </div>
                <div class="keyboard-shortcuts-list">
                    <div class="shortcut-item">
                        <div class="shortcut-keys">
                            <kbd class="shortcut-key">/</kbd>
                        </div>
                        <div class="shortcut-description">Rechercher dans les articles</div>
                    </div>
                    <div class="shortcut-item">
                        <div class="shortcut-keys">
                            <kbd class="shortcut-key">g</kbd>
                            <kbd class="shortcut-key">h</kbd>
                        </div>
                        <div class="shortcut-description">Accueil</div>
                    </div>
                    <div class="shortcut-item">
                        <div class="shortcut-keys">
                            <kbd class="shortcut-key">g</kbd>
                            <kbd class="shortcut-key">f</kbd>
                        </div>
                        <div class="shortcut-description">Favoris</div>
                    </div>
                    <div class="shortcut-item">
                        <div class="shortcut-keys">
                            <kbd class="shortcut-key">g</kbd>
                            <kbd class="shortcut-key">r</kbd>
                        </div>
                        <div class="shortcut-description">Récents</div>
                    </div>
                    <div class="shortcut-item">
                        <div class="shortcut-keys">
                            <kbd class="shortcut-key">↑</kbd>
                            <kbd class="shortcut-key">↓</kbd>
                        </div>
                        <div class="shortcut-description">Naviguer dans les résultats</div>
                    </div>
                    <div class="shortcut-item">
                        <div class="shortcut-keys">
                            <kbd class="shortcut-key">Enter</kbd>
                        </div>
                        <div class="shortcut-description">Ouvrir l'article sélectionné</div>
                    </div>
                    <div class="shortcut-item">
                        <div class="shortcut-keys">
                            <kbd class="shortcut-key">ESC</kbd>
                        </div>
                        <div class="shortcut-description">Effacer la recherche / Fermer</div>
                    </div>
                    <div class="shortcut-item">
                        <div class="shortcut-keys">
                            <kbd class="shortcut-key">?</kbd>
                        </div>
                        <div class="shortcut-description">Afficher cette aide</div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close handlers
        const closeBtn = modal.querySelector('.keyboard-help-close');
        closeBtn.addEventListener('click', () => this.closeHelpModal());

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeHelpModal();
            }
        });
    }

    openHelpModal() {
        const modal = document.getElementById('keyboard-help-modal');
        if (modal) {
            modal.classList.add('active');
            this.modalOpen = true;
            // Trap focus
            const closeBtn = modal.querySelector('.keyboard-help-close');
            if (closeBtn) closeBtn.focus();
        }
    }

    closeHelpModal() {
        const modal = document.getElementById('keyboard-help-modal');
        if (modal) {
            modal.classList.remove('active');
            this.modalOpen = false;
        }
    }

    /**
     * ======================
     * GLOBAL KEYBOARD SHORTCUTS
     * ======================
     */
    initGlobalShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Don't trigger if user is typing in input/textarea
            const activeElement = document.activeElement;
            const isInputFocused = activeElement && (
                activeElement.tagName === 'INPUT' ||
                activeElement.tagName === 'TEXTAREA' ||
                activeElement.isContentEditable
            );

            // Handle ESC separately (works everywhere)
            if (e.key === 'Escape') {
                if (this.modalOpen) {
                    this.closeHelpModal();
                    return;
                }
                // Let search.js handle ESC for search clearing
                return;
            }

            // Handle ? for help (works everywhere except inputs)
            if (e.key === '?' && !isInputFocused) {
                e.preventDefault();
                this.openHelpModal();
                return;
            }

            // Don't handle other shortcuts if in input
            if (isInputFocused) return;

            // / - Focus search
            if (e.key === '/') {
                e.preventDefault();
                const searchInput = document.getElementById('global-search-input');
                if (searchInput) {
                    searchInput.focus();
                    searchInput.select();
                }
                return;
            }

            // g+h, g+f, g+r - Navigation shortcuts
            const now = Date.now();
            if (e.key === 'g') {
                this.lastKey = 'g';
                this.lastKeyTime = now;
                return;
            }

            // Check if 'g' was pressed recently (within 1 second)
            if (this.lastKey === 'g' && (now - this.lastKeyTime) < 1000) {
                e.preventDefault();

                switch (e.key) {
                    case 'h':
                        window.location.href = '/index.html';
                        break;
                    case 'f':
                        window.location.href = '/favorites.html';
                        break;
                    case 'r':
                        window.location.href = '/recent.html';
                        break;
                }

                this.lastKey = '';
            }
        });
    }

    /**
     * ======================
     * UTILITY FUNCTIONS
     * ======================
     */

    /**
     * Format relative time
     */
    formatRelativeTime(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;

        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `il y a ${days} jour${days > 1 ? 's' : ''}`;
        if (hours > 0) return `il y a ${hours} heure${hours > 1 ? 's' : ''}`;
        if (minutes > 0) return `il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
        return 'à l\'instant';
    }

    /**
     * Debounce function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Create skeleton loader
     */
    createSkeletonCard() {
        return `
            <div class="skeleton-card">
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-text short"></div>
            </div>
        `;
    }

    /**
     * Export data to JSON file
     */
    exportToJSON(data, filename) {
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Import from JSON file
     */
    async importFromJSON(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    resolve(data);
                } catch (error) {
                    reject(new Error('Fichier JSON invalide'));
                }
            };
            reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
            reader.readAsText(file);
        });
    }
}

// Global instance
const powerUX = new PowerUX();

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    powerUX.init();
});
