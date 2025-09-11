/**
 * DHS Language Manager
 * Handles language persistence and switching across all pages
 */

class DHSLanguageManager {
    constructor() {
        this.currentLanguage = 'en';
        this.supportedLanguages = ['en', 'es'];
        this.storageKey = 'dhs-preferred-language';
        this.callbacks = [];
        
        this.init();
    }

    init() {
        this.loadLanguagePreference();
        this.setupLanguageSwitchers();
        this.updatePageLanguage();
    }

    /**
     * Load language preference from localStorage or detect browser language
     */
    loadLanguagePreference() {
        // First check localStorage
        const stored = localStorage.getItem(this.storageKey);
        if (stored && this.supportedLanguages.includes(stored)) {
            this.currentLanguage = stored;
            return;
        }

        // Then check browser language
        const browserLang = navigator.language || navigator.userLanguage;
        this.currentLanguage = browserLang.startsWith('es') ? 'es' : 'en';
        
        // Store the detected language
        this.setLanguage(this.currentLanguage, false);
    }

    /**
     * Set language and optionally trigger callbacks
     */
    setLanguage(language, triggerCallbacks = true) {
        if (!this.supportedLanguages.includes(language)) {
            console.warn(`Unsupported language: ${language}`);
            return false;
        }

        const previousLanguage = this.currentLanguage;
        this.currentLanguage = language;
        
        // Store preference
        localStorage.setItem(this.storageKey, language);
        
        // Update HTML lang attribute
        document.documentElement.setAttribute('lang', language);
        
        // Update page content
        this.updatePageLanguage();
        
        // Trigger callbacks
        if (triggerCallbacks) {
            this.callbacks.forEach(callback => {
                try {
                    callback(language, previousLanguage);
                } catch (error) {
                    console.error('Language change callback error:', error);
                }
            });
        }

        return true;
    }

    /**
     * Get current language
     */
    getLanguage() {
        return this.currentLanguage;
    }

    /**
     * Add language change callback
     */
    onLanguageChange(callback) {
        if (typeof callback === 'function') {
            this.callbacks.push(callback);
        }
    }

    /**
     * Remove language change callback
     */
    removeLanguageChangeCallback(callback) {
        const index = this.callbacks.indexOf(callback);
        if (index > -1) {
            this.callbacks.splice(index, 1);
        }
    }

    /**
     * Setup language switcher buttons
     */
    setupLanguageSwitchers() {
        // Find all language buttons
        const languageButtons = document.querySelectorAll('[data-language]');
        
        languageButtons.forEach(button => {
            const targetLanguage = button.dataset.language;
            
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLanguageSwitch(targetLanguage);
            });
        });

        // Update active states
        this.updateLanguageButtons();
    }

    /**
     * Handle language switch with navigation logic
     */
    handleLanguageSwitch(targetLanguage) {
        if (targetLanguage === this.currentLanguage) return;

        const currentPath = window.location.pathname;
        
        if (targetLanguage === 'es') {
            // Switch to Spanish
            this.setLanguage('es');
            
            // Navigate to Spanish version if available
            if (!currentPath.startsWith('/es/')) {
                let spanishPath;
                if (currentPath === '/' || currentPath === '/index.html') {
                    spanishPath = '/es/index.html';
                } else if (currentPath.startsWith('/en/')) {
                    spanishPath = currentPath.replace('/en/', '/es/');
                } else {
                    // Try to find equivalent Spanish page
                    spanishPath = `/es${currentPath}`;
                }
                
                // Check if Spanish page exists before navigating
                this.navigateIfExists(spanishPath, '/es/dashboard.html');
            }
        } else {
            // Switch to English
            this.setLanguage('en');
            
            // Navigate to English version if currently on Spanish page
            if (currentPath.startsWith('/es/')) {
                const englishPath = currentPath.replace('/es/', '/en/');
                this.navigateIfExists(englishPath, '/en/dashboard.html');
            }
        }
    }

    /**
     * Navigate to path if it exists, otherwise fallback
     */
    async navigateIfExists(targetPath, fallbackPath) {
        try {
            const response = await fetch(targetPath, { method: 'HEAD' });
            if (response.ok) {
                window.location.href = targetPath;
            } else {
                window.location.href = fallbackPath;
            }
        } catch (error) {
            // If fetch fails, try to navigate anyway
            window.location.href = targetPath;
        }
    }

    /**
     * Update page content based on current language
     */
    updatePageLanguage() {
        // Update elements with data attributes
        const elementsWithTranslations = document.querySelectorAll('[data-en], [data-es]');
        elementsWithTranslations.forEach(element => {
            const translation = element.getAttribute(`data-${this.currentLanguage}`);
            if (translation) {
                element.textContent = translation;
            }
        });

        // Update page title if translations exist
        const titleElement = document.querySelector('title');
        if (titleElement) {
            const titleTranslation = document.querySelector(`meta[name="title-${this.currentLanguage}"]`);
            if (titleTranslation) {
                titleElement.textContent = titleTranslation.content;
            }
        }

        // Update meta descriptions
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            const descTranslation = document.querySelector(`meta[name="description-${this.currentLanguage}"]`);
            if (descTranslation) {
                metaDescription.content = descTranslation.content;
            }
        }

        // Update language buttons
        this.updateLanguageButtons();
        
        // Update any other language-dependent content
        this.updateSearchPlaceholders();
        this.updateFormLabels();
    }

    /**
     * Update language button states
     */
    updateLanguageButtons() {
        const languageButtons = document.querySelectorAll('[data-language]');
        
        languageButtons.forEach(button => {
            const buttonLanguage = button.dataset.language;
            const isActive = buttonLanguage === this.currentLanguage;
            
            button.classList.toggle('active', isActive);
            
            // Update ARIA attributes
            button.setAttribute('aria-pressed', isActive.toString());
        });
    }

    /**
     * Update search box placeholders
     */
    updateSearchPlaceholders() {
        const searchBoxes = document.querySelectorAll('.search-box, .dhs-search-box, input[type="search"]');
        
        const placeholders = {
            en: 'Search knowledge base...',
            es: 'Buscar en la base de conocimientos...'
        };

        searchBoxes.forEach(box => {
            if (!box.hasAttribute('data-keep-placeholder')) {
                box.placeholder = placeholders[this.currentLanguage];
            }
        });
    }

    /**
     * Update form labels and buttons
     */
    updateFormLabels() {
        const translations = {
            en: {
                search: 'Search',
                clear: 'Clear',
                submit: 'Submit',
                cancel: 'Cancel',
                save: 'Save',
                edit: 'Edit',
                delete: 'Delete',
                close: 'Close'
            },
            es: {
                search: 'Buscar',
                clear: 'Limpiar',
                submit: 'Enviar',
                cancel: 'Cancelar',
                save: 'Guardar',
                edit: 'Editar',
                delete: 'Eliminar',
                close: 'Cerrar'
            }
        };

        const t = translations[this.currentLanguage];

        // Update buttons by data attributes
        Object.keys(t).forEach(key => {
            const elements = document.querySelectorAll(`[data-text="${key}"]`);
            elements.forEach(element => {
                if (element.tagName === 'INPUT' && (element.type === 'submit' || element.type === 'button')) {
                    element.value = t[key];
                } else {
                    element.textContent = t[key];
                }
            });
        });
    }

    /**
     * Get localized text
     */
    getText(key, translations) {
        if (!translations || typeof translations !== 'object') return key;
        return translations[this.currentLanguage] || translations.en || key;
    }

    /**
     * Format localized text with parameters
     */
    formatText(template, params = {}) {
        let formatted = template;
        Object.keys(params).forEach(key => {
            const regex = new RegExp(`{${key}}`, 'g');
            formatted = formatted.replace(regex, params[key]);
        });
        return formatted;
    }

    /**
     * Add language links to current page
     */
    addLanguageLinks() {
        const head = document.head;
        const currentPath = window.location.pathname;
        
        // Add alternate language links
        const alternateLanguage = this.currentLanguage === 'en' ? 'es' : 'en';
        let alternatePath;
        
        if (this.currentLanguage === 'en') {
            alternatePath = currentPath.replace('/en/', '/es/');
        } else {
            alternatePath = currentPath.replace('/es/', '/en/');
        }
        
        // Remove existing alternate links
        const existingLinks = head.querySelectorAll('link[rel="alternate"][hreflang]');
        existingLinks.forEach(link => link.remove());
        
        // Add new alternate link
        const alternateLink = document.createElement('link');
        alternateLink.rel = 'alternate';
        alternateLink.hreflang = alternateLanguage;
        alternateLink.href = alternatePath;
        head.appendChild(alternateLink);
        
        // Add canonical link
        const existingCanonical = head.querySelector('link[rel="canonical"]');
        if (existingCanonical) {
            existingCanonical.href = window.location.href;
        } else {
            const canonicalLink = document.createElement('link');
            canonicalLink.rel = 'canonical';
            canonicalLink.href = window.location.href;
            head.appendChild(canonicalLink);
        }
    }

    /**
     * Initialize language detection and redirect logic
     */
    static initializePageLanguage() {
        const currentPath = window.location.pathname;
        const stored = localStorage.getItem('dhs-preferred-language');
        
        // If user prefers Spanish and is on English page, redirect
        if (stored === 'es' && (currentPath === '/' || currentPath.startsWith('/en/'))) {
            let spanishPath;
            if (currentPath === '/' || currentPath === '/index.html') {
                spanishPath = '/es/index.html';
            } else {
                spanishPath = currentPath.replace('/en/', '/es/');
            }
            
            // Only redirect if Spanish page likely exists
            if (spanishPath !== currentPath) {
                window.location.href = spanishPath;
                return true; // Indicates redirect is happening
            }
        }
        
        // If user prefers English and is on Spanish page, redirect
        if (stored === 'en' && currentPath.startsWith('/es/')) {
            const englishPath = currentPath.replace('/es/', '/en/');
            window.location.href = englishPath;
            return true; // Indicates redirect is happening
        }
        
        return false; // No redirect needed
    }
}

// Auto-initialize if not redirecting
if (!DHSLanguageManager.initializePageLanguage()) {
    // Create global language manager instance
    window.dhsLanguage = new DHSLanguageManager();
    
    // Make language manager available to search components
    if (window.dhsSearch) {
        // Sync language between search engine and language manager
        window.dhsLanguage.onLanguageChange((newLang) => {
            window.dhsSearch.setLanguage(newLang);
        });
        
        // Set initial language
        window.dhsSearch.setLanguage(window.dhsLanguage.getLanguage());
    }
}