import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import articles from '../../data/articles';
import './SearchBar.css';

export default function SearchBar({ onSelectArticle }) {
  const { t, language, getLocalized } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchIndex, setSearchIndex] = useState({});
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);

  // Load search index from pre-built JSON
  useEffect(() => {
    fetch('/content/search-index.json')
      .then(res => res.ok ? res.json() : {})
      .then(data => setSearchIndex(data))
      .catch(() => setSearchIndex({}));
  }, []);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Generate suggestions
  useEffect(() => {
    if (!searchTerm || searchTerm.length < 2) {
      setSuggestions([]);
      return;
    }

    const term = searchTerm.toLowerCase();
    const results = [];

    articles.forEach(article => {
      const localized = getLocalized(article);

      // Title match (high priority)
      if (localized.title.toLowerCase().includes(term)) {
        results.push({ text: localized.title, article, isTitle: true });
      }

      // Overview match
      if (localized.overview.toLowerCase().includes(term)) {
        const idx = localized.overview.toLowerCase().indexOf(term);
        const start = Math.max(0, idx - 40);
        const end = Math.min(localized.overview.length, idx + term.length + 40);
        let snippet = localized.overview.substring(start, end);
        if (start > 0) snippet = '...' + snippet;
        if (end < localized.overview.length) snippet += '...';
        results.push({ text: snippet, article, isTitle: false });
      }

      // Keyword match
      (article.keywords || []).forEach(kw => {
        if (kw.toLowerCase().includes(term) && !results.some(r => r.article === article && r.isTitle)) {
          results.push({ text: `${localized.title} - "${kw}"`, article, isTitle: false });
        }
      });

      // Deep content search
      const indexed = searchIndex[article.id] || '';
      if (indexed.toLowerCase().includes(term)) {
        const idx = indexed.toLowerCase().indexOf(term);
        const start = Math.max(0, idx - 40);
        const end = Math.min(indexed.length, idx + term.length + 60);
        let snippet = indexed.substring(start, end).trim();
        if (start > 0) snippet = '...' + snippet;
        if (end < indexed.length) snippet += '...';
        if (snippet.length > 20 && !results.some(r => r.text === snippet)) {
          results.push({ text: snippet, article, isTitle: false });
        }
      }
    });

    setSuggestions(results.slice(0, 12));
  }, [searchTerm, language, searchIndex, getLocalized]);

  const handleSelect = (article) => {
    onSelectArticle(article);
    setSearchTerm('');
    setShowSuggestions(false);
  };

  return (
    <div className="search-bar" ref={wrapperRef}>
      <div className="search-bar__input-wrapper">
        <svg className="search-bar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          className="search-bar__input"
          placeholder={t.searchPlaceholder}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
        />
        {searchTerm && (
          <button
            className="search-bar__clear"
            onClick={() => { setSearchTerm(''); setSuggestions([]); inputRef.current?.focus(); }}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="search-bar__dropdown">
          {suggestions.map((s, i) => {
            const localized = getLocalized(s.article);
            return (
              <div
                key={i}
                className="search-bar__suggestion"
                onMouseDown={() => handleSelect(s.article)}
              >
                <div className={`search-bar__suggestion-text ${s.isTitle ? 'search-bar__suggestion-text--title' : ''}`}>
                  {s.text}
                </div>
                {!s.isTitle && (
                  <div className="search-bar__suggestion-meta">
                    <span className="search-bar__suggestion-badge">{localized.title}</span>
                    <span className="search-bar__suggestion-category">{localized.category}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
