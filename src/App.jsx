import React, { useState, useEffect } from 'react';
import {
  Header,
  LanguageSwitcher,
  LanguageProvider,
  SearchBar,
  CategoryGrid,
  ArticleCard,
  useLanguage
} from './components';
import { getTranslation, getLocalizedText } from './utils/translations';
import './styles/globals.css';

// Main App Content Component (needs to be inside LanguageProvider)
const AppContent = () => {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [knowledgeBaseData, setKnowledgeBaseData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load knowledge base data
  useEffect(() => {
    const loadKnowledgeBase = async () => {
      try {
        const response = await fetch('/data/knowledge-base-content.json');
        const data = await response.json();
        setKnowledgeBaseData(data.knowledgeBase);
      } catch (error) {
        console.error('Failed to load knowledge base data:', error);
        // Use fallback data or show error state
      } finally {
        setLoading(false);
      }
    };

    loadKnowledgeBase();
  }, []);

  // Handle search functionality
  const handleSearch = (query) => {
    setSearchQuery(query);
    
    if (!query.trim() || !knowledgeBaseData) {
      setSearchResults([]);
      return;
    }

    // Simple search implementation - filter articles by title, category, and keywords
    const results = knowledgeBaseData.articles.filter(article => {
      const searchTerms = query.toLowerCase().split(' ');
      const articleText = [
        getLocalizedText(article.title, language),
        getLocalizedText(article.category, language),
        ...(article.keywords || []),
        article.content?.overview ? getLocalizedText(article.content.overview, language) : ''
      ].join(' ').toLowerCase();

      return searchTerms.every(term => articleText.includes(term));
    });

    setSearchResults(results);
  };

  // Generate search suggestions from articles
  const generateSuggestions = () => {
    if (!knowledgeBaseData) return [];
    
    const suggestions = new Set();
    
    knowledgeBaseData.articles.forEach(article => {
      // Add article titles
      suggestions.add(getLocalizedText(article.title, language));
      
      // Add keywords
      if (article.keywords) {
        article.keywords.forEach(keyword => {
          if (keyword.length > 2) {
            suggestions.add(keyword);
          }
        });
      }
      
      // Add categories
      if (article.category) {
        suggestions.add(getLocalizedText(article.category, language));
      }
    });

    return Array.from(suggestions).slice(0, 20); // Limit to 20 suggestions
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: 'Poppins, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #e0e0e0',
            borderTop: '4px solid #2E3192',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p>{language === 'es' ? 'Cargando...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Header */}
      <Header 
        title={getTranslation('companyName', language)}
        subtitle={getTranslation('knowledgeBaseTitle', language)}
      />

      {/* Search Section */}
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h2 style={{ 
          marginBottom: '30px', 
          color: '#2E3192',
          fontFamily: 'Poppins, sans-serif' 
        }}>
          {language === 'es' ? 'Buscar en la Base de Conocimientos' : 'Search Knowledge Base'}
        </h2>
        
        {/* Local Search */}
        <div style={{ marginBottom: '20px' }}>
          <SearchBar
            mode="local"
            onSearch={handleSearch}
            suggestions={generateSuggestions()}
            placeholder={getTranslation('searchPlaceholder', language)}
          />
        </div>

        {/* Search Mode Toggle */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '10px',
          marginBottom: '20px'
        }}>
          <button 
            style={{
              padding: '8px 16px',
              backgroundColor: '#2E3192',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '500',
              fontFamily: 'Poppins, sans-serif'
            }}
          >
            {getTranslation('localSearch', language)}
          </button>
        </div>

        {/* External Search Option */}
        <div style={{ 
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '15px',
          boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
          marginBottom: '20px'
        }}>
          <h3 style={{ 
            marginBottom: '15px',
            fontSize: '18px',
            color: '#2E3192'
          }}>
            {getTranslation('externalSearch', language)}
          </h3>
          <SearchBar
            mode="external"
            placeholder={getTranslation('externalSearchPlaceholder', language)}
            showSuggestions={false}
          />
          <p style={{ 
            marginTop: '10px',
            fontSize: '14px',
            color: '#6b7280'
          }}>
            {getTranslation('externalSearchDescription', language)}
          </p>
        </div>
      </div>

      {/* Search Results */}
      {searchQuery && (
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ 
            marginBottom: '20px',
            color: '#2E3192',
            fontFamily: 'Poppins, sans-serif'
          }}>
            {language === 'es' 
              ? `Resultados para "${searchQuery}" (${searchResults.length})`
              : `Search results for "${searchQuery}" (${searchResults.length})`
            }
          </h3>
          
          {searchResults.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px'
            }}>
              {searchResults.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  onCardClick={(article) => window.open(article.url, '_blank')}
                />
              ))}
            </div>
          ) : (
            <p style={{ 
              textAlign: 'center',
              color: '#878787',
              fontSize: '16px'
            }}>
              {language === 'es' 
                ? 'No se encontraron resultados. Intente con términos diferentes.'
                : 'No results found. Try different search terms.'
              }
            </p>
          )}
        </div>
      )}

      {/* Category Grid - only show when not searching */}
      {!searchQuery && knowledgeBaseData && (
        <>
          <h2 style={{ 
            textAlign: 'center',
            marginBottom: '30px',
            color: '#2E3192',
            fontFamily: 'Poppins, sans-serif'
          }}>
            {language === 'es' ? 'Categorías de Ayuda' : 'Help Categories'}
          </h2>
          
          <CategoryGrid
            onCategoryClick={(article) => window.open(article.url, '_blank')}
          />
        </>
      )}

      {/* Language Switcher */}
      <LanguageSwitcher />

      {/* Footer */}
      <footer style={{ 
        textAlign: 'center',
        marginTop: '50px',
        padding: '20px',
        color: '#878787',
        fontSize: '14px'
      }}>
        <p>{getTranslation('copyright', language)}</p>
        <p>
          {getTranslation('needHelp', language)}{' '}
          <a 
            href="mailto:support@directhomeservice.com" 
            style={{ color: '#2E3192' }}
          >
            {getTranslation('contactSupport', language)}
          </a>
        </p>
      </footer>
    </div>
  );
};

// Main App Component
const App = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};

export default App;