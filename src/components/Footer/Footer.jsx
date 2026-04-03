import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import './Footer.css';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="footer">
      <p className="footer__copyright">{t.copyright}</p>
    </footer>
  );
}
