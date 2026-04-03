import React, { useMemo } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import Header from './components/Header/Header';
import SearchBar from './components/SearchBar/SearchBar';
import CategorySection from './components/CategorySection/CategorySection';
import ArticleView from './components/ArticleView/ArticleView';
import LanguageSwitcher from './components/LanguageSwitcher/LanguageSwitcher';
import Footer from './components/Footer/Footer';
import ChatButton from './components/ChatButton/ChatButton';
import articles, { categoryOrder } from './data/articles';
import './App.css';

function HomePage() {
  const { getLocalized } = useLanguage();
  const navigate = useNavigate();

  const categoryGroups = useMemo(() => {
    const grouped = {};
    articles.forEach(article => {
      const enCat = article.en.category;
      if (!grouped[enCat]) grouped[enCat] = [];
      grouped[enCat].push(article);
    });
    return categoryOrder
      .filter(cat => grouped[cat])
      .map(cat => ({
        key: cat,
        label: getLocalized({ en: { text: cat }, es: { text: articles.find(a => a.en.category === cat)?.es.category || cat } }).text,
        articles: grouped[cat]
      }));
  }, [getLocalized]);

  const handleSelectArticle = (article) => {
    navigate(`/articles/${article.id}`);
  };

  return (
    <>
      <SearchBar onSelectArticle={handleSelectArticle} />
      <div className="app__categories-grid">
        {categoryGroups.map(group => (
          <CategorySection
            key={group.key}
            category={group.label}
            articles={group.articles}
            onSelectArticle={handleSelectArticle}
          />
        ))}
      </div>
    </>
  );
}

function ArticlePage() {
  const { articleId } = useParams();
  const navigate = useNavigate();
  const article = articles.find(a => a.id === articleId);

  if (!article) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
        <h2>Article not found</h2>
        <p>The article you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate('/')}
          style={{
            marginTop: '16px', padding: '10px 24px', background: '#2E3192',
            color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer',
            fontFamily: 'Poppins, sans-serif', fontSize: '14px'
          }}
        >
          Back to Knowledge Base
        </button>
      </div>
    );
  }

  return <ArticleView article={article} onBack={() => navigate('/')} />;
}

function Shell() {
  const navigate = useNavigate();

  return (
    <div className="app">
      <div className="app__container">
        <Header onLogoClick={() => navigate('/')} />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/articles/:articleId" element={<ArticlePage />} />
        </Routes>
        <Footer />
      </div>
      <LanguageSwitcher />
      <ChatButton />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Shell />
      </BrowserRouter>
    </LanguageProvider>
  );
}
