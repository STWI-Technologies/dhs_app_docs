import React, { useState, useMemo } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import Header from './components/Header/Header';
import SearchBar from './components/SearchBar/SearchBar';
import CategorySection from './components/CategorySection/CategorySection';
import ArticleView from './components/ArticleView/ArticleView';
import LanguageSwitcher from './components/LanguageSwitcher/LanguageSwitcher';
import Footer from './components/Footer/Footer';
import articles, { categoryOrder } from './data/articles';
import './App.css';

function KnowledgeBase() {
  const [selectedArticle, setSelectedArticle] = useState(null);
  const { getLocalized, t } = useLanguage();

  // Group by English category key, display with localized name
  const categoryGroups = useMemo(() => {
    const grouped = {};
    articles.forEach(article => {
      const enCat = article.en.category; // always group by English key
      if (!grouped[enCat]) grouped[enCat] = [];
      grouped[enCat].push(article);
    });
    // Sort by defined order
    return categoryOrder
      .filter(cat => grouped[cat])
      .map(cat => ({
        key: cat,
        label: getLocalized({ en: { text: cat }, es: { text: articles.find(a => a.en.category === cat)?.es.category || cat } }).text,
        articles: grouped[cat]
      }));
  }, [getLocalized]);

  const handleBack = () => setSelectedArticle(null);

  return (
    <div className="app">
      <div className="app__container">
        <Header onLogoClick={handleBack} />

        {selectedArticle ? (
          <ArticleView article={selectedArticle} onBack={handleBack} />
        ) : (
          <>
            <SearchBar onSelectArticle={setSelectedArticle} />

            <div className="app__categories-grid">
              {categoryGroups.map(group => (
                <CategorySection
                  key={group.key}
                  category={group.label}
                  articles={group.articles}
                  onSelectArticle={setSelectedArticle}
                />
              ))}
            </div>
          </>
        )}

        <Footer />
      </div>

      <LanguageSwitcher />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <KnowledgeBase />
    </LanguageProvider>
  );
}
