import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    // Get language from localStorage first, then from i18n
    const savedLanguage = localStorage.getItem('preferredLanguage');
    return savedLanguage || i18n.language || 'en';
  });

  const [isLoading, setIsLoading] = useState(false);

  // Available languages configuration
  const languages = [
    {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      flag: '🇺🇸',
      direction: 'ltr'
    },
    {
      code: 'es',
      name: 'Spanish',
      nativeName: 'Español',
      flag: '🇪🇸',
      direction: 'ltr'
    }
  ];

  // Get current language info
  const getCurrentLanguageInfo = () => {
    return languages.find(lang => lang.code === currentLanguage) || languages[0];
  };

  // Extract language from URL path
  const getLanguageFromPath = (pathname) => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const firstSegment = pathSegments[0];
    return languages.find(lang => lang.code === firstSegment)?.code || null;
  };

  // Remove language prefix from path
  const getPathWithoutLanguage = (pathname) => {
    const urlLanguage = getLanguageFromPath(pathname);
    if (urlLanguage) {
      return pathname.replace(`/${urlLanguage}`, '') || '/';
    }
    return pathname;
  };

  // Add language prefix to path
  const getPathWithLanguage = (pathname, language) => {
    const cleanPath = getPathWithoutLanguage(pathname);
    return `/${language}${cleanPath === '/' ? '' : cleanPath}`;
  };

  // Change language function
  const changeLanguage = async (languageCode) => {
    if (!languages.find(lang => lang.code === languageCode)) {
      console.warn(`Language ${languageCode} is not supported`);
      return;
    }

    setIsLoading(true);
    
    try {
      // Update i18next
      await i18n.changeLanguage(languageCode);
      
      // Update state
      setCurrentLanguage(languageCode);
      
      // Save to localStorage
      localStorage.setItem('preferredLanguage', languageCode);
      
      // Update URL to include language prefix
      const currentPath = getPathWithoutLanguage(location.pathname);
      const newPath = getPathWithLanguage(currentPath, languageCode);
      
      if (location.pathname !== newPath) {
        navigate(newPath, { replace: true });
      }
      
      // Update document language and direction
      document.documentElement.lang = languageCode;
      const languageInfo = getCurrentLanguageInfo();
      document.documentElement.dir = languageInfo.direction;
      
      // Update page title if it exists in translations
      const titleKey = 'header.title';
      if (i18n.exists(titleKey)) {
        document.title = `${i18n.t(titleKey)} - ${i18n.t('header.subtitle')}`;
      }
      
    } catch (error) {
      console.error('Error changing language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize language from URL on mount
  useEffect(() => {
    const urlLanguage = getLanguageFromPath(location.pathname);
    
    if (urlLanguage && urlLanguage !== currentLanguage) {
      changeLanguage(urlLanguage);
    } else if (!urlLanguage && currentLanguage !== 'en') {
      // If no language in URL but user has a preferred language, redirect
      const newPath = getPathWithLanguage(location.pathname, currentLanguage);
      navigate(newPath, { replace: true });
    }
  }, [location.pathname]);

  // Sync i18n language changes with context state
  useEffect(() => {
    const handleLanguageChange = (lng) => {
      if (lng !== currentLanguage) {
        setCurrentLanguage(lng);
      }
    };

    i18n.on('languageChanged', handleLanguageChange);
    
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [currentLanguage, i18n]);

  // Format date according to current language
  const formatDate = (date, options = {}) => {
    const dateObj = date instanceof Date ? date : new Date(date);
    const locale = currentLanguage === 'es' ? 'es-ES' : 'en-US';
    
    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options
    };
    
    return new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj);
  };

  // Format number according to current language
  const formatNumber = (number, options = {}) => {
    const locale = currentLanguage === 'es' ? 'es-ES' : 'en-US';
    return new Intl.NumberFormat(locale, options).format(number);
  };

  // Get text direction for current language
  const getTextDirection = () => {
    return getCurrentLanguageInfo().direction;
  };

  // Check if current language is RTL
  const isRTL = () => {
    return getTextDirection() === 'rtl';
  };

  const contextValue = {
    // Current language state
    currentLanguage,
    languages,
    getCurrentLanguageInfo,
    isLoading,
    
    // Language switching
    changeLanguage,
    
    // URL helpers
    getLanguageFromPath,
    getPathWithoutLanguage,
    getPathWithLanguage,
    
    // Formatting helpers
    formatDate,
    formatNumber,
    
    // Direction helpers
    getTextDirection,
    isRTL,
    
    // Convenience flags
    isEnglish: currentLanguage === 'en',
    isSpanish: currentLanguage === 'es',
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;