import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import './Header.css';

export default function Header() {
  const { t } = useLanguage();

  return (
    <header className="header">
      <a
        href="https://directhomeservice.com"
        target="_blank"
        rel="noopener noreferrer"
        className="header__logo-link"
      >
        <img
          src="/brand/logo-19.png"
          alt="Direct Home Service"
          className="header__logo"
        />
      </a>
      <span className="header__subtitle">{t.subtitle}</span>
    </header>
  );
}
