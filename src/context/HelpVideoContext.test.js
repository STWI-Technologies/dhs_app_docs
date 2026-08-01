import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { HelpVideoProvider, useHelpVideoContext } from './HelpVideoContext';
import { useLanguage } from './LanguageContext';

global.IS_REACT_ACT_ENVIRONMENT = true;

const helpVideoContract = {
  normalizeHelpContext(search) {
    const params = new URLSearchParams(search);

    return {
      plan: params.get('plan') === 'solo' ? 'solo' : 'standard',
      language: params.get('language') === 'es' ? 'es' : 'en',
    };
  },
};

function ContextProbe() {
  const { plan, language, canonicalSearch } = useHelpVideoContext();
  const { language: selectedLanguage } = useLanguage();

  return <output>{`${plan}|${language}|${canonicalSearch}|${selectedLanguage}`}</output>;
}

describe('HelpVideoProvider', () => {
  let container;
  let root;

  const mount = (ui) => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    const updateRoot = root.render.bind(root);
    act(() => updateRoot(ui));
  };

  beforeEach(() => {
    window.DHSHelpVideoContract = helpVideoContract;
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    window.history.replaceState({}, '', '/');
    document.cookie = 'selectedLanguage=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
    delete window.DHSHelpVideoContract;
  });

  it('provides normalized query context and initializes the language provider', () => {
    window.history.replaceState({}, '', '/?plan=solo&language=es');

    mount(
      <HelpVideoProvider>
        <ContextProbe />
      </HelpVideoProvider>
    );

    expect(container.textContent).toBe('solo|es|?plan=solo&language=es|es');
  });

  it('provides canonical defaults for unsupported query values', () => {
    window.history.replaceState({}, '', '/?plan=team&language=fr');

    mount(
      <HelpVideoProvider>
        <ContextProbe />
      </HelpVideoProvider>
    );

    expect(container.textContent).toBe('standard|en|?plan=standard&language=en|en');
  });

  it('fails closed to canonical defaults when the global contract is unavailable', () => {
    window.history.replaceState({}, '', '/?plan=solo&language=es');
    delete window.DHSHelpVideoContract;

    mount(
      <HelpVideoProvider>
        <ContextProbe />
      </HelpVideoProvider>
    );

    expect(container.textContent).toBe('standard|en|?plan=standard&language=en|en');
  });
});
