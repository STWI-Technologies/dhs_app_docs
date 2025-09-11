import React, { Suspense } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

// Lazy load pages for better performance
const KnowledgeBase = React.lazy(() => import('../pages/KnowledgeBase'));
const Search = React.lazy(() => import('../pages/Search'));
const CategoryPage = React.lazy(() => import('../pages/CategoryPage'));
const ArticlePage = React.lazy(() => import('../pages/ArticlePage'));
const KBArticle = React.lazy(() => import('../pages/KBArticle'));
const NotFound = React.lazy(() => import('../pages/NotFound'));

// Loading component
const LoadingSpinner = () => (
  <div className="loading-container" style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px',
    fontSize: '18px',
    color: '#666'
  }}>
    <div className="spinner" style={{
      width: '40px',
      height: '40px',
      border: '4px solid #f3f3f3',
      borderTop: '4px solid #2E3192',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }}></div>
    <span style={{ marginLeft: '10px' }}>Loading...</span>
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

// Route wrapper that handles language-specific routing
const LanguageRoute = ({ children, ...props }) => {
  const { currentLanguage, getLanguageFromPath, getPathWithLanguage } = useLanguage();
  const location = useLocation();
  
  const urlLanguage = getLanguageFromPath(location.pathname);
  
  // If URL doesn't have a language prefix, redirect to include it
  if (!urlLanguage) {
    const newPath = getPathWithLanguage(location.pathname, currentLanguage);
    return <Navigate to={newPath} replace />;
  }
  
  // If URL language doesn't match current language, let LanguageContext handle it
  return <Route {...props}>{children}</Route>;
};

// Component to handle redirects from root paths
const LanguageRedirect = () => {
  const { currentLanguage } = useLanguage();
  const location = useLocation();
  
  // Extract the path without language prefix
  const pathWithoutLang = location.pathname.replace(/^\/(en|es)/, '') || '/';
  const redirectPath = `/${currentLanguage}${pathWithoutLang === '/' ? '' : pathWithoutLang}`;
  
  return <Navigate to={redirectPath} replace />;
};

const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Root redirect - redirect to current language */}
        <Route path="/" element={<LanguageRedirect />} />
        
        {/* Language-specific routes */}
        <Route path="/:lang">
          {/* Main knowledge base page */}
          <LanguageRoute path="" element={<KnowledgeBase />} />
          
          {/* Search results page */}
          <LanguageRoute path="search" element={<Search />} />
          
          {/* Category page - shows articles in a specific category */}
          <LanguageRoute path="category/:categoryId" element={<CategoryPage />} />
          
          {/* Article page - shows a specific article */}
          <LanguageRoute path="article/:articleId" element={<ArticlePage />} />
          
          {/* Knowledge base subdirectories for compatibility with static files */}
          <LanguageRoute path="knowledge-base/*" element={<Navigate to="../" replace />} />
        </Route>
        
        {/* KB Article routes - for direct knowledge base article access */}
        <Route path="/kb/:articleId" element={<KBArticle />} />
        
        {/* Legacy routes without language prefix - redirect to current language */}
        <Route path="/search" element={<LanguageRedirect />} />
        <Route path="/category/:categoryId" element={<LanguageRedirect />} />
        <Route path="/article/:articleId" element={<LanguageRedirect />} />
        
        {/* Catch-all route for 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

// Higher-order component to provide language-aware navigation
export const withLanguageRouting = (Component) => {
  return (props) => {
    const { getPathWithLanguage, currentLanguage } = useLanguage();
    
    const navigate = (path, options = {}) => {
      const languagePath = getPathWithLanguage(path, currentLanguage);
      return props.navigate(languagePath, options);
    };
    
    return (
      <Component
        {...props}
        navigate={navigate}
        currentLanguage={currentLanguage}
      />
    );
  };
};

// Hook for language-aware navigation
export const useLanguageNavigate = () => {
  const { getPathWithLanguage, currentLanguage } = useLanguage();
  const routerNavigate = useNavigate();
  
  const navigate = (path, options = {}) => {
    const languagePath = path.startsWith('/') 
      ? getPathWithLanguage(path, currentLanguage)
      : path;
    
    return routerNavigate(languagePath, options);
  };
  
  return navigate;
};

// Hook to get current path without language prefix
export const useLanguagePath = () => {
  const { getPathWithoutLanguage } = useLanguage();
  const location = useLocation();
  
  return getPathWithoutLanguage(location.pathname);
};

// Utility component for creating language-aware links
export const LanguageLink = ({ to, children, className, ...props }) => {
  const { getPathWithLanguage, currentLanguage } = useLanguage();
  
  const languagePath = to.startsWith('/') 
    ? getPathWithLanguage(to, currentLanguage)
    : to;
  
  return (
    <Link to={languagePath} className={className} {...props}>
      {children}
    </Link>
  );
};

export default AppRoutes;