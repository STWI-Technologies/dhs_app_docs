import React, { createContext, useContext, useState, useCallback } from 'react';

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
    backButton: 'Back to Knowledge Base',
    backToAppHelp: 'Back',
    appHelpTitle: 'Help & Support',
    viewKnowledgebase: 'View Knowledgebase',
    standardAndTeamOnly: 'Standard and Team plans only',
    noResults: 'No articles found matching your search.',
    copyright: `© ${new Date().getFullYear()} Direct Home Service. All rights reserved.`,
    loading: 'Loading...',
    keywords: 'Keywords',
    contact: 'Contact',
    heroTitle: 'Find it fast. Get back to work',
    heroSubtitle: 'Search by topic, or browse the sections below.',
    audienceLabel: 'Who the articles are for',
    forServiceProviders: 'For service providers',
    forYourClients: 'For your clients',
    articleSingular: 'article',
    articlePlural: 'articles'
  },
  es: {
    subtitle: 'Base de Conocimientos',
    searchPlaceholder: 'Buscar artículos...',
    backButton: 'Volver a la Base de Conocimientos',
    backToAppHelp: 'Volver',
    appHelpTitle: 'Ayuda y Soporte',
    viewKnowledgebase: 'Ver Base de Conocimientos',
    standardAndTeamOnly: 'Solo para planes Standard y Team',
    noResults: 'No se encontraron artículos que coincidan con su búsqueda.',
    copyright: `© ${new Date().getFullYear()} Direct Home Service. Todos los derechos reservados.`,
    loading: 'Cargando...',
    keywords: 'Palabras Clave',
    contact: 'Contacto',
    heroTitle: 'Encuéntrelo rápido. Vuelva al trabajo',
    heroSubtitle: 'Busque por tema, o recorra las secciones de abajo.',
    audienceLabel: 'Para quién son los artículos',
    forServiceProviders: 'Para proveedores',
    forYourClients: 'Para sus clientes',
    articleSingular: 'artículo',
    articlePlural: 'artículos'
  }
};

export function LanguageProvider({ children, initialLanguage }) {
  const [language, setLanguageState] = useState(() => initialLanguage || getCookie('selectedLanguage') || 'en');

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
