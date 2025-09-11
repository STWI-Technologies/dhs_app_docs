import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useLanguage } from '../LanguageSwitcher/LanguageContext';
import styles from './SearchBar.module.css';

const SearchBar = ({ 
  placeholder,
  onSearch,
  onSuggestionSelect,
  suggestions = [],
  debounceMs = 300,
  showSuggestions = true,
  showClearButton = true,
  mode = 'local', // 'local' or 'external'
  externalSearchUrl = 'https://directhomeservice.ladesk.com/search',
  minSearchLength = 2
}) => {
  const [query, setQuery] = useState('');
  const [showSuggestionsList, setShowSuggestionsList] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { language } = useLanguage();
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceRef = useRef(null);

  // Localized text
  const text = {
    en: {
      localPlaceholder: 'Search knowledge base...',
      externalPlaceholder: 'Search entire knowledge base...',
      searchButton: 'Search',
      noResults: 'No suggestions found',
      clearSearch: 'Clear search'
    },
    es: {
      localPlaceholder: 'Buscar en la base de conocimientos...',
      externalPlaceholder: 'Buscar en toda la base de conocimientos...',
      searchButton: 'Buscar',
      noResults: 'No se encontraron sugerencias',
      clearSearch: 'Limpiar búsqueda'
    }
  };

  const currentText = text[language] || text.en;
  const currentPlaceholder = placeholder || (mode === 'local' ? currentText.localPlaceholder : currentText.externalPlaceholder);

  // Debounced search function
  const debouncedSearch = useCallback((searchQuery) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (searchQuery.length >= minSearchLength) {
        setIsLoading(true);
        if (onSearch) {
          onSearch(searchQuery);
        }
        setIsLoading(false);
      }
    }, debounceMs);
  }, [onSearch, debounceMs, minSearchLength]);

  // Filter suggestions based on query
  useEffect(() => {
    if (query.length >= minSearchLength && showSuggestions) {
      const filtered = suggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestionsList(filtered.length > 0);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestionsList(false);
    }
  }, [query, suggestions, showSuggestions, minSearchLength]);

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setActiveSuggestionIndex(-1);
    
    if (mode === 'local') {
      debouncedSearch(value);
    }
  };

  // Handle form submission (for external search)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'external' && query.trim()) {
      const form = e.target;
      const formData = new FormData(form);
      const searchUrl = new URL(externalSearchUrl);
      formData.forEach((value, key) => {
        searchUrl.searchParams.set(key, value);
      });
      window.open(searchUrl.toString(), '_blank');
    } else if (mode === 'local' && onSearch) {
      onSearch(query);
    }
    setShowSuggestionsList(false);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestionsList || filteredSuggestions.length === 0) {
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveSuggestionIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (activeSuggestionIndex >= 0) {
          handleSuggestionClick(filteredSuggestions[activeSuggestionIndex]);
        } else if (mode === 'external') {
          handleSubmit(e);
        }
        break;
      case 'Escape':
        setShowSuggestionsList(false);
        setActiveSuggestionIndex(-1);
        break;
      default:
        break;
    }
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    setShowSuggestionsList(false);
    setActiveSuggestionIndex(-1);
    
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion);
    } else if (onSearch) {
      onSearch(suggestion);
    }
  };

  // Clear search
  const handleClear = () => {
    setQuery('');
    setShowSuggestionsList(false);
    setActiveSuggestionIndex(-1);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestionsList(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className={styles.searchContainer}>
      <form onSubmit={handleSubmit} className={styles.searchForm}>
        <div className={styles.searchInputWrapper}>
          <input
            ref={searchInputRef}
            type="text"
            name="q"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={currentPlaceholder}
            className={styles.searchInput}
            autoComplete="off"
            aria-label={currentPlaceholder}
            aria-expanded={showSuggestionsList}
            aria-haspopup="listbox"
            role="combobox"
          />
          
          {showClearButton && query.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className={styles.clearButton}
              aria-label={currentText.clearSearch}
            >
              ✕
            </button>
          )}
          
          {isLoading && (
            <div className={styles.loadingSpinner} aria-hidden="true">
              <div className={styles.spinner}></div>
            </div>
          )}
        </div>

        {mode === 'external' && (
          <>
            <button type="submit" className={styles.searchButton}>
              {currentText.searchButton}
            </button>
            <input type="hidden" name="pid" value="6" />
            <input type="hidden" name="type" value="search" />
            <input type="hidden" name="upid" value="" />
          </>
        )}
      </form>

      {/* Suggestions dropdown */}
      {showSuggestionsList && showSuggestions && filteredSuggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className={styles.suggestionsContainer}
          role="listbox"
          aria-label="Search suggestions"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className={`${styles.suggestionItem} ${
                index === activeSuggestionIndex ? styles.active : ''
              }`}
              role="option"
              aria-selected={index === activeSuggestionIndex}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {showSuggestionsList && showSuggestions && filteredSuggestions.length === 0 && query.length >= minSearchLength && (
        <div className={styles.noResults}>
          {currentText.noResults}
        </div>
      )}
    </div>
  );
};

SearchBar.propTypes = {
  placeholder: PropTypes.string,
  onSearch: PropTypes.func,
  onSuggestionSelect: PropTypes.func,
  suggestions: PropTypes.arrayOf(PropTypes.string),
  debounceMs: PropTypes.number,
  showSuggestions: PropTypes.bool,
  showClearButton: PropTypes.bool,
  mode: PropTypes.oneOf(['local', 'external']),
  externalSearchUrl: PropTypes.string,
  minSearchLength: PropTypes.number
};

export default SearchBar;