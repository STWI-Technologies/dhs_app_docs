import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import './LanguageSwitcher.css';

const USFlag = () => (
  <svg className="lang-switcher__flag" viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg">
    <rect width="640" height="480" fill="#bd3d44"/>
    <rect y="37" width="640" height="37" fill="#fff"/>
    <rect y="111" width="640" height="37" fill="#fff"/>
    <rect y="185" width="640" height="37" fill="#fff"/>
    <rect y="259" width="640" height="37" fill="#fff"/>
    <rect y="333" width="640" height="37" fill="#fff"/>
    <rect y="407" width="640" height="37" fill="#fff"/>
    <rect width="260" height="259" fill="#192f5d"/>
    <g fill="#fff">
      <g id="s18"><g id="s9"><g id="s5"><g id="s4"><path id="s" d="M22 17.5l3.7 11.2H38l-9.8 7.2 3.7 11.2L22 39.8l-9.8 7.3 3.7-11.2L6 28.7h12.3z"/><use xlinkHref="#s" x="52"/></g><use xlinkHref="#s4" x="104"/></g><use xlinkHref="#s4" x="208"/></g><use xlinkHref="#s9" y="42"/></g><use xlinkHref="#s18" y="84"/><use xlinkHref="#s9" y="168"/><use xlinkHref="#s5" y="210"/><g id="s19"><g id="s10"><g id="s6"><use xlinkHref="#s" x="26" y="21"/><use xlinkHref="#s" x="78" y="21"/></g><use xlinkHref="#s6" x="104"/></g><use xlinkHref="#s10" x="0" y="42"/></g><use xlinkHref="#s19" y="84"/><use xlinkHref="#s10" y="168"/><use xlinkHref="#s6" y="210"/>
    </g>
  </svg>
);

const ESFlag = () => (
  <svg className="lang-switcher__flag" viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg">
    <rect width="640" height="480" fill="#c60b1e"/>
    <rect y="120" width="640" height="240" fill="#ffc400"/>
  </svg>
);

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);

  const languages = [
    { code: 'en', Flag: USFlag, label: 'English' },
    { code: 'es', Flag: ESFlag, label: 'Español' }
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
          <other.Flag />
          <span className="lang-switcher__label">{other.label}</span>
        </button>
      )}
      <div className="lang-switcher__current">
        <current.Flag />
        <span className="lang-switcher__label">{current.label}</span>
      </div>
    </div>
  );
}
