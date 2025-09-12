import React from 'react';
import kbContent from './data/knowledge-base-content.json';

const KnowledgeBase = () => {
  const [selectedArticle, setSelectedArticle] = React.useState(null);
  const [showLanguages, setShowLanguages] = React.useState(false);
  const [currentLanguage, setCurrentLanguage] = React.useState('en');
  const [searchTerm, setSearchTerm] = React.useState('');
  
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
  
  // Filter articles based on search term
  const filteredArticles = React.useMemo(() => {
    if (!searchTerm) return kbContent.knowledgeBase.articles;
    
    const term = searchTerm.toLowerCase();
    return kbContent.knowledgeBase.articles.filter(article => {
      return article.title.toLowerCase().includes(term) ||
             article.category.toLowerCase().includes(term) ||
             (article.keywords && article.keywords.some(keyword => 
               keyword.toLowerCase().includes(term)
             )) ||
             (article.content.overview && article.content.overview.toLowerCase().includes(term));
    });
  }, [searchTerm]);

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
          <img 
            src="/brand/logo-11.png" 
            alt="Direct Home Service" 
            style={{ height: '112px', marginBottom: '0' }}
          />
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
            justifyContent: 'center'
          }}>
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                maxWidth: '500px',
                padding: '12px 20px',
                fontSize: '16px',
                border: '2px solid #e0e0e0',
                borderRadius: '25px',
                outline: 'none',
                transition: 'border-color 0.3s',
                fontFamily: 'Poppins, sans-serif'
              }}
              onFocus={(e) => e.target.style.borderColor = '#2E3192'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
          </div>
        )}

        {/* Article View */}
        {selectedArticle && (
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            background: 'white',
            borderRadius: '15px',
            padding: '40px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
          }}>
            <button
              onClick={() => setSelectedArticle(null)}
              style={{
                marginBottom: '20px',
                padding: '10px 20px',
                background: '#2E3192',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              {t.backButton}
            </button>
            
            <h1 style={{ color: '#2E3192', marginBottom: '20px' }}>
              {selectedArticle.title}
            </h1>
            
            <div style={{ marginBottom: '20px' }}>
              <span style={{
                background: '#e8f4f8',
                color: '#2E3192',
                padding: '5px 15px',
                borderRadius: '20px',
                fontSize: '14px'
              }}>
                {selectedArticle.category}
              </span>
            </div>

            <div style={{ lineHeight: '1.6' }}>
              <h3 style={{ color: '#2E3192', marginBottom: '15px' }}>{t.overview}</h3>
              <p style={{ marginBottom: '20px' }}>
                {selectedArticle.content.overview}
              </p>

              {selectedArticle.content.keyFeatures && (
                <>
                  <h3 style={{ color: '#2E3192', marginBottom: '15px' }}>{t.keyFeatures}</h3>
                  <ul style={{ marginBottom: '20px', paddingLeft: '20px' }}>
                    {selectedArticle.content.keyFeatures.map((feature, index) => (
                      <li key={index} style={{ marginBottom: '8px' }}>{feature}</li>
                    ))}
                  </ul>
                </>
              )}

              {selectedArticle.keywords && (
                <>
                  <h3 style={{ color: '#2E3192', marginBottom: '15px' }}>{t.keywords}</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {selectedArticle.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        style={{
                          background: '#f0f0f0',
                          padding: '5px 10px',
                          borderRadius: '15px',
                          fontSize: '12px',
                          color: '#666'
                        }}
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Knowledge Base Grid - Only show when not viewing an article */}
        {!selectedArticle && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '30px'
          }}>
            {/* No results message */}
            {filteredArticles.length === 0 && (
              <div style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: '40px',
                color: '#666'
              }}>
                <p>{t.noResults}</p>
              </div>
            )}
            
            {/* Group articles by category */}
            {Object.entries(
              filteredArticles.reduce((groups, article) => {
                const category = article.category;
                if (!groups[category]) {
                  groups[category] = [];
                }
                groups[category].push(article);
                return groups;
              }, {})
            ).map(([category, articles]) => (
              <div key={category} style={{
                background: 'white',
                borderRadius: '15px',
                padding: '30px',
                boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
                transition: 'transform 0.3s ease',
                cursor: 'pointer'
              }}>
                <h2 style={{
                  color: '#2E3192',
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  marginBottom: '20px',
                  paddingBottom: '15px',
                  borderBottom: '2px solid #f0f0f0'
                }}>
                  {category}
                </h2>
                
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {articles.map((article) => (
                    <li key={article.id} style={{ marginBottom: '12px' }}>
                      <button
                        onClick={() => setSelectedArticle(article)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#555',
                          fontSize: '15px',
                          cursor: 'pointer',
                          padding: '10px',
                          borderRadius: '8px',
                          transition: 'all 0.3s ease',
                          width: '100%',
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.background = '#f8f9fa';
                          e.target.style.color = '#2E3192';
                          e.target.style.paddingLeft = '15px';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.background = 'none';
                          e.target.style.color = '#555';
                          e.target.style.paddingLeft = '10px';
                        }}
                      >
                        <span style={{
                          marginRight: '10px',
                          color: '#96FAC2',
                          fontWeight: 'bold'
                        }}>
                          →
                        </span>
                        {article.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <footer style={{
          textAlign: 'center',
          marginTop: '50px',
          padding: '20px',
          color: '#666',
          fontSize: '14px'
        }}>
          <p>{t.copyright}</p>
          <p>{t.needHelp} <a href="mailto:support@directhomeservice.com" style={{ color: '#2E3192' }}>{t.contactSupport}</a></p>
        </footer>

        {/* Language Switcher - Fixed width */}
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: '25%',
          transform: 'translateX(-50%)',
          zIndex: 1000
        }}>
          {showLanguages && (
            <div style={{
              background: '#2a2a2a',
              borderRadius: '8px 8px 0 0',
              boxShadow: '0 -2px 10px rgba(0,0,0,0.3)',
              marginBottom: '0',
              overflow: 'hidden',
              width: '172px'
            }}>
              <div
                onClick={() => {
                  setCurrentLanguage('en');
                  setShowLanguages(false);
                }}
                style={{
                  padding: '10px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  backgroundColor: currentLanguage === 'en' ? '#3a3a3a' : 'transparent',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3a3a3a'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = currentLanguage === 'en' ? '#3a3a3a' : 'transparent'}
              >
                <span style={{ fontSize: '16px' }}>🇺🇸</span>
                <span style={{
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '400',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}>English</span>
              </div>
              <div
                onClick={() => {
                  setCurrentLanguage('es');
                  setShowLanguages(false);
                }}
                style={{
                  padding: '10px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  backgroundColor: currentLanguage === 'es' ? '#3a3a3a' : 'transparent',
                  borderTop: '1px solid #444',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3a3a3a'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = currentLanguage === 'es' ? '#3a3a3a' : 'transparent'}
              >
                <span style={{ fontSize: '16px' }}>🇪🇸</span>
                <span style={{
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '400',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}>Español</span>
              </div>
            </div>
          )}
          
          {!showLanguages && (
            <div
              onClick={() => setShowLanguages(true)}
              style={{
                background: '#2a2a2a',
                padding: '10px 16px',
                borderRadius: '8px 8px 0 0',
                boxShadow: '0 -2px 10px rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '140px',
                cursor: 'pointer'
              }}
            >
              <span style={{ fontSize: '16px' }}>
                {currentLanguage === 'en' ? '🇺🇸' : '🇪🇸'}
              </span>
              <span style={{
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '400',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}>
                {currentLanguage === 'en' ? 'English' : 'Español'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const App = () => {
  React.useEffect(() => {
    // Set document title
    document.title = 'Direct Home Service - Knowledge Base';
    
    // Add global font
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  return <KnowledgeBase />;
};

export default App;