import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import './Footer.css';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="footer">
      <p className="footer__copyright">{t.copyright}</p>
      <p className="footer__support">
        {t.needHelp}{' '}
        <a href="mailto:support@directhomeservice.com" className="footer__link">
          {t.contactSupport}
        </a>
      </p>
    </footer>
  );
}
