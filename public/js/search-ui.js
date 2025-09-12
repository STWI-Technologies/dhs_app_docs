/**
 * DHS Knowledge Base Search UI Components
 * Handles search interface, results display, and user interactions
 */

class DHSSearchUI {
    constructor() {
        this.searchEngine = window.dhsSearch;
        this.isSearchActive = false;
        this.activeFilters = {
            category: null
        };
        this.translations = {
            en: {
                searchPlaceholder: "Search knowledge base...",
                searchButton: "Search",
                clearButton: "Clear",
                noResults: "No results found",
                noResultsDesc: "Try different keywords or check your spelling",
                didYouMean: "Did you mean:",
                suggestions: "Suggestions:",
                categories: "Categories",
                allCategories: "All Categories",
                searchHistory: "Recent Searches",
                clearHistory: "Clear History",
                loading: "Searching...",
                resultsFor: "Results for",
                showingResults: "Showing {count} results",
                moreResults: "More results..."
            },
            es: {
                searchPlaceholder: "Buscar en la base de conocimientos...",
                searchButton: "Buscar",
                clearButton: "Limpiar",
                noResults: "No se encontraron resultados",
                noResultsDesc: "Pruebe con diferentes palabras clave o revise la ortografía",
                didYouMean: "¿Quisiste decir:",
                suggestions: "Sugerencias:",
                categories: "Categorías",
                allCategories: "Todas las Categorías",
                searchHistory: "Búsquedas Recientes",
                clearHistory: "Limpiar Historial",
                loading: "Buscando...",
                resultsFor: "Resultados para",
                showingResults: "Mostrando {count} resultados",
                moreResults: "Más resultados..."
            }
        };
        this.init();
    }

    init() {
        this.createSearchCSS();
        this.bindEvents();
    }

    /**
     * Create CSS styles for search components
     */
    createSearchCSS() {
        const style = document.createElement('style');
        style.textContent = `
            /* Search Component Styles */
            .dhs-search-container {
                position: relative;
                max-width: 600px;
                margin: 0 auto;
            }

            .dhs-search-box {
                width: 100%;
                padding: 15px 50px 15px 20px;
                font-size: 16px;
                border: 2px solid #e0e0e0;
                border-radius: 25px;
                outline: none;
                transition: all 0.3s ease;
                font-family: 'Poppins', sans-serif;
                background: white;
            }

            .dhs-search-box:focus {
                border-color: #2E3192;
                box-shadow: 0 0 0 3px rgba(46, 49, 146, 0.1);
            }

            .dhs-search-actions {
                position: absolute;
                right: 15px;
                top: 50%;
                transform: translateY(-50%);
                display: flex;
                gap: 5px;
            }

            .dhs-search-btn, .dhs-clear-btn {
                background: none;
                border: none;
                cursor: pointer;
                padding: 5px;
                border-radius: 50%;
                transition: all 0.2s ease;
            }

            .dhs-search-btn:hover, .dhs-clear-btn:hover {
                background: rgba(46, 49, 146, 0.1);
            }

            .dhs-search-suggestions {
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: white;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                z-index: 1000;
                max-height: 400px;
                overflow-y: auto;
                margin-top: 5px;
            }

            .dhs-suggestion-item {
                padding: 12px 16px;
                cursor: pointer;
                border-bottom: 1px solid #f0f0f0;
                transition: background 0.2s ease;
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .dhs-suggestion-item:hover {
                background: #f8f9fa;
            }

            .dhs-suggestion-item:last-child {
                border-bottom: none;
            }

            .dhs-suggestion-icon {
                width: 16px;
                height: 16px;
                opacity: 0.5;
            }

            .dhs-search-results {
                margin-top: 20px;
            }

            .dhs-search-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 2px solid #f0f0f0;
            }

            .dhs-results-info {
                color: #6b7280;
                font-size: 14px;
            }

            .dhs-search-filters {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
                align-items: center;
            }

            .dhs-filter-select {
                padding: 8px 12px;
                border: 1px solid #e0e0e0;
                border-radius: 20px;
                background: white;
                cursor: pointer;
                transition: all 0.2s ease;
                font-size: 14px;
            }

            .dhs-filter-select:hover {
                border-color: #2E3192;
            }

            .dhs-filter-select.active {
                background: #2E3192;
                color: white;
                border-color: #2E3192;
            }

            .dhs-result-item {
                background: white;
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 15px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.08);
                transition: all 0.3s ease;
                border: 2px solid transparent;
            }

            .dhs-result-item:hover {
                box-shadow: 0 4px 20px rgba(0,0,0,0.12);
                border-color: #e0e0e0;
            }

            .dhs-result-title {
                margin: 0 0 8px 0;
                font-size: 18px;
                font-weight: 600;
                color: #2E3192;
            }

            .dhs-result-title a {
                text-decoration: none;
                color: inherit;
                transition: color 0.2s ease;
            }

            .dhs-result-title a:hover {
                color: #5158bb;
            }

            .dhs-result-category {
                display: inline-block;
                background: rgba(46, 49, 146, 0.1);
                color: #2E3192;
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 500;
                margin-bottom: 10px;
            }

            .dhs-result-snippet {
                color: #4b5563;
                line-height: 1.6;
                margin-bottom: 8px;
            }

            .search-highlight {
                background: #fef08a;
                padding: 1px 2px;
                border-radius: 2px;
                font-weight: 500;
            }

            .dhs-no-results {
                text-align: center;
                padding: 60px 20px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.08);
            }

            .dhs-no-results-icon {
                width: 64px;
                height: 64px;
                margin: 0 auto 20px;
                opacity: 0.3;
            }

            .dhs-no-results h3 {
                margin: 0 0 10px 0;
                color: #374151;
                font-size: 20px;
            }

            .dhs-no-results p {
                margin: 0 0 20px 0;
                color: #6b7280;
            }

            .dhs-did-you-mean {
                background: #f3f4f6;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 20px;
            }

            .dhs-did-you-mean-title {
                font-weight: 600;
                color: #374151;
                margin-bottom: 8px;
            }

            .dhs-suggestion-link {
                color: #2E3192;
                text-decoration: none;
                margin-right: 15px;
                transition: color 0.2s ease;
            }

            .dhs-suggestion-link:hover {
                color: #5158bb;
                text-decoration: underline;
            }

            .dhs-search-loading {
                text-align: center;
                padding: 40px;
            }

            .dhs-loading-spinner {
                width: 40px;
                height: 40px;
                border: 3px solid #e0e0e0;
                border-top: 3px solid #2E3192;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 15px;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            /* Mobile Responsiveness */
            @media (max-width: 768px) {
                .dhs-search-container {
                    margin: 0 10px;
                }

                .dhs-search-header {
                    flex-direction: column;
                    gap: 15px;
                    align-items: flex-start;
                }

                .dhs-search-filters {
                    width: 100%;
                    justify-content: flex-start;
                }

                .dhs-result-item {
                    padding: 15px;
                }

                .dhs-result-title {
                    font-size: 16px;
                }
            }

            /* Accessibility */
            .dhs-search-box:focus,
            .dhs-filter-select:focus,
            .dhs-suggestion-item:focus {
                outline: 2px solid #2E3192;
                outline-offset: 2px;
            }

            @media (prefers-reduced-motion: reduce) {
                * {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Create search box component
     */
    createSearchBox(container, options = {}) {
        const {
            placeholder = null,
            showSuggestions = true,
            showFilters = false,
            onSearch = null
        } = options;

        const searchContainer = document.createElement('div');
        searchContainer.className = 'dhs-search-container';

        const lang = this.searchEngine.getLanguage();
        const t = this.translations[lang];
        const searchPlaceholder = placeholder || t.searchPlaceholder;

        searchContainer.innerHTML = `
            <div style="position: relative;">
                <input type="text" 
                       class="dhs-search-box" 
                       placeholder="${searchPlaceholder}"
                       autocomplete="off"
                       spellcheck="false">
                <div class="dhs-search-actions">
                    <button class="dhs-clear-btn" title="${t.clearButton}" style="display: none;">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M12 4L4 12M4 4l8 8" stroke="#999" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </button>
                    <button class="dhs-search-btn" title="${t.searchButton}">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M7.333 12.667A5.333 5.333 0 1 0 7.333 2a5.333 5.333 0 0 0 0 10.667ZM14 14l-2.9-2.9" stroke="#2E3192" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
            </div>
            ${showSuggestions ? '<div class="dhs-search-suggestions" style="display: none;"></div>' : ''}
        `;

        container.appendChild(searchContainer);

        const searchBox = searchContainer.querySelector('.dhs-search-box');
        const searchBtn = searchContainer.querySelector('.dhs-search-btn');
        const clearBtn = searchContainer.querySelector('.dhs-clear-btn');
        const suggestionsContainer = searchContainer.querySelector('.dhs-search-suggestions');

        // Bind search events
        this.bindSearchEvents(searchBox, searchBtn, clearBtn, suggestionsContainer, onSearch);

        return searchContainer;
    }

    /**
     * Create search results container
     */
    createResultsContainer(container, options = {}) {
        const {
            showFilters = true,
            showResultsCount = true
        } = options;

        const resultsContainer = document.createElement('div');
        resultsContainer.className = 'dhs-search-results';
        resultsContainer.style.display = 'none';

        const lang = this.searchEngine.getLanguage();
        const t = this.translations[lang];

        let filtersHTML = '';
        if (showFilters) {
            const categories = this.searchEngine.getCategories();
            const categoryOptions = categories.map(cat => 
                `<option value="${cat.id}">${cat.displayName}</option>`
            ).join('');

            filtersHTML = `
                <div class="dhs-search-filters">
                    <select class="dhs-filter-select" data-filter="category">
                        <option value="">${t.allCategories}</option>
                        ${categoryOptions}
                    </select>
                </div>
            `;
        }

        resultsContainer.innerHTML = `
            <div class="dhs-search-header">
                ${showResultsCount ? '<div class="dhs-results-info"></div>' : ''}
                ${filtersHTML}
            </div>
            <div class="dhs-results-list"></div>
        `;

        container.appendChild(resultsContainer);

        // Bind filter events
        if (showFilters) {
            this.bindFilterEvents(resultsContainer);
        }

        return resultsContainer;
    }

    /**
     * Bind search box events
     */
    bindSearchEvents(searchBox, searchBtn, clearBtn, suggestionsContainer, onSearch) {
        let currentSuggestionIndex = -1;

        // Input events
        searchBox.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            
            // Show/hide clear button
            clearBtn.style.display = query ? 'block' : 'none';
            
            // Show suggestions
            if (query.length > 1 && suggestionsContainer) {
                this.showSuggestions(query, suggestionsContainer, searchBox);
            } else if (suggestionsContainer) {
                suggestionsContainer.style.display = 'none';
            }
        });

        // Clear button
        clearBtn.addEventListener('click', () => {
            searchBox.value = '';
            clearBtn.style.display = 'none';
            if (suggestionsContainer) {
                suggestionsContainer.style.display = 'none';
            }
            searchBox.focus();
            if (onSearch) onSearch('');
        });

        // Search button
        searchBtn.addEventListener('click', () => {
            const query = searchBox.value.trim();
            if (query) {
                this.performSearch(query, onSearch);
                if (suggestionsContainer) {
                    suggestionsContainer.style.display = 'none';
                }
            }
        });

        // Enter key
        searchBox.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const query = searchBox.value.trim();
                if (query) {
                    this.performSearch(query, onSearch);
                    if (suggestionsContainer) {
                        suggestionsContainer.style.display = 'none';
                    }
                }
            } else if (e.key === 'Escape' && suggestionsContainer) {
                suggestionsContainer.style.display = 'none';
                currentSuggestionIndex = -1;
            } else if (e.key === 'ArrowDown' && suggestionsContainer) {
                e.preventDefault();
                const suggestions = suggestionsContainer.querySelectorAll('.dhs-suggestion-item');
                if (suggestions.length > 0) {
                    currentSuggestionIndex = Math.min(currentSuggestionIndex + 1, suggestions.length - 1);
                    this.highlightSuggestion(suggestions, currentSuggestionIndex);
                }
            } else if (e.key === 'ArrowUp' && suggestionsContainer) {
                e.preventDefault();
                const suggestions = suggestionsContainer.querySelectorAll('.dhs-suggestion-item');
                if (suggestions.length > 0) {
                    currentSuggestionIndex = Math.max(currentSuggestionIndex - 1, -1);
                    this.highlightSuggestion(suggestions, currentSuggestionIndex);
                }
            }
        });

        // Click outside to close suggestions
        document.addEventListener('click', (e) => {
            if (suggestionsContainer && !searchBox.contains(e.target) && !suggestionsContainer.contains(e.target)) {
                suggestionsContainer.style.display = 'none';
            }
        });
    }

    /**
     * Show search suggestions
     */
    showSuggestions(query, container, searchBox) {
        const suggestions = this.searchEngine.getSuggestions(query, 5);
        const history = this.searchEngine.getHistory().slice(0, 3);
        const lang = this.searchEngine.getLanguage();
        const t = this.translations[lang];

        let suggestionsHTML = '';

        // Add search suggestions
        if (suggestions.length > 0) {
            suggestionsHTML += `
                <div style="padding: 8px 16px; font-weight: 600; color: #6b7280; font-size: 12px; text-transform: uppercase;">
                    ${t.suggestions}
                </div>
            `;
            suggestions.forEach(suggestion => {
                suggestionsHTML += `
                    <div class="dhs-suggestion-item" data-suggestion="${suggestion}">
                        <svg class="dhs-suggestion-icon" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M7.333 12.667A5.333 5.333 0 1 0 7.333 2a5.333 5.333 0 0 0 0 10.667ZM14 14l-2.9-2.9"/>
                        </svg>
                        ${suggestion}
                    </div>
                `;
            });
        }

        // Add search history
        if (history.length > 0) {
            if (suggestionsHTML) suggestionsHTML += '<div style="border-top: 1px solid #f0f0f0; margin: 5px 0;"></div>';
            
            suggestionsHTML += `
                <div style="padding: 8px 16px; font-weight: 600; color: #6b7280; font-size: 12px; text-transform: uppercase;">
                    ${t.searchHistory}
                </div>
            `;
            history.forEach(item => {
                suggestionsHTML += `
                    <div class="dhs-suggestion-item" data-suggestion="${item.query}">
                        <svg class="dhs-suggestion-icon" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                            <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
                        </svg>
                        ${item.query}
                    </div>
                `;
            });
        }

        container.innerHTML = suggestionsHTML;
        container.style.display = suggestionsHTML ? 'block' : 'none';

        // Bind suggestion clicks
        container.querySelectorAll('.dhs-suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const suggestion = item.dataset.suggestion;
                searchBox.value = suggestion;
                container.style.display = 'none';
                this.performSearch(suggestion);
            });
        });
    }

    /**
     * Highlight suggestion during keyboard navigation
     */
    highlightSuggestion(suggestions, index) {
        suggestions.forEach((suggestion, i) => {
            suggestion.style.background = i === index ? '#f8f9fa' : '';
        });
    }

    /**
     * Bind filter events
     */
    bindFilterEvents(resultsContainer) {
        const filterSelects = resultsContainer.querySelectorAll('.dhs-filter-select');
        
        filterSelects.forEach(select => {
            select.addEventListener('change', () => {
                const filterType = select.dataset.filter;
                const filterValue = select.value;
                
                this.activeFilters[filterType] = filterValue || null;
                this.updateResults();
            });
        });
    }

    /**
     * Perform search and display results
     */
    performSearch(query, callback = null) {
        if (!query) return;

        this.searchEngine.addToHistory(query);
        
        const options = {
            category: this.activeFilters.category,
            language: this.searchEngine.getLanguage()
        };

        const results = this.searchEngine.search(query, options);
        
        if (callback) {
            callback(query, results);
        } else {
            this.displayResults(query, results);
        }
    }

    /**
     * Display search results
     */
    displayResults(query, results, container = null) {
        const resultsContainer = container || document.querySelector('.dhs-search-results');
        if (!resultsContainer) return;

        const lang = this.searchEngine.getLanguage();
        const t = this.translations[lang];
        const resultsList = resultsContainer.querySelector('.dhs-results-list');
        const resultsInfo = resultsContainer.querySelector('.dhs-results-info');

        // Show results container
        resultsContainer.style.display = 'block';

        // Update results count
        if (resultsInfo) {
            resultsInfo.textContent = t.showingResults.replace('{count}', results.length);
        }

        // Display results or no results message
        if (results.length === 0) {
            this.displayNoResults(query, resultsList);
        } else {
            this.displayResultsList(results, resultsList);
        }
    }

    /**
     * Display no results message
     */
    displayNoResults(query, container) {
        const lang = this.searchEngine.getLanguage();
        const t = this.translations[lang];
        const suggestions = this.searchEngine.getDidYouMeanSuggestions(query);

        let didYouMeanHTML = '';
        if (suggestions.length > 0) {
            const suggestionLinks = suggestions.map(s => 
                `<a href="#" class="dhs-suggestion-link" onclick="dhsSearchUI.performSearch('${s.suggestion}')">${s.suggestion}</a>`
            ).join('');
            
            didYouMeanHTML = `
                <div class="dhs-did-you-mean">
                    <div class="dhs-did-you-mean-title">${t.didYouMean}</div>
                    ${suggestionLinks}
                </div>
            `;
        }

        container.innerHTML = `
            ${didYouMeanHTML}
            <div class="dhs-no-results">
                <svg class="dhs-no-results-icon" viewBox="0 0 64 64" fill="currentColor">
                    <path d="M26.667 42.667A16 16 0 1 0 26.667 10.667a16 16 0 0 0 0 32ZM53.333 53.333l-8.8-8.8"/>
                </svg>
                <h3>${t.noResults}</h3>
                <p>${t.noResultsDesc}</p>
            </div>
        `;
    }

    /**
     * Display results list
     */
    displayResultsList(results, container) {
        const lang = this.searchEngine.getLanguage();
        const categories = this.searchEngine.getCategories();
        
        const resultsHTML = results.map(result => {
            // Get category display name
            const category = categories.find(cat => 
                cat.id === result.category || cat.id === result.categoryEs
            );
            const categoryName = category ? category.displayName : result.category;

            // Get best snippet or fallback to beginning of content
            const snippet = result.snippets && result.snippets.length > 0 
                ? result.snippets[0].highlighted 
                : result.displayContent.substring(0, 200) + '...';

            return `
                <div class="dhs-result-item">
                    <div class="dhs-result-category">${categoryName}</div>
                    <h3 class="dhs-result-title">
                        <a href="${result.url}">${result.displayTitle}</a>
                    </h3>
                    <div class="dhs-result-snippet">${snippet}</div>
                </div>
            `;
        }).join('');

        container.innerHTML = resultsHTML;
    }

    /**
     * Update results with current filters
     */
    updateResults() {
        // This would be called when filters change
        // Implementation depends on how search state is managed
    }

    /**
     * Show loading state
     */
    showLoading(container) {
        const lang = this.searchEngine.getLanguage();
        const t = this.translations[lang];
        
        container.innerHTML = `
            <div class="dhs-search-loading">
                <div class="dhs-loading-spinner"></div>
                <div>${t.loading}</div>
            </div>
        `;
    }

    /**
     * Bind global events
     */
    bindEvents() {
        // Global keyboard shortcut for search (Ctrl+K or Cmd+K)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const searchBox = document.querySelector('.dhs-search-box');
                if (searchBox) {
                    searchBox.focus();
                    searchBox.select();
                }
            }
        });

        // Update language when changed
        this.searchEngine.addEventListener?.('languageChange', () => {
            this.updateLanguage();
        });
    }

    /**
     * Update UI language
     */
    updateLanguage() {
        // Update placeholders and text content
        document.querySelectorAll('.dhs-search-box').forEach(box => {
            const lang = this.searchEngine.getLanguage();
            const t = this.translations[lang];
            box.placeholder = t.searchPlaceholder;
        });

        // Update other language-dependent content
        // This method can be extended as needed
    }
}

// Create global search UI instance
window.dhsSearchUI = new DHSSearchUI();