import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';
import { useLanguageNavigate } from '../routes/AppRoutes';

// Import components (these would be created separately)
// import Header from '../components/Header';
// import SearchBar from '../components/SearchBar';
// import CategoryGrid from '../components/CategoryGrid';

// Placeholder components for now
const Header = ({ title, subtitle }) => (
  <header style={{
    textAlign: 'center',
    marginBottom: '50px',
    padding: '40px 20px',
    background: 'linear-gradient(135deg, #2E3192 0%, #5158bb 100%)',
    color: 'white',
    borderRadius: '15px',
    boxShadow: '0 10px 30px rgba(46, 49, 146, 0.3)'
  }}>
    <h1 style={{
      fontSize: '2.5rem',
      fontWeight: '700',
      marginBottom: '10px',
      textShadow: '0 2px 4px rgba(0,0,0,0.3)'
    }}>
      {title}
    </h1>
    <p style={{
      fontSize: '1.2rem',
      fontWeight: '400',
      opacity: '0.9'
    }}>
      {subtitle}
    </p>
  </header>
);

const SearchBar = ({ onSearch, onModeChange, searchMode }) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto 60px auto',
      background: 'white',
      borderRadius: '15px',
      padding: '30px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
      border: '2px solid #f0f0f0'
    }}>
      {/* Search Mode Tabs */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        justifyContent: 'center'
      }}>
        <button
          type="button"
          onClick={() => onModeChange('local')}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderRadius: '25px',
            cursor: 'pointer',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: '500',
            transition: 'all 0.3s ease',
            background: searchMode === 'local' 
              ? 'linear-gradient(135deg, #2E3192 0%, #5158bb 100%)' 
              : '#f8f9fa',
            color: searchMode === 'local' ? 'white' : '#666'
          }}
        >
          {t('search.localSearch')}
        </button>
        <button
          type="button"
          onClick={() => onModeChange('external')}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderRadius: '25px',
            cursor: 'pointer',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: '500',
            transition: 'all 0.3s ease',
            background: searchMode === 'external' 
              ? 'linear-gradient(135deg, #2E3192 0%, #5158bb 100%)' 
              : '#f8f9fa',
            color: searchMode === 'external' ? 'white' : '#666'
          }}
        >
          {t('search.externalSearch')}
        </button>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} style={{
        display: 'flex',
        gap: '15px',
        alignItems: 'center'
      }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('search.placeholder')}
          style={{
            flex: 1,
            padding: '15px 20px',
            border: '2px solid #e0e0e0',
            borderRadius: '25px',
            fontSize: '16px',
            fontFamily: 'Poppins, sans-serif',
            outline: 'none',
            transition: 'border-color 0.3s ease'
          }}
          onFocus={(e) => e.target.style.borderColor = '#2E3192'}
          onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
        />
        <button
          type="submit"
          style={{
            padding: '15px 30px',
            background: 'linear-gradient(135deg, #2E3192 0%, #5158bb 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '25px',
            cursor: 'pointer',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: '500',
            fontSize: '16px',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(46, 49, 146, 0.3)'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(46, 49, 146, 0.4)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 15px rgba(46, 49, 146, 0.3)';
          }}
        >
          {t('search.button')}
        </button>
      </form>

      {searchMode === 'external' && (
        <p style={{
          textAlign: 'center',
          color: '#6b7280',
          fontSize: '14px',
          marginTop: '15px'
        }}>
          {t('search.externalDescription')}
        </p>
      )}
    </div>
  );
};

const CategoryGrid = ({ categories, onCategoryClick }) => {
  const { t } = useTranslation();

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '30px',
      marginBottom: '50px'
    }}>
      {categories.map((category) => (
        <div
          key={category.id}
          onClick={() => onCategoryClick(category.id)}
          style={{
            background: 'white',
            borderRadius: '15px',
            padding: '30px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
            border: '2px solid #f0f0f0'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.15)';
            e.currentTarget.style.borderColor = '#2E3192';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 5px 20px rgba(0,0,0,0.08)';
            e.currentTarget.style.borderColor = '#f0f0f0';
          }}
        >
          <div style={{
            fontSize: '2.5rem',
            marginBottom: '15px',
            textAlign: 'center'
          }}>
            {category.icon}
          </div>
          <h3 style={{
            fontSize: '1.4rem',
            fontWeight: '600',
            color: '#2E3192',
            marginBottom: '10px',
            textAlign: 'center'
          }}>
            {t(`categories.${category.key}`)}
          </h3>
          <p style={{
            color: '#666',
            fontSize: '14px',
            textAlign: 'center',
            marginBottom: '15px'
          }}>
            {category.description}
          </p>
          <div style={{
            textAlign: 'center',
            color: '#888',
            fontSize: '12px',
            fontWeight: '500'
          }}>
            {category.articleCount} {t('categories.articles')}
          </div>
        </div>
      ))}
    </div>
  );
};

const KnowledgeBase = () => {
  const { t } = useTranslation();
  const { currentLanguage, isLoading: langLoading } = useLanguage();
  const navigate = useLanguageNavigate();
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchMode, setSearchMode] = useState('local');

  // Mock categories data - would be fetched from API
  const mockCategories = [
    {
      id: 'core-operations',
      key: 'coreOperations',
      icon: '⚙️',
      description: 'Essential business processes and procedures',
      articleCount: 24
    },
    {
      id: 'customer-management',
      key: 'customerManagement',
      icon: '👥',
      description: 'Customer service and relationship management',
      articleCount: 18
    },
    {
      id: 'services-products',
      key: 'servicesProducts',
      icon: '🏠',
      description: 'Available services and product information',
      articleCount: 32
    },
    {
      id: 'reports-analytics',
      key: 'reportsAnalytics',
      icon: '📊',
      description: 'Reports, analytics, and performance metrics',
      articleCount: 15
    },
    {
      id: 'financial-reports',
      key: 'financialReports',
      icon: '💰',
      description: 'Financial reporting and accounting procedures',
      articleCount: 12
    },
    {
      id: 'operations-compliance',
      key: 'operationsCompliance',
      icon: '📋',
      description: 'Operational procedures and compliance requirements',
      articleCount: 20
    }
  ];

  // Load categories data
  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        setCategories(mockCategories);
      } catch (err) {
        setError(t('errors.serverError'));
        console.error('Error loading categories:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, [t]);

  // Handle search
  const handleSearch = (query) => {
    if (searchMode === 'local') {
      navigate(`/search?q=${encodeURIComponent(query)}&mode=local`);
    } else {
      // For external search, redirect to LiveAgent
      window.open(`https://directhomeservice.ladesk.com/search?q=${encodeURIComponent(query)}&type=search`, '_blank');
    }
  };

  // Handle category click
  const handleCategoryClick = (categoryId) => {
    navigate(`/category/${categoryId}`);
  };

  // Handle search mode change
  const handleSearchModeChange = (mode) => {
    setSearchMode(mode);
  };

  if (langLoading || loading) {
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
          textAlign: 'center'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #2E3192',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          {t('common.loading')}
        </div>
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
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            background: '#2E3192',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          {t('common.retry')}
        </button>
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
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <Header 
          title={t('header.title')}
          subtitle={t('header.subtitle')}
        />

        {/* Search Bar */}
        <SearchBar
          onSearch={handleSearch}
          onModeChange={handleSearchModeChange}
          searchMode={searchMode}
        />

        {/* Categories Grid */}
        <CategoryGrid
          categories={categories}
          onCategoryClick={handleCategoryClick}
        />

        {/* Language indicator for debugging */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            fontSize: '12px'
          }}>
            Current Language: {currentLanguage}
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeBase;