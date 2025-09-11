import React, { useState, useEffect } from 'react';

const KnowledgeBase = () => {
  const [language, setLanguage] = useState('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [knowledgeData, setKnowledgeData] = useState(null);

  useEffect(() => {
    // Load knowledge base content
    import('../data/knowledge-base-content.json')
      .then(data => setKnowledgeData(data.default))
      .catch(error => {
        console.error('Error loading knowledge base:', error);
        // Fallback content
        setKnowledgeData({
          en: {
            title: "Direct Home Service - Knowledge Base",
            subtitle: "Customer Service Knowledge Base Portal",
            searchPlaceholder: "Search the knowledge base...",
            categories: [],
            quickLinks: []
          },
          es: {
            title: "Direct Home Service - Base de Conocimientos",
            subtitle: "Portal de Base de Conocimientos de Atención al Cliente",
            searchPlaceholder: "Buscar en la base de conocimientos...",
            categories: [],
            quickLinks: []
          }
        });
      });
  }, []);

  const handleLanguageSwitch = (lang) => {
    setLanguage(lang);
    document.documentElement.lang = lang;
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const content = knowledgeData ? knowledgeData[language] : null;

  if (!content) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <header>
        <h1>{content.title}</h1>
        <p className="subtitle">{content.subtitle}</p>
        
        <div className="search-container">
          <input 
            type="text" 
            className="search-box" 
            placeholder={content.searchPlaceholder}
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </header>

      <main>
        <div className="categories-grid">
          {content.categories && content.categories.map((category, index) => (
            <div key={index} className="category-section">
              <h2 className="category-title">
                <div className="category-icon">{category.icon}</div>
                {category.title}
              </h2>
              <ul className="article-list">
                {category.articles && category.articles.map((article, articleIndex) => (
                  <li key={articleIndex}>
                    <a href={article.link} className="article-link">
                      {article.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="quick-links">
          <h2 className="quick-links-title">
            <div className="category-icon">⚡</div>
            {content.quickLinksTitle || 'Quick Links'}
          </h2>
          <div className="quick-links-grid">
            {content.quickLinks && content.quickLinks.map((link, index) => (
              <a key={index} href={link.url} className="quick-link">
                {link.title}
              </a>
            ))}
          </div>
        </div>
      </main>

      <div className="language-switcher">
        <button 
          className={`language-btn ${language === 'en' ? 'active' : ''}`}
          onClick={() => handleLanguageSwitch('en')}
        >
          <div className="flag flag-us"></div>
          English
        </button>
        <button 
          className={`language-btn ${language === 'es' ? 'active' : ''}`}
          onClick={() => handleLanguageSwitch('es')}
        >
          <div className="flag flag-es"></div>
          Español
        </button>
      </div>
    </div>
  );
};

export default KnowledgeBase;