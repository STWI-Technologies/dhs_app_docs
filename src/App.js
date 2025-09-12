import React from 'react';
import unifiedContent from './data/unified-content.json';

// Cookie functions
const setCookie = (name, value, days = 365) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

const getCookie = (name) => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

const KnowledgeBase = () => {
  const [selectedArticle, setSelectedArticle] = React.useState(null);
  const [showLanguages, setShowLanguages] = React.useState(false);
  const [currentLanguage, setCurrentLanguage] = React.useState(() => {
    // Initialize from cookie or default to 'en'
    return getCookie('selectedLanguage') || 'en';
  });
  const [searchTerm, setSearchTerm] = React.useState('');
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState([]);
  
  // Save language preference when it changes
  React.useEffect(() => {
    setCookie('selectedLanguage', currentLanguage);
  }, [currentLanguage]);
  
  // Translations
  const translations = {
    en: {
      subtitle: 'Customer Service Knowledge Base',
      searchPlaceholder: 'Search articles...',
      backButton: '← Back to Knowledge Base',
      overview: 'Overview',
      keyFeatures: 'Key Features',
      keywords: 'Keywords',
      noResults: 'No articles found matching your search.',
      copyright: '© 2025 Direct Home Service. All rights reserved.',
      needHelp: 'Need help?',
      contactSupport: 'Contact Support'
    },
    es: {
      subtitle: 'Base de Conocimientos de Servicio al Cliente',
      searchPlaceholder: 'Buscar artículos...',
      backButton: '← Volver a la Base de Conocimientos',
      overview: 'Resumen',
      keyFeatures: 'Características Principales',
      keywords: 'Palabras Clave',
      noResults: 'No se encontraron artículos que coincidan con su búsqueda.',
      copyright: '© 2025 Direct Home Service. Todos los derechos reservados.',
      needHelp: '¿Necesita ayuda?',
      contactSupport: 'Contactar Soporte'
    }
  };

  const t = translations[currentLanguage];
  
  // Helper function to get article content in current language
  const getLocalizedArticle = (article) => {
    return article[currentLanguage] || article.en;
  };
  
  // Helper function to extract all searchable text from an article
  const getSearchableText = (article) => {
    const localized = getLocalizedArticle(article);
    let text = '';
    text += localized.title + ' ';
    text += localized.category + ' ';
    text += (article.keywords || []).join(' ') + ' ';
    
    // Add all content fields
    if (localized.content) {
      text += (localized.content.overview || '') + ' ';
      text += (localized.content.keyFeatures || []).join(' ') + ' ';
    }
    
    return text.toLowerCase();
  };

  // Always show all articles on homepage (don't filter by search term)
  const filteredArticles = React.useMemo(() => {
    return unifiedContent.knowledgeBase.articles;
  }, [currentLanguage]);

  // Generate autocomplete suggestions with article references
  React.useEffect(() => {
    if (!searchTerm || searchTerm.length < 2) {
      setSuggestions([]);
      return;
    }

    const term = searchTerm.toLowerCase();
    const suggestionList = [];

    unifiedContent.knowledgeBase.articles.forEach(article => {
      const searchableText = getSearchableText(article);
      const localized = getLocalizedArticle(article);
      
      // Find sentences/phrases containing the search term
      const sentences = searchableText.split(/[.!?;]/).filter(s => s.trim());
      sentences.forEach(sentence => {
        if (sentence.includes(term)) {
          const trimmed = sentence.trim();
          if (trimmed.length > 10 && trimmed.length < 100) {
            // Extract a meaningful phrase around the search term
            const termIndex = trimmed.indexOf(term);
            const start = Math.max(0, termIndex - 30);
            const end = Math.min(trimmed.length, termIndex + term.length + 30);
            let suggestionText = trimmed.substring(start, end);
            if (start > 0) suggestionText = '...' + suggestionText;
            if (end < trimmed.length) suggestionText = suggestionText + '...';
            
            // Check if this suggestion already exists
            if (!suggestionList.some(s => s.text === suggestionText)) {
              suggestionList.push({
                text: suggestionText,
                article: article,
                isTitle: false
              });
            }
          }
        }
      });

      // Also add article titles that match
      if (localized.title.toLowerCase().includes(term)) {
        suggestionList.push({
          text: localized.title,
          article: article,
          isTitle: true
        });
      }
    });

    setSuggestions(suggestionList);
  }, [searchTerm, currentLanguage]);

  // Group articles by category
  const articlesByCategory = React.useMemo(() => {
    const grouped = {};
    filteredArticles.forEach(article => {
      const localized = getLocalizedArticle(article);
      const category = localized.category;
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(article);
    });
    return grouped;
  }, [filteredArticles, currentLanguage]);

  // Clear search when going back
  const handleBackClick = () => {
    setSelectedArticle(null);
    setSearchTerm('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div style={{
      fontFamily: 'Poppins, sans-serif',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header - Always visible */}
        <header style={{
          textAlign: 'center',
          marginBottom: '40px',
          background: '#001f3f',
          borderRadius: '15px',
          padding: '15px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}>
          <a 
            href="https://directhomeservice.com" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ display: 'inline-block', cursor: 'pointer' }}
          >
            <img 
              src="/brand/logo-11.png" 
              alt="Direct Home Service" 
              style={{ height: '112px', marginBottom: '0', transition: 'transform 0.2s ease' }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            />
          </a>
          <p style={{
            color: '#d3d3d3',
            fontSize: '14px',
            fontWeight: '500',
            marginBottom: '10px',
            marginTop: '-2px',
            paddingBottom: '5px'
          }}>
            {t.subtitle}
          </p>
        </header>

        {/* Search Bar - Only show when not viewing an article */}
        {!selectedArticle && (
          <div style={{
            marginBottom: '30px',
            display: 'flex',
            justifyContent: 'center',
            position: 'relative'
          }}>
            <div style={{ width: '100%', maxWidth: '500px', position: 'relative' }}>
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                style={{
                  width: '100%',
                  padding: '12px 45px 12px 20px',
                  fontSize: '16px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '25px',
                  outline: 'none',
                  transition: 'border-color 0.3s',
                  fontFamily: 'Poppins, sans-serif'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2E3192';
                  setShowSuggestions(true);
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e0e0e0';
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
              />
              
              {/* Clear button */}
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setShowSuggestions(false);
                  }}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#999',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    transition: 'color 0.2s',
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = '#666';
                    e.target.style.backgroundColor = '#f0f0f0';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = '#999';
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  ✕
                </button>
              )}
              
              {/* Autocomplete suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: '5px',
                  background: 'white',
                  borderRadius: '10px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  maxHeight: '300px',
                  overflowY: 'auto',
                  zIndex: 1000
                }}>
                  {suggestions.map((suggestion, index) => {
                    const localized = getLocalizedArticle(suggestion.article);
                    return (
                      <div
                        key={index}
                        onClick={() => {
                          if (suggestion.article) {
                            setSelectedArticle(suggestion.article);
                            setSearchTerm('');
                            setShowSuggestions(false);
                          }
                        }}
                        style={{
                          padding: '12px 15px',
                          cursor: 'pointer',
                          borderBottom: index < suggestions.length - 1 ? '1px solid #f0f0f0' : 'none',
                          transition: 'background-color 0.2s',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <div style={{
                          fontSize: '14px',
                          fontWeight: suggestion.isTitle ? 'bold' : 'normal',
                          color: suggestion.isTitle ? '#2E3192' : '#333',
                          lineHeight: '1.3'
                        }}>
                          {suggestion.text}
                        </div>
                        {!suggestion.isTitle && (
                          <div style={{
                            fontSize: '12px',
                            color: '#666',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <span style={{
                              background: '#e8f0ff',
                              color: '#2E3192',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: '500'
                            }}>
                              {localized.title}
                            </span>
                            <span>•</span>
                            <span>{localized.category}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Content */}
        {selectedArticle ? (
          <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '30px',
            boxShadow: '0 5px 20px rgba(0,0,0,0.05)',
            animation: 'fadeIn 0.5s ease-in-out'
          }}>
            <button 
              onClick={handleBackClick}
              style={{
                background: 'none',
                border: 'none',
                color: '#2E3192',
                fontSize: '16px',
                cursor: 'pointer',
                marginBottom: '20px',
                fontWeight: '500',
                transition: 'color 0.3s'
              }}
              onMouseEnter={(e) => e.target.style.color = '#4A54D8'}
              onMouseLeave={(e) => e.target.style.color = '#2E3192'}
            >
              {t.backButton}
            </button>
            
            {(() => {
              const localized = getLocalizedArticle(selectedArticle);
              return (
                <>
                  <h1 style={{ color: '#2E3192', marginBottom: '10px' }}>{localized.title}</h1>
                  <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
                    {localized.category}
                  </p>
                  
                  {localized.content?.overview && (
                    <div style={{ marginBottom: '30px' }}>
                      <h2 style={{ color: '#333', fontSize: '20px', marginBottom: '10px' }}>{t.overview}</h2>
                      <p style={{ color: '#666', lineHeight: '1.6' }}>{localized.content.overview}</p>
                    </div>
                  )}
                  
                  {localized.content?.keyFeatures && localized.content.keyFeatures.length > 0 && (
                    <div style={{ marginBottom: '30px' }}>
                      <h2 style={{ color: '#333', fontSize: '20px', marginBottom: '10px' }}>{t.keyFeatures}</h2>
                      <ul style={{ color: '#666', lineHeight: '1.8' }}>
                        {localized.content.keyFeatures.map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {selectedArticle.keywords && selectedArticle.keywords.length > 0 && (
                    <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #e0e0e0' }}>
                      <h3 style={{ color: '#333', fontSize: '16px', marginBottom: '10px' }}>{t.keywords}</h3>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {selectedArticle.keywords.map((keyword, index) => (
                          <span 
                            key={index}
                            style={{
                              background: '#f0f0f0',
                              padding: '4px 12px',
                              borderRadius: '15px',
                              fontSize: '12px',
                              color: '#666'
                            }}
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        ) : (
          <div>
            {/* Articles Grid */}
            {Object.keys(articlesByCategory).length > 0 ? (
              Object.entries(articlesByCategory).map(([category, articles]) => (
                <div key={category} style={{ marginBottom: '40px' }}>
                  <h2 style={{
                    color: '#2E3192',
                    fontSize: '24px',
                    marginBottom: '20px',
                    fontWeight: '600'
                  }}>
                    {category}
                  </h2>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '20px'
                  }}>
                    {articles.map(article => {
                      const localized = getLocalizedArticle(article);
                      return (
                        <div
                          key={article.id}
                          onClick={() => setSelectedArticle(article)}
                          style={{
                            background: 'white',
                            borderRadius: '10px',
                            padding: '20px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                            border: '1px solid #e0e0e0'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-5px)';
                            e.currentTarget.style.boxShadow = '0 5px 20px rgba(0,0,0,0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
                          }}
                        >
                          <h3 style={{
                            color: '#2E3192',
                            fontSize: '18px',
                            marginBottom: '10px',
                            fontWeight: '600'
                          }}>
                            {localized.title}
                          </h3>
                          <p style={{
                            color: '#666',
                            fontSize: '14px',
                            lineHeight: '1.5'
                          }}>
                            {localized.content?.overview?.substring(0, 100)}...
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: '#666'
              }}>
                <p style={{ fontSize: '18px' }}>{t.noResults}</p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <footer style={{
          marginTop: '60px',
          textAlign: 'center',
          padding: '20px',
          borderTop: '1px solid #e0e0e0',
          color: '#666'
        }}>
          <p style={{ marginBottom: '10px' }}>{t.copyright}</p>
          <p>
            {t.needHelp}{' '}
            <a 
              href="mailto:support@directhomeservice.com" 
              style={{ color: '#2E3192', textDecoration: 'none' }}
            >
              {t.contactSupport}
            </a>
          </p>
        </footer>
      </div>

      {/* Language Switcher - Floating Options */}
      <div 
        onMouseEnter={() => setShowLanguages(true)}
        onMouseLeave={() => setShowLanguages(false)}
        style={{
          position: 'fixed',
          bottom: 0,
          left: '25%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {showLanguages ? (
          // Show both options when hovering
          <>
            <div
              onClick={() => {
                setCurrentLanguage('es');
                setShowLanguages(false);
              }}
              style={{
                background: '#2c2c2c',
                color: 'white',
                padding: '15px',
                borderRadius: '8px 8px 0 0',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '400',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                width: '160px',
                height: '30px',
                border: '1px solid #404040',
                borderBottom: 'none',
                background: currentLanguage === 'es' ? '#404040' : '#2c2c2c'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#404040'}
              onMouseLeave={(e) => e.currentTarget.style.background = currentLanguage === 'es' ? '#404040' : '#2c2c2c'}
            >
              <span style={{ fontSize: '16px', lineHeight: 1 }}>🇪🇸</span>
              <span style={{ fontSize: '16px', lineHeight: 1, whiteSpace: 'nowrap' }}>Español</span>
            </div>
            <div
              onClick={() => {
                setCurrentLanguage('en');
              }}
              style={{
                background: '#2c2c2c',
                color: 'white',
                padding: '15px',
                borderRadius: '0 0 0 0',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '400',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                width: '160px',
                height: '30px',
                border: '1px solid #404040',
                background: currentLanguage === 'en' ? '#404040' : '#2c2c2c'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#404040'}
              onMouseLeave={(e) => e.currentTarget.style.background = currentLanguage === 'en' ? '#404040' : '#2c2c2c'}
            >
              <span style={{ fontSize: '16px', lineHeight: 1 }}>🇺🇸</span>
              <span style={{ fontSize: '16px', lineHeight: 1, whiteSpace: 'nowrap' }}>English</span>
            </div>
          </>
        ) : (
          // Show only current language when not hovering
          <div
            style={{
              background: '#2c2c2c',
              color: 'white',
              padding: '15px',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '400',
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              width: '160px',
              height: '30px',
              border: '1px solid #404040'
            }}
          >
            <span style={{ fontSize: '16px', lineHeight: 1 }}>
              {currentLanguage === 'en' ? '🇺🇸' : '🇪🇸'}
            </span>
            <span style={{ fontSize: '16px', lineHeight: 1, whiteSpace: 'nowrap' }}>
              {currentLanguage === 'en' ? 'English' : 'Español'}
            </span>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

function App() {
  return <KnowledgeBase />;
}

export default App;