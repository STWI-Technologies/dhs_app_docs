/**
 * DHS Knowledge Base Search Engine
 * Provides fuzzy search, filtering, and multilingual support
 */

class DHSSearchEngine {
    constructor() {
        this.searchIndex = null;
        this.searchHistory = [];
        this.currentLanguage = 'en';
        this.maxHistoryItems = 10;
        this.debounceTimeout = null;
        this.loadSearchIndex();
        this.loadSearchHistory();
        this.initializeLanguage();
    }

    /**
     * Load search index from JSON file
     */
    async loadSearchIndex() {
        try {
            const response = await fetch('/data/search-index.json');
            this.searchIndex = await response.json();
        } catch (error) {
            console.error('Failed to load search index:', error);
            this.searchIndex = { documents: [], categories: [] };
        }
    }

    /**
     * Initialize language from localStorage or browser preference
     */
    initializeLanguage() {
        const stored = localStorage.getItem('dhs-preferred-language');
        if (stored && (stored === 'en' || stored === 'es')) {
            this.currentLanguage = stored;
        } else {
            const browserLang = navigator.language || navigator.userLanguage;
            this.currentLanguage = browserLang.startsWith('es') ? 'es' : 'en';
        }
    }

    /**
     * Set language and persist preference
     */
    setLanguage(lang) {
        if (lang !== 'en' && lang !== 'es') return;
        this.currentLanguage = lang;
        localStorage.setItem('dhs-preferred-language', lang);
    }

    /**
     * Get current language
     */
    getLanguage() {
        return this.currentLanguage;
    }

    /**
     * Calculate Levenshtein distance for fuzzy matching
     */
    levenshteinDistance(str1, str2) {
        const matrix = [];
        const len1 = str1.length;
        const len2 = str2.length;

        if (len1 === 0) return len2;
        if (len2 === 0) return len1;

        // Initialize matrix
        for (let i = 0; i <= len1; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= len2; j++) {
            matrix[0][j] = j;
        }

        // Fill matrix
        for (let i = 1; i <= len1; i++) {
            for (let j = 1; j <= len2; j++) {
                const cost = str1.charAt(i - 1) === str2.charAt(j - 1) ? 0 : 1;
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,      // deletion
                    matrix[i][j - 1] + 1,      // insertion
                    matrix[i - 1][j - 1] + cost // substitution
                );
            }
        }

        return matrix[len1][len2];
    }

    /**
     * Calculate fuzzy match score (0-1, higher is better)
     */
    fuzzyMatch(query, text) {
        if (!query || !text) return 0;
        
        query = query.toLowerCase().trim();
        text = text.toLowerCase();
        
        // Exact match gets highest score
        if (text.includes(query)) {
            const position = text.indexOf(query);
            const lengthRatio = query.length / text.length;
            const positionScore = 1 - (position / text.length);
            return 0.9 + (lengthRatio * 0.1) + (positionScore * 0.1);
        }

        // Fuzzy matching for individual words
        const queryWords = query.split(' ');
        const textWords = text.split(' ');
        let totalScore = 0;
        let matches = 0;

        for (const queryWord of queryWords) {
            let bestScore = 0;
            for (const textWord of textWords) {
                const distance = this.levenshteinDistance(queryWord, textWord);
                const maxLen = Math.max(queryWord.length, textWord.length);
                const similarity = 1 - (distance / maxLen);
                
                if (similarity > bestScore) {
                    bestScore = similarity;
                }
            }
            
            if (bestScore > 0.6) { // Threshold for considering a match
                totalScore += bestScore;
                matches++;
            }
        }

        return matches > 0 ? (totalScore / queryWords.length) * 0.8 : 0;
    }

    /**
     * Search documents with fuzzy matching and scoring
     */
    search(query, options = {}) {
        if (!this.searchIndex || !query) return [];

        const {
            category = null,
            language = this.currentLanguage,
            minScore = 0.1,
            maxResults = 20
        } = options;

        const results = [];

        for (const doc of this.searchIndex.documents) {
            // Skip if language doesn't match (unless document supports both)
            if (doc.language !== 'both' && doc.language !== language) {
                continue;
            }

            // Skip if category filter doesn't match
            if (category && doc.category !== category && doc.categoryEs !== category) {
                continue;
            }

            // Get language-appropriate content
            const title = language === 'es' ? (doc.titleEs || doc.title) : doc.title;
            const content = language === 'es' ? (doc.contentEs || doc.content) : doc.content;
            const keywords = language === 'es' ? (doc.keywordsEs || doc.keywords) : doc.keywords;

            // Calculate relevance scores
            const titleScore = this.fuzzyMatch(query, title) * 3; // Title matches are weighted higher
            const contentScore = this.fuzzyMatch(query, content) * 1.5;
            const keywordScore = keywords.reduce((sum, keyword) => 
                sum + this.fuzzyMatch(query, keyword), 0) * 2;

            const totalScore = titleScore + contentScore + keywordScore;

            if (totalScore >= minScore) {
                // Generate snippets for highlighting
                const snippets = this.generateSnippets(query, content, 2, 150);
                
                results.push({
                    ...doc,
                    score: totalScore,
                    snippets,
                    displayTitle: title,
                    displayContent: content
                });
            }
        }

        // Sort by relevance score and return top results
        return results
            .sort((a, b) => b.score - a.score)
            .slice(0, maxResults);
    }

    /**
     * Generate content snippets with search term context
     */
    generateSnippets(query, content, maxSnippets = 2, snippetLength = 150) {
        if (!content) return [];

        const words = content.toLowerCase().split(' ');
        const queryWords = query.toLowerCase().split(' ');
        const snippets = [];

        // Find positions where query words appear
        const positions = [];
        queryWords.forEach(queryWord => {
            words.forEach((word, index) => {
                if (this.fuzzyMatch(queryWord, word) > 0.7) {
                    positions.push(index);
                }
            });
        });

        // Create snippets around found positions
        const uniquePositions = [...new Set(positions)].sort((a, b) => a - b);
        
        for (let i = 0; i < Math.min(uniquePositions.length, maxSnippets); i++) {
            const pos = uniquePositions[i];
            const wordsPerSide = Math.floor(snippetLength / 20); // Rough estimate
            const start = Math.max(0, pos - wordsPerSide);
            const end = Math.min(words.length, pos + wordsPerSide);
            
            const snippet = words.slice(start, end).join(' ');
            if (snippet.length > 20) { // Only add meaningful snippets
                snippets.push({
                    text: snippet,
                    startPos: start,
                    highlighted: this.highlightText(snippet, query)
                });
            }
        }

        return snippets;
    }

    /**
     * Highlight search terms in text
     */
    highlightText(text, query) {
        if (!query || !text) return text;

        const queryWords = query.toLowerCase().split(' ').filter(word => word.length > 1);
        let highlighted = text;

        queryWords.forEach(queryWord => {
            const regex = new RegExp(`\\b${this.escapeRegex(queryWord)}\\b`, 'gi');
            highlighted = highlighted.replace(regex, '<mark class="search-highlight">$&</mark>');
        });

        return highlighted;
    }

    /**
     * Escape special regex characters
     */
    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    /**
     * Get search suggestions based on partial input
     */
    getSuggestions(query, maxSuggestions = 5) {
        if (!this.searchIndex || !query || query.length < 2) return [];

        const suggestions = new Set();
        const queryLower = query.toLowerCase();

        // Get suggestions from titles and keywords
        this.searchIndex.documents.forEach(doc => {
            const language = this.currentLanguage;
            const title = language === 'es' ? (doc.titleEs || doc.title) : doc.title;
            const keywords = language === 'es' ? (doc.keywordsEs || doc.keywords) : doc.keywords;

            // Check title words
            title.toLowerCase().split(' ').forEach(word => {
                if (word.length > 2 && word.startsWith(queryLower)) {
                    suggestions.add(word);
                }
            });

            // Check keywords
            keywords.forEach(keyword => {
                if (keyword.toLowerCase().startsWith(queryLower)) {
                    suggestions.add(keyword);
                }
            });
        });

        return Array.from(suggestions).slice(0, maxSuggestions);
    }

    /**
     * Get categories for filtering
     */
    getCategories() {
        if (!this.searchIndex) return [];
        
        return this.searchIndex.categories.map(cat => ({
            ...cat,
            displayName: this.currentLanguage === 'es' ? (cat.nameEs || cat.name) : cat.name,
            displayDescription: this.currentLanguage === 'es' ? (cat.descriptionEs || cat.description) : cat.description
        }));
    }

    /**
     * Add query to search history
     */
    addToHistory(query) {
        if (!query || query.length < 2) return;

        // Remove if already exists
        this.searchHistory = this.searchHistory.filter(item => 
            item.query.toLowerCase() !== query.toLowerCase()
        );

        // Add to beginning
        this.searchHistory.unshift({
            query: query.trim(),
            timestamp: Date.now(),
            language: this.currentLanguage
        });

        // Limit history size
        this.searchHistory = this.searchHistory.slice(0, this.maxHistoryItems);
        
        // Save to localStorage
        localStorage.setItem('dhs-search-history', JSON.stringify(this.searchHistory));
    }

    /**
     * Load search history from localStorage
     */
    loadSearchHistory() {
        try {
            const stored = localStorage.getItem('dhs-search-history');
            this.searchHistory = stored ? JSON.parse(stored) : [];
        } catch (error) {
            this.searchHistory = [];
        }
    }

    /**
     * Get search history
     */
    getHistory() {
        return this.searchHistory.filter(item => 
            item.language === this.currentLanguage
        );
    }

    /**
     * Clear search history
     */
    clearHistory() {
        this.searchHistory = [];
        localStorage.removeItem('dhs-search-history');
    }

    /**
     * Debounced search for real-time results
     */
    debouncedSearch(query, callback, options = {}, delay = 300) {
        clearTimeout(this.debounceTimeout);
        this.debounceTimeout = setTimeout(() => {
            const results = this.search(query, options);
            callback(results);
        }, delay);
    }

    /**
     * Get "Did you mean?" suggestions for typos
     */
    getDidYouMeanSuggestions(query, maxSuggestions = 3) {
        if (!this.searchIndex || !query) return [];

        const suggestions = [];
        const queryWords = query.toLowerCase().split(' ');

        // Check against all known terms
        const allTerms = new Set();
        
        this.searchIndex.documents.forEach(doc => {
            const language = this.currentLanguage;
            const title = language === 'es' ? (doc.titleEs || doc.title) : doc.title;
            const content = language === 'es' ? (doc.contentEs || doc.content) : doc.content;
            const keywords = language === 'es' ? (doc.keywordsEs || doc.keywords) : doc.keywords;

            // Add title words
            title.toLowerCase().split(' ').forEach(word => {
                if (word.length > 2) allTerms.add(word);
            });

            // Add significant content words
            content.toLowerCase().split(' ').forEach(word => {
                if (word.length > 4) allTerms.add(word);
            });

            // Add keywords
            keywords.forEach(keyword => allTerms.add(keyword.toLowerCase()));
        });

        // Find close matches for each query word
        queryWords.forEach(queryWord => {
            if (queryWord.length < 3) return;
            
            let bestMatches = [];
            
            allTerms.forEach(term => {
                const distance = this.levenshteinDistance(queryWord, term);
                const similarity = 1 - (distance / Math.max(queryWord.length, term.length));
                
                if (similarity > 0.6 && similarity < 0.95) { // Close but not exact
                    bestMatches.push({ term, similarity });
                }
            });

            // Get top matches for this word
            bestMatches.sort((a, b) => b.similarity - a.similarity);
            bestMatches.slice(0, 2).forEach(match => {
                suggestions.push({
                    original: queryWord,
                    suggestion: match.term,
                    similarity: match.similarity
                });
            });
        });

        return suggestions
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, maxSuggestions);
    }
}

// Create global search engine instance
window.dhsSearch = new DHSSearchEngine();