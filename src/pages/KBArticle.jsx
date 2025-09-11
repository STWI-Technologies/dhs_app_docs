import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header/Header';
import LanguageSwitcher from '../components/LanguageSwitcher/LanguageSwitcher';
import './KBArticle.css';

// Import knowledge base content
import kbContent from '../data/knowledge-base-content.json';

const KBArticle = () => {
  const { articleId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Find article by URL slug
    const foundArticle = kbContent.articles.find(a => {
      const slug = a.title.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '');
      return slug === articleId;
    });

    if (foundArticle) {
      setArticle(foundArticle);
    }
    setLoading(false);
  }, [articleId]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container">
        <Header />
        <div className="error-container">
          <h2>{t('errors.articleNotFound')}</h2>
          <p>{t('errors.articleNotFoundDesc')}</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            {t('common.backToHome')}
          </button>
        </div>
        <LanguageSwitcher />
      </div>
    );
  }

  return (
    <div className="container">
      <Header />
      
      <div className="breadcrumb">
        <a href="/">{t('common.home')}</a>
        <span> / </span>
        <a href={`/category/${article.category.toLowerCase().replace(/\s+/g, '-')}`}>
          {article.category}
        </a>
        <span> / </span>
        <span>{article.title}</span>
      </div>

      <article className="kb-article">
        <h1>{article.title}</h1>
        
        <div className="article-meta">
          <span className="category-badge">{article.category}</span>
          <span className="last-updated">
            {t('article.lastUpdated')}: {new Date().toLocaleDateString(i18n.language)}
          </span>
        </div>

        <div className="article-content">
          {article.content.overview && (
            <section>
              <h2>{t('article.overview')}</h2>
              <p>{article.content.overview}</p>
            </section>
          )}

          {article.content.keyFeatures && (
            <section>
              <h2>{t('article.keyFeatures')}</h2>
              <ul>
                {article.content.keyFeatures.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </section>
          )}

          {article.content.howTo && (
            <section>
              <h2>{t('article.howTo')}</h2>
              <ol>
                {article.content.howTo.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </section>
          )}

          {article.content.importantNotes && (
            <section className="important-notes">
              <h2>{t('article.importantNotes')}</h2>
              <ul>
                {article.content.importantNotes.map((note, index) => (
                  <li key={index}>{note}</li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <div className="article-footer">
          <div className="article-tags">
            {article.keywords && article.keywords.map((keyword, index) => (
              <span key={index} className="tag">{keyword}</span>
            ))}
          </div>

          <div className="article-actions">
            <button className="btn-secondary" onClick={() => window.print()}>
              {t('article.print')}
            </button>
            <button className="btn-secondary" onClick={() => navigator.clipboard.writeText(window.location.href)}>
              {t('article.shareLink')}
            </button>
          </div>
        </div>
      </article>

      <LanguageSwitcher />
    </div>
  );
};

export default KBArticle;