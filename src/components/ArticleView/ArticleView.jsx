import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import './ArticleView.css';

export default function ArticleView({ article, onBack }) {
  const { t, getLocalized } = useLanguage();
  const [htmlContent, setHtmlContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState('');
  const [tocOpen, setTocOpen] = useState(false);
  const contentRef = useRef(null);
  const localized = getLocalized(article);

  // Fetch HTML content
  useEffect(() => {
    setLoading(true);
    setHeadings([]);
    setActiveId('');
    fetch(`/content/${article.id}.html`)
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.text();
      })
      .then(html => {
        setHtmlContent(html);
        setLoading(false);
      })
      .catch(() => {
        setHtmlContent('<p>Content not available.</p>');
        setLoading(false);
      });
  }, [article.id]);

  // Parse headings and add IDs after content renders
  useEffect(() => {
    if (!contentRef.current || loading) return;

    const els = contentRef.current.querySelectorAll('h1, h2, h3');
    const parsed = [];
    let index = 0;

    els.forEach(el => {
      const text = el.textContent.trim();
      if (!text) return;

      // Skip the first two h1s (article title + "Overview" which we render ourselves)
      const tag = el.tagName.toLowerCase();
      if (tag === 'h1' && index < 2) { index++; return; }

      const id = `section-${parsed.length}`;
      el.id = id;
      parsed.push({
        id,
        text,
        level: tag === 'h1' ? 1 : tag === 'h2' ? 2 : 3
      });
    });

    setHeadings(parsed);
    if (parsed.length > 0) setActiveId(parsed[0].id);
  }, [htmlContent, loading]);

  // Track active heading on scroll
  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the first visible heading
        const visible = entries.filter(e => e.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
    );

    headings.forEach(h => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  // Scroll to top when article changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [article.id]);

  const scrollTo = useCallback((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveId(id);
      setTocOpen(false);
    }
  }, []);

  return (
    <div className="article-view">
      <button className="article-view__back" onClick={onBack}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        {t.backButton}
      </button>

      <div className="article-view__header">
        <span className="article-view__icon">
          {article.icon && <article.icon size={32} color="#2E3192" variant="stroke" />}
        </span>
        <div>
          <h1 className="article-view__title">{localized.title}</h1>
          <span className="article-view__category">{localized.category}</span>
        </div>
      </div>

      {loading ? (
        <div className="article-view__loading">
          <div className="article-view__spinner" />
          <p>{t.loading}</p>
        </div>
      ) : (
        <>
          {/* Mobile TOC toggle */}
          {headings.length > 0 && (
            <div className="article-view__toc-mobile">
              <button
                className="article-view__toc-toggle"
                onClick={() => setTocOpen(!tocOpen)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12h18M3 6h18M3 18h18" />
                </svg>
                On this page
                <svg
                  className={`article-view__toc-chevron ${tocOpen ? 'article-view__toc-chevron--open' : ''}`}
                  width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {tocOpen && (
                <nav className="article-view__toc-dropdown">
                  {headings.map(h => (
                    <button
                      key={h.id}
                      className={`article-view__toc-item article-view__toc-item--l${h.level} ${activeId === h.id ? 'article-view__toc-item--active' : ''}`}
                      onClick={() => scrollTo(h.id)}
                    >
                      {h.text}
                    </button>
                  ))}
                </nav>
              )}
            </div>
          )}

          <div className="article-view__layout">
            {/* Sticky sidebar TOC (desktop) */}
            {headings.length > 0 && (
              <nav className="article-view__toc-sidebar">
                <p className="article-view__toc-label">On this page</p>
                <ul className="article-view__toc-list">
                  {headings.map(h => (
                    <li key={h.id}>
                      <button
                        className={`article-view__toc-link article-view__toc-link--l${h.level} ${activeId === h.id ? 'article-view__toc-link--active' : ''}`}
                        onClick={() => scrollTo(h.id)}
                      >
                        {h.text}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            )}

            {/* Article HTML content */}
            <div
              ref={contentRef}
              className="article-view__content doc-content"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          </div>
        </>
      )}

      {article.keywords && article.keywords.length > 0 && (
        <div className="article-view__keywords">
          <h3 className="article-view__keywords-label">{t.keywords}</h3>
          <div className="article-view__keywords-list">
            {article.keywords.map((kw, i) => (
              <span key={i} className="article-view__keyword">{kw}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
