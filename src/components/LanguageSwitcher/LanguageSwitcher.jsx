import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import styles from './LanguageSwitcher.module.css';

const LanguageSwitcher = () => {
  const { language, changeLanguage } = useLanguage();

  const handleLanguageChange = (newLanguage) => {
    changeLanguage(newLanguage);
  };

  return (
    <div className={styles.languageSwitcher}>
      <button
        className={`${styles.languageBtn} ${language === 'en' ? styles.active : ''}`}
        onClick={() => handleLanguageChange('en')}
        aria-label="Switch to English"
        data-language="en"
      >
        <span className={`${styles.flag} ${styles.flagUs}`} aria-hidden="true"></span>
        English
      </button>
      <button
        className={`${styles.languageBtn} ${language === 'es' ? styles.active : ''}`}
        onClick={() => handleLanguageChange('es')}
        aria-label="Cambiar a Español"
        data-language="es"
      >
        <span className={`${styles.flag} ${styles.flagEs}`} aria-hidden="true"></span>
        Español
      </button>
    </div>
  );
};

export default LanguageSwitcher;