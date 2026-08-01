import React, { createContext, useContext, useState } from 'react';
import { LanguageProvider } from './LanguageContext';

const HelpVideoContext = createContext();
const DEFAULT_HELP_VIDEO_CONTEXT = {
  plan: 'standard',
  language: 'en',
  canonicalSearch: '?plan=standard&language=en',
};

function readHelpVideoContext() {
  const contract = window.DHSHelpVideoContract;
  if (typeof contract?.normalizeHelpContext !== 'function') return DEFAULT_HELP_VIDEO_CONTEXT;

  const { plan, language } = contract.normalizeHelpContext(window.location.search);

  return {
    plan,
    language,
    canonicalSearch: `?plan=${plan}&language=${language}`,
  };
}

export function HelpVideoProvider({ children }) {
  const [helpVideoContext] = useState(readHelpVideoContext);

  return (
    <HelpVideoContext.Provider value={helpVideoContext}>
      <LanguageProvider initialLanguage={helpVideoContext.language}>
        {children}
      </LanguageProvider>
    </HelpVideoContext.Provider>
  );
}

export function useHelpVideoContext() {
  const context = useContext(HelpVideoContext);
  if (!context) throw new Error('useHelpVideoContext must be used within HelpVideoProvider');
  return context;
}
