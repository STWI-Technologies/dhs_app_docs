import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import {
  loadCrisp,
  openSupportChat,
  setSupportContext,
  watchAvailability,
  watchChatOpenState
} from './crisp';
import './SupportWidget.css';

/**
 * The support button on the public knowledge base.
 *
 * One button, one action: open Crisp. The service provider app puts a chooser
 * in front of it because it also offers its AI assistant; there is no AI here,
 * so a chooser would be a click for nothing.
 */
export default function SupportWidget() {
  const { t, language } = useLanguage();
  const location = useLocation();
  const [isAvailable, setIsAvailable] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    loadCrisp();
    const stopWatchingAvailability = watchAvailability(setIsAvailable);
    const stopWatchingOpenState = watchChatOpenState(setIsChatOpen);
    return () => {
      stopWatchingAvailability();
      stopWatchingOpenState();
    };
  }, []);

  // Keep the agent's view of where the reader is in step with the reader. The
  // widget lives outside the routes, so the article comes from the path rather
  // than from useParams, which would always be empty here.
  useEffect(() => {
    const isHome = location.pathname === '/';
    const articleId = location.pathname.match(/^\/articles\/([^/]+)/)?.[1];
    const audience =
      new URLSearchParams(location.search).get('for') === 'clients'
        ? 'client'
        : 'provider';
    setSupportContext({
      articleId: articleId || (isHome ? 'home' : location.pathname),
      language,
      audience: isHome ? audience : undefined
    });
  }, [language, location.pathname, location.search]);

  // While the chat is open, Crisp puts its own close control in this corner.
  // Two buttons stacked on the same spot is what it looks like: two buttons.
  if (isChatOpen) return null;

  const statusLabel =
    isAvailable === true
      ? t.supportOnline
      : isAvailable === false
        ? t.supportOffline
        : t.supportChecking;

  return (
    <button
      type="button"
      className="support-widget"
      onClick={openSupportChat}
      aria-label={`${t.contactSupport}. ${statusLabel}`}
      title={`${t.contactSupport} — ${statusLabel}`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
      {isAvailable !== null && (
        <span
          className={`support-widget__status ${
            isAvailable ? 'support-widget__status--online' : 'support-widget__status--offline'
          }`}
          aria-hidden="true"
        />
      )}
    </button>
  );
}
