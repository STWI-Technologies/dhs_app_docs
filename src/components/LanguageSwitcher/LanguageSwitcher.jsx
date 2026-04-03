import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import './LanguageSwitcher.css';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);

  const languages = [
    { code: 'en', flag: '🇺🇸', label: 'English' },
    { code: 'es', flag: '🇪🇸', label: 'Español' }
  ];

  const current = languages.find(l => l.code === language);
  const other = languages.find(l => l.code !== language);

  return (
    <div
      className={`lang-switcher ${open ? 'lang-switcher--open' : ''}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {open && (
        <button
          className="lang-switcher__option"
          onClick={() => { setLanguage(other.code); setOpen(false); }}
        >
          <span className="lang-switcher__flag">{other.flag}</span>
          <span className="lang-switcher__label">{other.label}</span>
        </button>
      )}
      <div className="lang-switcher__current">
        <span className="lang-switcher__flag">{current.flag}</span>
        <span className="lang-switcher__label">{current.label}</span>
      </div>
    </div>
  );
}
