import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import LanguagePicker from '../LanguagePicker/LanguagePicker';
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
      <div className="header__right">
        <span className="header__subtitle">{t.subtitle}</span>
        <LanguagePicker tone="dark" />
      </div>
    </header>
  );
}
