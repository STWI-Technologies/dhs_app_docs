import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import './Hero.css';

/**
 * The home page hero: brand nav, headline, search, and the audience toggle.
 *
 * The toggle deliberately straddles the bottom edge of the dark panel, which is
 * why it is rendered here rather than in HomePage: it needs the hero's stacking
 * context to sit half in the navy and half in the page background.
 */
export default function Hero({ audience, onAudienceChange, children }) {
  const { t, language, setLanguage } = useLanguage();

  const openContactForm = () => {
    if (window.contactForm && window.contactForm.onClick) {
      window.contactForm.onClick();
    }
  };

  return (
    <section className="hero">
      <div className="hero__panel">
        <nav className="hero__nav">
          <a className="hero__brand" href="/">
            <img src="/brand/logo-19.png" alt="Direct Home Service" className="hero__logo" />
          </a>
          <div className="hero__nav-links">
            <a className="hero__nav-link hero__nav-link--active" href="/">
              {t.subtitle}
            </a>
            <button type="button" className="hero__nav-link" onClick={openContactForm}>
              {t.contact}
            </button>
            <button
              type="button"
              className="hero__nav-link"
              onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
            >
              {language === 'en' ? 'Español' : 'English'}
            </button>
          </div>
        </nav>

        <h1 className="hero__title">{t.heroTitle}</h1>
        <p className="hero__subtitle">{t.heroSubtitle}</p>

        <div className="hero__search">{children}</div>
      </div>

      <div className="hero__toggle-wrap">
        <div className="hero__toggle" role="tablist" aria-label={t.audienceLabel}>
          <button
            type="button"
            role="tab"
            aria-selected={audience === 'provider'}
            className={`hero__toggle-option ${audience === 'provider' ? 'hero__toggle-option--active' : ''}`}
            onClick={() => onAudienceChange('provider')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M3 10.5 12 4l9 6.5" />
              <path d="M5 10v9h14v-9" />
            </svg>
            {t.forServiceProviders}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={audience === 'client'}
            className={`hero__toggle-option ${audience === 'client' ? 'hero__toggle-option--active' : ''}`}
            onClick={() => onAudienceChange('client')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <circle cx="12" cy="8" r="3.5" />
              <path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" />
            </svg>
            {t.forYourClients}
          </button>
        </div>
      </div>
    </section>
  );
}
