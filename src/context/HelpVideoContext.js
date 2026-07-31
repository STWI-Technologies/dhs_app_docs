import React, { createContext, useContext, useState } from 'react';
import helpVideoContract from '../../public/js/help-video-contract';
import { LanguageProvider } from './LanguageContext';

const HelpVideoContext = createContext();

function readHelpVideoContext() {
  const contract = window.DHSHelpVideoContract || helpVideoContract;
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
