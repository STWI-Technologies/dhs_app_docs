import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageLink } from '../routes/AppRoutes';

const ArticlePage = () => {
  const { t } = useTranslation();
  const { articleId } = useParams();
  const { currentLanguage, formatDate } = useLanguage();
  
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock article data
  const mockArticle = {
    id: articleId,
    title: 'How to Create a New Customer Account',
    content: `
      <h2>Introduction</h2>
      <p>Creating a new customer account is one of the most fundamental tasks in our system. This guide will walk you through the entire process step by step.</p>
      
      <h2>Prerequisites</h2>
      <ul>
        <li>Access to the customer management system</li>
        <li>Customer's basic information</li>
        <li>Valid contact details</li>
      </ul>
      
      <h2>Step-by-Step Process</h2>
      <h3>1. Navigate to Customer Management</h3>
      <p>Start by accessing the customer management module from the main dashboard.</p>
      
      <h3>2. Click "Add New Customer"</h3>
      <p>Look for the "Add New Customer" button, typically located in the top-right corner of the screen.</p>
      
      <h3>3. Fill Required Information</h3>
      <p>Complete all mandatory fields including:</p>
      <ul>
        <li>Full name</li>
        <li>Email address</li>
        <li>Phone number</li>
        <li>Service address</li>
      </ul>
      
      <h2>Best Practices</h2>
      <p>Always verify customer information before saving the account to ensure accuracy and avoid future complications.</p>
      
      <h2>Troubleshooting</h2>
      <p>If you encounter any issues during account creation, contact the support team immediately.</p>
    `,
    category: 'Customer Management',
    author: 'Support Team',
    lastUpdated: new Date('2024-01-15'),
    readTime: 5,
    views: 1240,
    tags: ['customer', 'account', 'setup', 'guide'],
    relatedArticles: [
      { id: '2', title: 'Editing Customer Information' },
      { id: '3', title: 'Customer Account Types' },
      { id: '4', title: 'Managing Customer Preferences' }
    ]
  };

  useEffect(() => {
    const loadArticle = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 600));
        setArticle(mockArticle);
      } catch (err) {
        setError(t('errors.serverError'));
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [articleId, currentLanguage]);

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
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #2E3192',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginRight: '15px'
        }}></div>
        {t('common.loading')}
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
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

  if (!article) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '60px 20px'
      }}>
        <h2>{t('errors.pageNotFound')}</h2>
        <p>{t('errors.pageNotFoundDescription')}</p>
        <LanguageLink to="/" style={{
          color: '#2E3192',
          textDecoration: 'none',
          fontWeight: '500'
        }}>
          ← {t('navigation.home')}
        </LanguageLink>
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
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {/* Article Header */}
        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '40px',
          marginBottom: '30px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            marginBottom: '20px'
          }}>
            <LanguageLink to="/" style={{
              color: '#2E3192',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500',
              marginRight: '15px'
            }}>
              ← {t('navigation.home')}
            </LanguageLink>
            <span style={{
              background: '#f0f8ff',
              color: '#2E3192',
              padding: '4px 12px',
              borderRadius: '15px',
              fontSize: '12px',
              fontWeight: '500'
            }}>
              {article.category}
            </span>
          </div>

          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: '#2E3192',
            marginBottom: '20px',
            lineHeight: '1.2'
          }}>
            {article.title}
          </h1>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '20px',
            fontSize: '14px',
            color: '#666',
            marginBottom: '20px'
          }}>
            <span>{t('common.lastUpdated', { date: formatDate(article.lastUpdated) })}</span>
            <span>{t('article.estimatedReadTime', { minutes: article.readTime })}</span>
            <span>{t('article.articleViews', { count: article.views })}</span>
          </div>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            {article.tags.map(tag => (
              <span
                key={tag}
                style={{
                  background: '#f8f9fa',
                  color: '#666',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  border: '1px solid #e0e0e0'
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Article Content */}
        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '40px',
          marginBottom: '30px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
          lineHeight: '1.7'
        }}>
          <div
            style={{
              fontSize: '16px',
              color: '#333'
            }}
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>

        {/* Article Actions */}
        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '30px',
          marginBottom: '30px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{
            fontSize: '1.2rem',
            fontWeight: '600',
            color: '#333',
            marginBottom: '20px'
          }}>
            {t('common.helpful')}
          </h3>
          
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '15px'
          }}>
            <button style={{
              padding: '10px 25px',
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              cursor: 'pointer',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: '500',
              transition: 'all 0.3s ease'
            }}>
              👍 {t('common.yes')}
            </button>
            <button style={{
              padding: '10px 25px',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              cursor: 'pointer',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: '500',
              transition: 'all 0.3s ease'
            }}>
              👎 {t('common.no')}
            </button>
          </div>
        </div>

        {/* Related Articles */}
        {article.relatedArticles && article.relatedArticles.length > 0 && (
          <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '30px',
            boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{
              fontSize: '1.4rem',
              fontWeight: '600',
              color: '#2E3192',
              marginBottom: '20px'
            }}>
              {t('article.relatedArticles')}
            </h3>
            
            <div style={{
              display: 'grid',
              gap: '15px'
            }}>
              {article.relatedArticles.map(related => (
                <LanguageLink
                  key={related.id}
                  to={`/article/${related.id}`}
                  style={{
                    display: 'block',
                    padding: '15px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: '#2E3192',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.borderColor = '#2E3192';
                    e.target.style.backgroundColor = '#f8f9ff';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.borderColor = '#e0e0e0';
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  📄 {related.title}
                </LanguageLink>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticlePage;