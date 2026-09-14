import React from 'react';
import ArticleCard from '../ArticleCard/ArticleCard';
import './CategorySection.css';

/**
 * One section of the home page: a heading with its article count, then the
 * cards. `category` is optional, so the same component renders the client
 * portal side, which is a flat list of cards with no heading at all.
 */
export default function CategorySection({
  category,
  articles,
  countLabel,
  onSelectArticle
}) {
  return (
    <section className="category-section">
      {category && (
        <header className="category-section__header">
          <h2 className="category-section__title">{category}</h2>
          {countLabel && <span className="category-section__count">{countLabel}</span>}
        </header>
      )}
      <div className="category-section__grid">
        {articles.map(article => (
          <ArticleCard key={article.id} article={article} onClick={onSelectArticle} />
        ))}
      </div>
    </section>
  );
}
