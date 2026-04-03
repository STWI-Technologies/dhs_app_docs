import React from 'react';
import ArticleCard from '../ArticleCard/ArticleCard';
import './CategorySection.css';

export default function CategorySection({ category, articles, onSelectArticle }) {
  return (
    <section className="category-section">
      <h2 className="category-section__title">
        {category}
      </h2>
      <div className="category-section__grid">
        {articles.map(article => (
          <ArticleCard key={article.id} article={article} onClick={onSelectArticle} />
        ))}
      </div>
    </section>
  );
}
