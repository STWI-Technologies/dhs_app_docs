import React, { useEffect, useState, useCallback } from 'react';
import './ChatButton.css';

export default function ChatButton() {
  const [visible, setVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Load LiveAgent scripts
  useEffect(() => {
    const loadLA = (buttonId, windowKey) => {
      const s = document.createElement('script');
      s.defer = true;
      s.src = 'https://directhomeservice.ladesk.com/scripts/track.js';
      s.onload = function () {
        if (window.LiveAgent) {
          window[windowKey] = window.LiveAgent.createButton(buttonId, s);
        }
      };
      document.body.appendChild(s);
    };

    loadLA('qfc0o8rw', 'contactForm');
    loadLA('ws5l92o9', 'chatButton');
    loadLA('hpnn2l51', 'callButton');

    // Show button after scripts load
    const timer = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const toggleMenu = useCallback(() => {
    // Check business hours (Eastern Time)
    const now = new Date();
    const eastern = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    const hours = eastern.getHours();
    const day = eastern.getDay();
    const isWeekday = day >= 1 && day <= 5;
    const isWeekend = day === 0 || day === 6;
    const isOpen = (isWeekday && hours >= 8 && hours < 20) || (isWeekend && hours >= 9 && hours < 17);

    if (isOpen) {
      setMenuOpen(prev => !prev);
    } else {
      // Outside hours - open contact form directly
      if (window.contactForm?.onClick) window.contactForm.onClick();
    }
  }, []);

  const handleContact = () => {
    setMenuOpen(false);
    if (window.contactForm?.onClick) window.contactForm.onClick();
  };

  const handleChat = () => {
    setMenuOpen(false);
    if (window.chatButton?.onClick) window.chatButton.onClick();
  };

  const handleCall = () => {
    setMenuOpen(false);
    if (window.callButton?.onClick) window.callButton.onClick();
  };

  if (!visible) return null;

  return (
    <>
      {/* Multi-widget menu */}
      <div className={`chat-widget__menu ${menuOpen ? 'chat-widget__menu--open' : ''}`}>
        <button className="chat-widget__close" onClick={() => setMenuOpen(false)}>&times;</button>
        <ul className="chat-widget__options">
          <li className="chat-widget__option" onClick={handleContact}>
            <span className="chat-widget__option-text">Contact Form</span>
            <img
              className="chat-widget__option-icon"
              src="https://directhomeservice.com/wp-content/uploads/2024/12/file-01.svg"
              alt="Contact Form"
            />
          </li>
          {window.callButton?.form && (
            <li className="chat-widget__option" onClick={handleCall}>
              <span className="chat-widget__option-text">Call Us</span>
              <img
                className="chat-widget__option-icon"
                src="https://directhomeservice.com/wp-content/uploads/2024/12/file-03.svg"
                alt="Call Us"
              />
            </li>
          )}
          <li className="chat-widget__option" onClick={handleChat}>
            <span className="chat-widget__option-text">Live Chat</span>
            <img
              className="chat-widget__option-icon"
              src="https://directhomeservice.com/wp-content/uploads/2024/12/file-05.svg"
              alt="Live Chat"
            />
          </li>
        </ul>
      </div>

      {/* Floating button */}
      <button
        className={`chat-widget__button ${menuOpen ? 'chat-widget__button--active' : ''}`}
        onClick={toggleMenu}
        aria-label="Contact us"
      >
        <img
          src="https://directhomeservice.com/wp-content/uploads/2024/12/file-09.svg"
          alt="Contact us"
        />
      </button>
    </>
  );
}
