import React from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageLink } from '../routes/AppRoutes';

const NotFound = () => {
  const { t } = useTranslation();

  return (
    <div style={{
      fontFamily: 'Poppins, sans-serif',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '60px 40px',
        textAlign: 'center',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 15px 40px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          fontSize: '6rem',
          marginBottom: '20px',
          lineHeight: '1'
        }}>
          🔍
        </div>
        
        <h1 style={{
          fontSize: '3rem',
          fontWeight: '700',
          color: '#2E3192',
          marginBottom: '15px'
        }}>
          404
        </h1>
        
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          color: '#333',
          marginBottom: '15px'
        }}>
          {t('errors.pageNotFound')}
        </h2>
        
        <p style={{
          color: '#666',
          fontSize: '16px',
          lineHeight: '1.6',
          marginBottom: '30px'
        }}>
          {t('errors.pageNotFoundDescription')}
        </p>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          alignItems: 'center'
        }}>
          <LanguageLink
            to="/"
            style={{
              display: 'inline-block',
              padding: '15px 30px',
              background: 'linear-gradient(135deg, #2E3192 0%, #5158bb 100%)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '25px',
              fontWeight: '500',
              fontSize: '16px',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(46, 49, 146, 0.3)'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 25px rgba(46, 49, 146, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(46, 49, 146, 0.3)';
            }}
          >
            🏠 {t('navigation.home')}
          </LanguageLink>
          
          <LanguageLink
            to="/search"
            style={{
              color: '#2E3192',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500',
              padding: '10px 20px',
              border: '2px solid #2E3192',
              borderRadius: '20px',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#2E3192';
              e.target.style.color = 'white';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#2E3192';
            }}
          >
            🔍 {t('search.button')}
          </LanguageLink>
        </div>
        
        <div style={{
          marginTop: '40px',
          padding: '20px',
          background: '#f8f9fa',
          borderRadius: '10px',
          border: '1px solid #e0e0e0'
        }}>
          <h4 style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: '#333',
            marginBottom: '10px'
          }}>
            {t('quickLinks.title')}
          </h4>
          
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            justifyContent: 'center'
          }}>
            <LanguageLink
              to="/category/core-operations"
              style={{
                color: '#666',
                textDecoration: 'none',
                fontSize: '13px',
                padding: '5px 10px',
                border: '1px solid #d0d0d0',
                borderRadius: '15px',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.borderColor = '#2E3192';
                e.target.style.color = '#2E3192';
              }}
              onMouseOut={(e) => {
                e.target.style.borderColor = '#d0d0d0';
                e.target.style.color = '#666';
              }}
            >
              {t('categories.coreOperations')}
            </LanguageLink>
            
            <LanguageLink
              to="/category/customer-management"
              style={{
                color: '#666',
                textDecoration: 'none',
                fontSize: '13px',
                padding: '5px 10px',
                border: '1px solid #d0d0d0',
                borderRadius: '15px',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.borderColor = '#2E3192';
                e.target.style.color = '#2E3192';
              }}
              onMouseOut={(e) => {
                e.target.style.borderColor = '#d0d0d0';
                e.target.style.color = '#666';
              }}
            >
              {t('categories.customerManagement')}
            </LanguageLink>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;