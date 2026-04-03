import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import './Header.css';

export default function Header({ onLogoClick }) {
  const { t } = useLanguage();

  return (
    <header className="header">
      <a
        href="/"
        className="header__logo-link"
        onClick={(e) => {
          e.preventDefault();
          if (onLogoClick) onLogoClick();
        }}
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
