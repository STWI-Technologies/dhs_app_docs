import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { openSupportChat } from '../SupportWidget/crisp';
import LanguagePicker from '../LanguagePicker/LanguagePicker';
import './Hero.css';

/**
 * The home page hero: brand nav, headline, search, and the audience toggle.
 *
 * The toggle deliberately straddles the bottom edge of the dark panel, which is
 * why it is rendered here rather than in HomePage: it needs the hero's stacking
 * context to sit half in the navy and half in the page background.
 *
 * On a phone the two options would stack into a block that reads as a second
 * card hanging off the panel, so there the toggle collapses to the selected
 * option plus a chevron: tapping it reveals the other one, and picking either
 * closes it again. `open` only drives that narrow layout; from 600px up both
 * options are always visible and the chevron is hidden.
 */
export default function Hero({ audience, onAudienceChange, children }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  const choose = (next) => {
    onAudienceChange(next);
    setOpen(false);
  };

  return (
    <section className="hero">
      <div className="hero__panel">
        <div className="hero__inner">
          <nav className="hero__nav">
            <a className="hero__brand" href="/">
              <img src="/brand/logo-19.png" alt="Direct Home Service" className="hero__logo" />
            </a>
            <div className="hero__nav-links">
              <a className="hero__nav-link hero__nav-link--active" href="/">
                {t.subtitle}
              </a>
              <button type="button" className="hero__nav-link" onClick={openSupportChat}>
                {t.contact}
              </button>
              <LanguagePicker tone="dark" />
            </div>
          </nav>

          <h1 className="hero__title">{t.heroTitle}</h1>
          <p className="hero__subtitle">{t.heroSubtitle}</p>

          <div className="hero__search">{children}</div>
        </div>
      </div>

      <div className="hero__toggle-wrap">
        <div
          className={`hero__toggle ${open ? 'hero__toggle--open' : ''}`}
          role="tablist"
          aria-label={t.audienceLabel}
        >
          <button
            type="button"
            role="tab"
            aria-selected={audience === 'provider'}
            className={`hero__toggle-option ${audience === 'provider' ? 'hero__toggle-option--active' : ''}`}
            onClick={() => choose('provider')}
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
            onClick={() => choose('client')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <circle cx="12" cy="8" r="3.5" />
              <path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" />
            </svg>
            {t.forClients}
          </button>
          <button
            type="button"
            className="hero__toggle-switch"
            aria-label={t.audienceSwitch}
            aria-expanded={open}
            onClick={() => setOpen((wasOpen) => !wasOpen)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
