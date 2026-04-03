import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import './ArticleCard.css';

export default function ArticleCard({ article, onClick }) {
  const { getLocalized } = useLanguage();
  const localized = getLocalized(article);

  return (
    <div className="article-card" onClick={() => onClick(article)} role="button" tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onClick(article); }}>
      <div className="article-card__icon">
        {article.icon && <article.icon size={26} color="#2E3192" variant="stroke" />}
      </div>
      <div className="article-card__body">
        <h3 className="article-card__title">{localized.title}</h3>
        <p className="article-card__overview">{localized.overview}</p>
      </div>
      <div className="article-card__arrow">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </div>
    </div>
  );
}
