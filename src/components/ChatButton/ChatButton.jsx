import React, { useEffect, useState, useCallback } from 'react';
import './ChatButton.css';

export default function ChatButton() {
  const [visible, setVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Load LiveAgent scripts - exact pattern from the SP app
  useEffect(() => {
    // Contact Form button
    (function (d, src, c) {
      var t = d.scripts[d.scripts.length - 1];
      var s = d.createElement('script');
      s.id = 'la_x2s6df8d';
      s.defer = true;
      s.src = src;
      s.onload = s.onreadystatechange = function () {
        var rs = this.readyState;
        if (rs && rs !== 'complete' && rs !== 'loaded') return;
        c(this);
      };
      t.parentElement.insertBefore(s, t.nextSibling);
    })(document, 'https://directhomeservice.ladesk.com/scripts/track.js', function (e) {
      window.contactForm = window.LiveAgent.createButton('qfc0o8rw', e);
    });

    // Chat button
    (function (d, src, c) {
      var t = d.scripts[d.scripts.length - 1];
      var s = d.createElement('script');
      s.id = 'la_x2s6df8d';
      s.defer = true;
      s.src = src;
      s.onload = s.onreadystatechange = function () {
        var rs = this.readyState;
        if (rs && rs !== 'complete' && rs !== 'loaded') return;
        c(this);
      };
      t.parentElement.insertBefore(s, t.nextSibling);
    })(document, 'https://directhomeservice.ladesk.com/scripts/track.js', function (e) {
      window.chatButton = window.LiveAgent.createButton('ws5l92o9', e);
    });

    // Call button
    (function (d, src, c) {
      var t = d.scripts[d.scripts.length - 1];
      var s = d.createElement('script');
      s.id = 'la_x2s6df8d';
      s.defer = true;
      s.src = src;
      s.onload = s.onreadystatechange = function () {
        var rs = this.readyState;
        if (rs && rs !== 'complete' && rs !== 'loaded') return;
        c(this);
      };
      t.parentElement.insertBefore(s, t.nextSibling);
    })(document, 'https://directhomeservice.ladesk.com/scripts/track.js', function (e) {
      window.callButton = window.LiveAgent.createButton('hpnn2l51', e);
    });

    // Show button after scripts load
    const timer = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const toggleMenu = useCallback(() => {
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
      if (window.contactForm && window.contactForm.onClick) window.contactForm.onClick();
    }
  }, []);

  const handleContact = () => {
    setMenuOpen(false);
    if (window.contactForm && window.contactForm.onClick) window.contactForm.onClick();
  };

  const handleChat = () => {
    setMenuOpen(false);
    if (window.chatButton && window.chatButton.onClick) window.chatButton.onClick();
  };

  const handleCall = () => {
    setMenuOpen(false);
    if (window.callButton && window.callButton.onClick) window.callButton.onClick();
  };

  if (!visible) return null;

  return (
    <>
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
          <li className="chat-widget__option" onClick={handleCall}>
            <span className="chat-widget__option-text">Call Us</span>
            <img
              className="chat-widget__option-icon"
              src="https://directhomeservice.com/wp-content/uploads/2024/12/file-03.svg"
              alt="Call Us"
            />
          </li>
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
