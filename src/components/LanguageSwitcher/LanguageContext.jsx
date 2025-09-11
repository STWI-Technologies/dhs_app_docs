import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    // Load saved language from localStorage on component mount
    const savedLanguage = localStorage.getItem('dhs-language');
    if (savedLanguage && ['en', 'es'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    } else {
      // Detect user's browser language
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith('es')) {
        setLanguage('es');
      }
    }
  }, []);

  const changeLanguage = (newLanguage) => {
    if (['en', 'es'].includes(newLanguage)) {
      setLanguage(newLanguage);
      localStorage.setItem('dhs-language', newLanguage);
      
      // Update document language and title
      document.documentElement.lang = newLanguage;
      
      const titles = {
        en: 'Direct Home Service - Knowledge Base',
        es: 'Direct Home Service - Base de Conocimientos'
      };
      document.title = titles[newLanguage];
    }
  };

  const value = {
    language,
    changeLanguage,
    isEnglish: language === 'en',
    isSpanish: language === 'es'
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

LanguageProvider.propTypes = {
  children: PropTypes.node.isRequired
};