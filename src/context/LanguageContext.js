import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const LanguageContext = createContext();

const setCookie = (name, value, days = 365) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

const getCookie = (name) => {
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i].trim();
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length);
  }
  return null;
};

const translations = {
  en: {
    subtitle: 'Knowledge Base',
    searchPlaceholder: 'Search articles...',
    backButton: '← Back to Knowledge Base',
    noResults: 'No articles found matching your search.',
    copyright: '© 2025 Direct Home Service. All rights reserved.',
    needHelp: 'Need help?',
    contactSupport: 'Contact Support',
    loading: 'Loading...',
    keywords: 'Keywords'
  },
  es: {
    subtitle: 'Base de Conocimientos',
    searchPlaceholder: 'Buscar artículos...',
    backButton: '← Volver a la Base de Conocimientos',
    noResults: 'No se encontraron artículos que coincidan con su búsqueda.',
    copyright: '© 2025 Direct Home Service. Todos los derechos reservados.',
    needHelp: '¿Necesita ayuda?',
    contactSupport: 'Contactar Soporte',
    loading: 'Cargando...',
    keywords: 'Palabras Clave'
  }
};

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => getCookie('selectedLanguage') || 'en');

  const setLanguage = useCallback((lang) => {
    setLanguageState(lang);
    setCookie('selectedLanguage', lang);
  }, []);

  const t = translations[language];

  const getLocalized = useCallback((article) => {
    return article[language] || article.en;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, getLocalized }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
