import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useLanguageNavigate, LanguageLink } from '../routes/AppRoutes';

const CategoryPage = () => {
  const { t } = useTranslation();
  const { categoryId } = useParams();
  const { currentLanguage } = useLanguage();
  const navigate = useLanguageNavigate();
  
  const [category, setCategory] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock data
  const mockCategory = {
    id: categoryId,
    title: t(`categories.${categoryId?.replace('-', '')}`),
    description: 'Articles and resources in this category',
    icon: '📚'
  };

  const mockArticles = [
    {
      id: '1',
      title: 'Getting Started Guide',
      excerpt: 'A comprehensive guide to help you get started with our services.',
      readTime: 5,
      lastUpdated: new Date('2024-01-15'),
      tags: ['beginner', 'guide']
    },
    {
      id: '2',
      title: 'Advanced Procedures',
      excerpt: 'Advanced procedures and best practices for experienced users.',
      readTime: 12,
      lastUpdated: new Date('2024-01-10'),
      tags: ['advanced', 'procedures']
    }
  ];

  useEffect(() => {
    const loadCategoryData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        setCategory(mockCategory);
        setArticles(mockArticles);
      } catch (err) {
        setError(t('errors.serverError'));
      } finally {
        setLoading(false);
      }
    };

    loadCategoryData();
  }, [categoryId, currentLanguage]);

  const handleArticleClick = (articleId) => {
    navigate(`/article/${articleId}`);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px',
        fontSize: '18px',
        color: '#666'
      }}>
        {t('common.loading')}
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '60px 20px',
        color: '#e74c3c'
      }}>
        <h2>{t('common.error')}</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={{
      fontFamily: 'Poppins, sans-serif',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '40px',
          marginBottom: '30px',
          textAlign: 'center',
          boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
        }}>
          <LanguageLink to="/" style={{
            display: 'inline-block',
            color: '#2E3192',
            textDecoration: 'none',
            fontSize: '14px',
            marginBottom: '20px',
            fontWeight: '500'
          }}>
            ← {t('navigation.back')} {t('navigation.home')}
          </LanguageLink>
          
          <div style={{
            fontSize: '3rem',
            marginBottom: '15px'
          }}>
            {category?.icon}
          </div>
          
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: '#2E3192',
            marginBottom: '10px'
          }}>
            {category?.title}
          </h1>
          
          <p style={{
            fontSize: '1.1rem',
            color: '#666',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            {category?.description}
          </p>
        </div>

        {/* Articles List */}
        <div style={{
          display: 'grid',
          gap: '20px'
        }}>
          {articles.map(article => (
            <div
              key={article.id}
              onClick={() => handleArticleClick(article.id)}
              style={{
                background: 'white',
                borderRadius: '10px',
                padding: '25px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: '1px solid #e0e0e0',
                boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.15)';
                e.currentTarget.style.borderColor = '#2E3192';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.05)';
                e.currentTarget.style.borderColor = '#e0e0e0';
              }}
            >
              <h3 style={{
                color: '#2E3192',
                fontSize: '1.4rem',
                fontWeight: '600',
                marginBottom: '10px'
              }}>
                {article.title}
              </h3>
              
              <p style={{
                color: '#666',
                fontSize: '16px',
                lineHeight: '1.6',
                marginBottom: '15px'
              }}>
                {article.excerpt}
              </p>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                fontSize: '14px',
                color: '#888'
              }}>
                <span>{t('article.estimatedReadTime', { minutes: article.readTime })}</span>
                <span>{t('common.lastUpdated', { date: article.lastUpdated.toLocaleDateString() })}</span>
                <div style={{ display: 'flex', gap: '5px' }}>
                  {article.tags.map(tag => (
                    <span
                      key={tag}
                      style={{
                        background: '#f0f8ff',
                        color: '#2E3192',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontSize: '12px'
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;