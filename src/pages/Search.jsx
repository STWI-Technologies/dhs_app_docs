import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useLanguageNavigate, LanguageLink } from '../routes/AppRoutes';

const SearchResultItem = ({ result, onArticleClick }) => {
  const { t } = useTranslation();

  return (
    <div
      style={{
        background: 'white',
        borderRadius: '10px',
        padding: '20px',
        marginBottom: '15px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        border: '1px solid #e0e0e0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}
      onClick={() => onArticleClick(result.id)}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
        e.currentTarget.style.borderColor = '#2E3192';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
        e.currentTarget.style.borderColor = '#e0e0e0';
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '15px'
      }}>
        <div style={{
          minWidth: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #2E3192 0%, #5158bb 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '18px'
        }}>
          📄
        </div>
        
        <div style={{ flex: 1 }}>
          <h3 style={{
            color: '#2E3192',
            fontSize: '1.2rem',
            fontWeight: '600',
            marginBottom: '8px',
            lineHeight: '1.3'
          }}>
            {result.title}
          </h3>
          
          <p style={{
            color: '#666',
            fontSize: '14px',
            lineHeight: '1.5',
            marginBottom: '10px'
          }}>
            {result.excerpt}
          </p>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            fontSize: '12px',
            color: '#888'
          }}>
            <span style={{
              background: '#f0f8ff',
              color: '#2E3192',
              padding: '3px 8px',
              borderRadius: '12px',
              fontWeight: '500'
            }}>
              {result.category}
            </span>
            <span>{t('article.estimatedReadTime', { minutes: result.readTime })}</span>
            <span>{t('article.articleViews', { count: result.views })}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const FilterPanel = ({ filters, onFilterChange, categories }) => {
  const { t } = useTranslation();

  return (
    <div style={{
      background: 'white',
      borderRadius: '10px',
      padding: '20px',
      marginBottom: '20px',
      border: '1px solid #e0e0e0'
    }}>
      <h3 style={{
        fontSize: '1.1rem',
        fontWeight: '600',
        color: '#333',
        marginBottom: '15px'
      }}>
        {t('filters.filterBy')}
      </h3>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px'
      }}>
        {/* Category Filter */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: '#555',
            marginBottom: '5px'
          }}>
            {t('filters.category')}
          </label>
          <select
            value={filters.category}
            onChange={(e) => onFilterChange('category', e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d0d0d0',
              borderRadius: '6px',
              fontSize: '14px',
              background: 'white'
            }}
          >
            <option value="">{t('filters.all')}</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {t(`categories.${cat.key}`)}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: '#555',
            marginBottom: '5px'
          }}>
            {t('filters.sortBy')}
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => onFilterChange('sortBy', e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d0d0d0',
              borderRadius: '6px',
              fontSize: '14px',
              background: 'white'
            }}
          >
            <option value="relevance">{t('filters.relevance')}</option>
            <option value="date">{t('filters.date')}</option>
            <option value="title">{t('filters.title')}</option>
          </select>
        </div>
      </div>

      <button
        onClick={() => onFilterChange('reset')}
        style={{
          marginTop: '15px',
          padding: '8px 16px',
          background: 'transparent',
          border: '1px solid #d0d0d0',
          borderRadius: '6px',
          color: '#666',
          cursor: 'pointer',
          fontSize: '14px',
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
        {t('filters.reset')}
      </button>
    </div>
  );
};

const Search = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const navigate = useLanguageNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [searchMode] = useState(searchParams.get('mode') || 'local');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalResults, setTotalResults] = useState(0);
  const [filters, setFilters] = useState({
    category: '',
    sortBy: 'relevance'
  });

  // Mock categories
  const categories = [
    { id: 'core-operations', key: 'coreOperations' },
    { id: 'customer-management', key: 'customerManagement' },
    { id: 'services-products', key: 'servicesProducts' },
    { id: 'reports-analytics', key: 'reportsAnalytics' },
    { id: 'financial-reports', key: 'financialReports' },
    { id: 'operations-compliance', key: 'operationsCompliance' }
  ];

  // Mock search results
  const mockResults = [
    {
      id: '1',
      title: 'How to Create a New Customer Account',
      excerpt: 'Step-by-step guide for creating new customer accounts in the system. Includes required fields, validation rules, and best practices for data entry.',
      category: 'Customer Management',
      readTime: 5,
      views: 1240,
      relevanceScore: 0.95
    },
    {
      id: '2',
      title: 'Processing Service Requests',
      excerpt: 'Complete workflow for handling incoming service requests from initial contact through completion and follow-up.',
      category: 'Core Operations',
      readTime: 8,
      views: 892,
      relevanceScore: 0.87
    },
    {
      id: '3',
      title: 'Monthly Financial Reports',
      excerpt: 'Guidelines for generating and reviewing monthly financial reports, including key metrics and analysis procedures.',
      category: 'Financial Reports',
      readTime: 12,
      views: 567,
      relevanceScore: 0.73
    }
  ];

  // Perform search
  const performSearch = async (searchQuery, currentFilters = filters) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      let filteredResults = [...mockResults];
      
      // Apply category filter
      if (currentFilters.category) {
        filteredResults = filteredResults.filter(result => 
          result.category.toLowerCase().includes(currentFilters.category.toLowerCase())
        );
      }
      
      // Apply sorting
      if (currentFilters.sortBy === 'date') {
        filteredResults.sort((a, b) => b.date - a.date);
      } else if (currentFilters.sortBy === 'title') {
        filteredResults.sort((a, b) => a.title.localeCompare(b.title));
      } else {
        filteredResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
      }

      setResults(filteredResults);
      setTotalResults(filteredResults.length);
    } catch (err) {
      setError(t('errors.searchError'));
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle search on mount and query change
  useEffect(() => {
    const queryParam = searchParams.get('q');
    if (queryParam) {
      setQuery(queryParam);
      performSearch(queryParam);
    }
  }, [searchParams, currentLanguage]);

  // Handle new search
  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query, mode: searchMode });
      performSearch(query);
    }
  };

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    if (filterType === 'reset') {
      const newFilters = { category: '', sortBy: 'relevance' };
      setFilters(newFilters);
      if (query) performSearch(query, newFilters);
    } else {
      const newFilters = { ...filters, [filterType]: value };
      setFilters(newFilters);
      if (query) performSearch(query, newFilters);
    }
  };

  // Handle article click
  const handleArticleClick = (articleId) => {
    navigate(`/article/${articleId}`);
  };

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
          borderRadius: '10px',
          padding: '30px',
          marginBottom: '30px',
          textAlign: 'center',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
        }}>
          <LanguageLink to="/" style={{
            display: 'inline-block',
            color: '#2E3192',
            textDecoration: 'none',
            fontSize: '14px',
            marginBottom: '15px',
            fontWeight: '500'
          }}>
            ← {t('navigation.back')} {t('navigation.home')}
          </LanguageLink>
          
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#2E3192',
            marginBottom: '20px'
          }}>
            {query && t('search.searchResultsFor', { query })}
          </h1>

          {/* Search Form */}
          <form onSubmit={handleSearch} style={{
            display: 'flex',
            gap: '15px',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('search.placeholder')}
              style={{
                flex: 1,
                padding: '12px 20px',
                border: '2px solid #e0e0e0',
                borderRadius: '25px',
                fontSize: '16px',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              style={{
                padding: '12px 25px',
                background: 'linear-gradient(135deg, #2E3192 0%, #5158bb 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '25px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              {t('search.button')}
            </button>
          </form>
        </div>

        {/* Results Section */}
        {query && (
          <div style={{ display: 'flex', gap: '30px' }}>
            {/* Sidebar with filters */}
            <div style={{ minWidth: '280px' }}>
              <FilterPanel
                filters={filters}
                onFilterChange={handleFilterChange}
                categories={categories}
              />
            </div>

            {/* Main results area */}
            <div style={{ flex: 1 }}>
              {loading ? (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 20px'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    border: '4px solid #f3f3f3',
                    borderTop: '4px solid #2E3192',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 20px'
                  }}></div>
                  {t('search.loading')}
                  <style>
                    {`
                      @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                      }
                    `}
                  </style>
                </div>
              ) : error ? (
                <div style={{
                  background: 'white',
                  borderRadius: '10px',
                  padding: '40px',
                  textAlign: 'center',
                  color: '#e74c3c'
                }}>
                  <h3>{t('common.error')}</h3>
                  <p>{error}</p>
                  <button
                    onClick={() => performSearch(query)}
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
              ) : results.length > 0 ? (
                <>
                  <div style={{
                    marginBottom: '20px',
                    fontSize: '16px',
                    color: '#666'
                  }}>
                    {t('search.resultsCount', { count: totalResults })}
                  </div>
                  
                  {results.map(result => (
                    <SearchResultItem
                      key={result.id}
                      result={result}
                      onArticleClick={handleArticleClick}
                    />
                  ))}
                </>
              ) : query ? (
                <div style={{
                  background: 'white',
                  borderRadius: '10px',
                  padding: '40px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '4rem',
                    marginBottom: '20px'
                  }}>
                    🔍
                  </div>
                  <h3 style={{ color: '#666', marginBottom: '10px' }}>
                    {t('search.noResults')}
                  </h3>
                  <p style={{ color: '#888' }}>
                    Try adjusting your search terms or filters
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;