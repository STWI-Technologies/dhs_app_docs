import React from 'react';
import PropTypes from 'prop-types';
import { useLanguage } from '../LanguageSwitcher/LanguageContext';
import styles from './ArticleCard.module.css';

const ArticleCard = ({ 
  article,
  showCategory = true,
  showExcerpt = true,
  showReadTime = false,
  showLastUpdated = true,
  onCardClick
}) => {
  const { language } = useLanguage();

  if (!article) {
    return null;
  }

  const getLocalizedText = (textObj) => {
    if (typeof textObj === 'string') return textObj;
    return textObj[language] || textObj.en || textObj;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      };
      
      return date.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', options);
    } catch (error) {
      return dateString;
    }
  };

  const handleClick = (e) => {
    if (onCardClick) {
      e.preventDefault();
      onCardClick(article);
    }
  };

  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && onCardClick) {
      e.preventDefault();
      onCardClick(article);
    }
  };

  // Extract excerpt from content if available
  const getExcerpt = () => {
    if (article.excerpt) {
      return getLocalizedText(article.excerpt);
    }
    
    if (article.content && article.content.overview) {
      return getLocalizedText(article.content.overview).substring(0, 150) + '...';
    }
    
    return language === 'es' 
      ? 'Haga clic para leer más sobre este tema.'
      : 'Click to read more about this topic.';
  };

  const readTimeText = {
    en: { 
      min: 'min read',
      mins: 'mins read'
    },
    es: { 
      min: 'min de lectura',
      mins: 'mins de lectura'
    }
  };

  const lastUpdatedText = {
    en: 'Last updated',
    es: 'Última actualización'
  };

  const readMoreText = {
    en: 'Read More',
    es: 'Leer Más'
  };

  const categoryColors = {
    'Core Operations': '#2E3192',
    'Customer Management': '#4CAF50',
    'Services & Products': '#FF9800',
    'Reports & Analytics': '#9C27B0',
    'Financial Reports': '#F44336',
    'Operations & Compliance': '#607D8B'
  };

  const categoryColor = categoryColors[article.category] || '#2E3192';

  return (
    <article 
      className={styles.articleCard}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={onCardClick ? 0 : -1}
      role={onCardClick ? 'button' : 'article'}
      aria-label={`Read article: ${getLocalizedText(article.title)}`}
    >
      {/* Category Badge */}
      {showCategory && article.category && (
        <div 
          className={styles.categoryBadge}
          style={{ backgroundColor: categoryColor }}
          aria-label={`Category: ${getLocalizedText(article.category)}`}
        >
          {getLocalizedText(article.category)}
        </div>
      )}

      {/* Article Header */}
      <header className={styles.articleHeader}>
        <h3 className={styles.articleTitle}>
          {getLocalizedText(article.title)}
        </h3>
        
        {/* Article Meta */}
        <div className={styles.articleMeta}>
          {showReadTime && article.readTime && (
            <span className={styles.readTime} aria-label={`Reading time: ${article.readTime} minutes`}>
              {article.readTime} {article.readTime === 1 
                ? readTimeText[language].min 
                : readTimeText[language].mins
              }
            </span>
          )}
          
          {showLastUpdated && article.lastUpdated && (
            <span className={styles.lastUpdated} aria-label={`${lastUpdatedText[language]}: ${formatDate(article.lastUpdated)}`}>
              {lastUpdatedText[language]}: {formatDate(article.lastUpdated)}
            </span>
          )}
        </div>
      </header>

      {/* Article Content */}
      {showExcerpt && (
        <div className={styles.articleContent}>
          <p className={styles.excerpt}>
            {getExcerpt()}
          </p>
        </div>
      )}

      {/* Article Keywords/Tags */}
      {article.keywords && article.keywords.length > 0 && (
        <div className={styles.keywordTags}>
          {article.keywords.slice(0, 3).map((keyword, index) => (
            <span 
              key={index} 
              className={styles.keywordTag}
              aria-label={`Tag: ${keyword}`}
            >
              {keyword}
            </span>
          ))}
          {article.keywords.length > 3 && (
            <span 
              className={styles.moreKeywords}
              aria-label={`${article.keywords.length - 3} more tags`}
            >
              +{article.keywords.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Read More Button */}
      <footer className={styles.articleFooter}>
        <a
          href={article.url}
          className={styles.readMoreLink}
          onClick={handleClick}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${readMoreText[language]}: ${getLocalizedText(article.title)}`}
        >
          {readMoreText[language]}
          <span className={styles.readMoreIcon} aria-hidden="true">→</span>
        </a>
        
        {/* Article Indicators */}
        <div className={styles.articleIndicators}>
          {article.isNew && (
            <span className={styles.newIndicator} aria-label="New article">
              {language === 'es' ? 'Nuevo' : 'New'}
            </span>
          )}
          {article.isUpdated && (
            <span className={styles.updatedIndicator} aria-label="Recently updated">
              {language === 'es' ? 'Actualizado' : 'Updated'}
            </span>
          )}
          {article.isFeatured && (
            <span className={styles.featuredIndicator} aria-label="Featured article">
              {language === 'es' ? 'Destacado' : 'Featured'}
            </span>
          )}
        </div>
      </footer>
    </article>
  );
};

ArticleCard.propTypes = {
  article: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        en: PropTypes.string,
        es: PropTypes.string
      })
    ]).isRequired,
    url: PropTypes.string.isRequired,
    category: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        en: PropTypes.string,
        es: PropTypes.string
      })
    ]),
    excerpt: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        en: PropTypes.string,
        es: PropTypes.string
      })
    ]),
    content: PropTypes.shape({
      overview: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          en: PropTypes.string,
          es: PropTypes.string
        })
      ])
    }),
    keywords: PropTypes.arrayOf(PropTypes.string),
    lastUpdated: PropTypes.string,
    readTime: PropTypes.number,
    isNew: PropTypes.bool,
    isUpdated: PropTypes.bool,
    isFeatured: PropTypes.bool
  }).isRequired,
  showCategory: PropTypes.bool,
  showExcerpt: PropTypes.bool,
  showReadTime: PropTypes.bool,
  showLastUpdated: PropTypes.bool,
  onCardClick: PropTypes.func
};

export default ArticleCard;