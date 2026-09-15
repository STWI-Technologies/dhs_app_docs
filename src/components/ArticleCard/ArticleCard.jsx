import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import './ArticleCard.css';

const PLATFORM_LABELS = {
  web: 'WEB',
  app: 'APP',
  client: 'CLIENT'
};

export default function ArticleCard({ article, onClick }) {
  const { getLocalized } = useLanguage();
  const localized = getLocalized(article);
  // A card that is only CLIENT sits on the client side of the toggle, where the
  // badge repeats what the toggle already said. The badge earns its place on a
  // provider article that ALSO touches the portal.
  const allPlatforms = article.platforms || [];
  const platforms = allPlatforms.length === 1 && allPlatforms[0] === 'client' ? [] : allPlatforms;

  return (
    <div className="article-card" onClick={() => onClick(article)} role="button" tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onClick(article); }}>
      <div className="article-card__icon" aria-hidden="true">
        {article.icon && <article.icon size={22} color="#3b40c4" variant="stroke" />}
      </div>
      <div className="article-card__body">
        <div className="article-card__heading">
          <h3 className="article-card__title">{localized.title}</h3>
          {platforms.map(p => (
            <span
              key={p}
              className={`article-card__badge article-card__badge--${p}`}
            >
              {PLATFORM_LABELS[p] || p}
            </span>
          ))}
        </div>
        <p className="article-card__overview">{localized.overview}</p>
      </div>
    </div>
  );
}
