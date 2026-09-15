import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import './LanguagePicker.css';

const USFlag = () => (
  <svg className="lang-picker__flag" viewBox="0 0 640 480" aria-hidden="true">
    <rect width="640" height="480" fill="#bd3d44" />
    <g fill="#fff">
      <rect y="37" width="640" height="37" />
      <rect y="111" width="640" height="37" />
      <rect y="185" width="640" height="37" />
      <rect y="259" width="640" height="37" />
      <rect y="333" width="640" height="37" />
      <rect y="407" width="640" height="37" />
    </g>
    <rect width="260" height="259" fill="#192f5d" />
  </svg>
);

const ESFlag = () => (
  <svg className="lang-picker__flag" viewBox="0 0 640 480" aria-hidden="true">
    <rect width="640" height="480" fill="#c60b1e" />
    <rect y="120" width="640" height="240" fill="#ffc400" />
  </svg>
);

const LANGUAGES = [
  { code: 'en', Flag: USFlag, label: 'English' },
  { code: 'es', Flag: ESFlag, label: 'Español' },
];

/**
 * The language control, top right of the page.
 *
 * `tone` picks the palette: "dark" for the navy header and hero, "light" for a
 * white surface. It is a real dropdown rather than the hover-swap pill this
 * replaces, because that one showed the language you were NOT reading and
 * looked like a label for the page.
 */
export default function LanguagePicker({ tone = 'dark' }) {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const root = useRef(null);

  // Close on a click anywhere else and on Escape, the two ways anyone expects
  // to dismiss a menu.
  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (e) => {
      if (root.current && !root.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const current = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return (
    <div className={`lang-picker lang-picker--${tone}`} ref={root}>
      <button
        type="button"
        className="lang-picker__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((wasOpen) => !wasOpen)}
      >
        <current.Flag />
        <span className="lang-picker__label">{current.label}</span>
        <svg className="lang-picker__chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <ul className="lang-picker__menu" role="listbox">
          {LANGUAGES.map(({ code, Flag, label }) => (
            <li key={code}>
              <button
                type="button"
                role="option"
                aria-selected={code === language}
                className={`lang-picker__option ${code === language ? 'lang-picker__option--active' : ''}`}
                onClick={() => {
                  setLanguage(code);
                  setOpen(false);
                }}
              >
                <Flag />
                <span className="lang-picker__label">{label}</span>
                {code === language && (
                  <svg className="lang-picker__tick" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                    <path d="m5 13 4 4L19 7" />
                  </svg>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
