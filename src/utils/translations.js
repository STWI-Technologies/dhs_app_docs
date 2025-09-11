// Translation utilities and constants
export const translations = {
  en: {
    // Header
    companyName: 'Direct Home Service',
    knowledgeBaseTitle: 'Customer Service Knowledge Base',
    
    // Search
    searchPlaceholder: 'Search knowledge base...',
    externalSearchPlaceholder: 'Search entire knowledge base...',
    searchButton: 'Search',
    noResults: 'No suggestions found',
    clearSearch: 'Clear search',
    localSearch: 'Local Search',
    externalSearch: 'External Search',
    externalSearchDescription: 'Search the complete LiveAgent knowledge base',
    
    // Categories
    categories: {
      'core-operations': 'Core Operations',
      'customer-management': 'Customer Management',
      'services-products': 'Services & Products',
      'reports-analytics': 'Reports & Analytics',
      'financial-reports': 'Financial Reports',
      'operations-compliance': 'Operations & Compliance'
    },
    
    // Articles
    readMore: 'Read More',
    newArticle: 'New',
    updatedArticle: 'Updated',
    featuredArticle: 'Featured',
    lastUpdated: 'Last updated',
    minutesRead: 'min read',
    minutesReadPlural: 'mins read',
    viewAllArticles: 'View all articles',
    
    // Footer
    copyright: '© 2025 Direct Home Service. All rights reserved.',
    needHelp: 'Need help?',
    contactSupport: 'Contact Support',
    
    // Accessibility
    switchToLanguage: 'Switch to English',
    categoryLabel: 'Category',
    readingTime: 'Reading time',
    searchSuggestions: 'Search suggestions'
  },
  es: {
    // Header
    companyName: 'Direct Home Service',
    knowledgeBaseTitle: 'Base de Conocimientos de Atención al Cliente',
    
    // Search
    searchPlaceholder: 'Buscar en la base de conocimientos...',
    externalSearchPlaceholder: 'Buscar en toda la base de conocimientos...',
    searchButton: 'Buscar',
    noResults: 'No se encontraron sugerencias',
    clearSearch: 'Limpiar búsqueda',
    localSearch: 'Búsqueda Local',
    externalSearch: 'Búsqueda Externa',
    externalSearchDescription: 'Buscar en la base de conocimientos completa de LiveAgent',
    
    // Categories
    categories: {
      'core-operations': 'Operaciones Principales',
      'customer-management': 'Gestión de Clientes',
      'services-products': 'Servicios y Productos',
      'reports-analytics': 'Informes y Análisis',
      'financial-reports': 'Informes Financieros',
      'operations-compliance': 'Operaciones y Cumplimiento'
    },
    
    // Articles
    readMore: 'Leer Más',
    newArticle: 'Nuevo',
    updatedArticle: 'Actualizado',
    featuredArticle: 'Destacado',
    lastUpdated: 'Última actualización',
    minutesRead: 'min de lectura',
    minutesReadPlural: 'mins de lectura',
    viewAllArticles: 'Ver todos los artículos',
    
    // Footer
    copyright: '© 2025 Direct Home Service. Todos los derechos reservados.',
    needHelp: '¿Necesita ayuda?',
    contactSupport: 'Contactar Soporte',
    
    // Accessibility
    switchToLanguage: 'Cambiar a Español',
    categoryLabel: 'Categoría',
    readingTime: 'Tiempo de lectura',
    searchSuggestions: 'Sugerencias de búsqueda'
  }
};

export const getTranslation = (key, language = 'en') => {
  const keys = key.split('.');
  let value = translations[language] || translations.en;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // Fallback to English if key not found in current language
      value = translations.en;
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          return key; // Return key if not found in either language
        }
      }
      break;
    }
  }
  
  return value;
};

export const formatDate = (dateString, language = 'en') => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    
    return date.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', options);
  } catch (error) {
    return dateString;
  }
};

export const getLocalizedText = (textObj, language = 'en') => {
  if (typeof textObj === 'string') return textObj;
  if (!textObj) return '';
  
  return textObj[language] || textObj.en || textObj.es || textObj;
};