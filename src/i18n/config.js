import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enTranslations from './locales/en.json';
import esTranslations from './locales/es.json';

const resources = {
  en: {
    translation: enTranslations,
  },
  es: {
    translation: esTranslations,
  },
};

const detectionOptions = {
  order: [
    'path',         // Check URL path first (/en/page or /es/page)
    'localStorage', // Then check localStorage
    'navigator',    // Then browser language
    'htmlTag',      // Then html tag
  ],
  lookupFromPathIndex: 0,
  checkWhitelist: true,
  caches: ['localStorage'],
};

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',

    // Language detection
    detection: detectionOptions,

    // Interpolation options
    interpolation: {
      escapeValue: false, // React already escapes values
      format: function(value, format) {
        if (format === 'uppercase') return value.toUpperCase();
        if (format === 'lowercase') return value.toLowerCase();
        if (format === 'capitalize') {
          return value.charAt(0).toUpperCase() + value.slice(1);
        }
        return value;
      },
    },

    // React specific options
    react: {
      useSuspense: true,
      bindI18n: 'languageChanged',
      bindI18nStore: '',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'em', 'span'],
    },

    // Supported languages
    whitelist: ['en', 'es'],

    // Key separator
    keySeparator: '.',
    
    // Namespace separator  
    nsSeparator: ':',

    // Default namespace
    defaultNS: 'translation',
  });

export default i18n;