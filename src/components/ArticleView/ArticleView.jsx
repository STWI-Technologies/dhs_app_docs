import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import Lightbox from '../Lightbox/Lightbox';
import './ArticleView.css';

function getImageCaption(img, index) {
  // Find the block-level container of this image
  let container = img.closest('p, div, span[style*="overflow"]') || img;

  // Walk backwards through siblings to find context
  let heading = '';
  let contextText = '';
  let sibling = container.previousElementSibling;
  let steps = 0;

  while (sibling && steps < 15) {
    const tag = sibling.tagName?.toLowerCase();
    const text = sibling.textContent?.trim();

    if (tag === 'h1' || tag === 'h2' || tag === 'h3') {
      heading = text;
      break;
    }

    // Grab the closest preceding text as context (skip empty or image-only elements)
    if (!contextText && text && text.length > 5 && tag === 'p') {
      // Skip if it's just an image wrapper paragraph
      if (!sibling.querySelector('img')) {
        contextText = text;
      }
    }

    sibling = sibling.previousElementSibling;
    steps++;
  }

  // Also check the immediate next sibling for "Step N:" patterns or descriptions
  let nextText = '';
  let nextSib = container.nextElementSibling;
  if (nextSib) {
    const nt = nextSib.textContent?.trim();
    if (nt && nt.length > 5 && nt.length < 120 && nextSib.tagName?.toLowerCase() === 'p') {
      nextText = nt;
    }
  }

  // Build description from context
  let description = '';
  if (contextText) {
    description = contextText.length > 120 ? contextText.substring(0, 120) + '...' : contextText;
  } else if (nextText) {
    description = nextText.length > 120 ? nextText.substring(0, 120) + '...' : nextText;
  }

  // Section heading
  const section = heading || '';

  // Combined caption for inline display
  let caption = '';
  if (section && description) {
    caption = section + ' — ' + description;
  } else if (section) {
    caption = section;
  } else if (description) {
    caption = description;
  } else {
    caption = `Figure ${index + 1}`;
  }

  return { caption, section, description };
}

export default function ArticleView({ article, onBack }) {
  const { t, getLocalized } = useLanguage();
  const [htmlContent, setHtmlContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState('');
  const [tocOpen, setTocOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const contentRef = useRef(null);
  const localized = getLocalized(article);

  // Fetch HTML content
  useEffect(() => {
    setLoading(true);
    setHeadings([]);
    setActiveId('');
    setLightboxImages([]);
    setLightboxIndex(-1);
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

  // Parse headings, collect images, add click handlers
  useEffect(() => {
    if (!contentRef.current || loading) return;

    // Parse headings for TOC
    const els = contentRef.current.querySelectorAll('h1, h2, h3');
    const parsed = [];
    let index = 0;
    els.forEach(el => {
      const text = el.textContent.trim();
      if (!text) return;
      const tag = el.tagName.toLowerCase();
      if (tag === 'h1' && index < 2) { index++; return; }
      const id = `section-${parsed.length}`;
      el.id = id;
      parsed.push({ id, text, level: tag === 'h1' ? 1 : tag === 'h2' ? 2 : 3 });
    });
    setHeadings(parsed);
    if (parsed.length > 0) setActiveId(parsed[0].id);

    // Collect all images, generate captions, inject caption elements
    const imgs = contentRef.current.querySelectorAll('img');
    const imageData = [];
    imgs.forEach((img, i) => {
      const { caption, section, description } = getImageCaption(img, i);
      imageData.push({ src: img.src, caption, section, description });
      img.dataset.lightboxIndex = i;
      img.title = caption || 'Click to enlarge';

      // Inject visible caption below the image's block container
      // Images are inside: <p><span style="overflow:hidden"><img></span></p>
      // We want to insert the caption AFTER the <p> that contains this image
      const blockParent = img.closest('p') || img.closest('div') || img.parentElement;
      if (blockParent && blockParent.parentElement) {
        // Check if a caption already exists right after this block
        const nextEl = blockParent.nextElementSibling;
        if (!nextEl || !nextEl.classList?.contains('doc-caption')) {
          const captionEl = document.createElement('figcaption');
          captionEl.className = 'doc-caption';
          captionEl.textContent = caption;
          blockParent.parentElement.insertBefore(captionEl, blockParent.nextSibling);
        }
      }
    });
    setLightboxImages(imageData);

    // Add click handler for images
    const handleImgClick = (e) => {
      const img = e.target.closest('img');
      if (img && img.dataset.lightboxIndex !== undefined) {
        setLightboxIndex(parseInt(img.dataset.lightboxIndex, 10));
      }
    };
    contentRef.current.addEventListener('click', handleImgClick);
    return () => {
      if (contentRef.current) {
        contentRef.current.removeEventListener('click', handleImgClick);
      }
    };
  }, [htmlContent, loading]);

  // Track active heading on scroll
  useEffect(() => {
    if (headings.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter(e => e.isIntersecting);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
    );
    headings.forEach(h => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [headings]);

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

  const closeLightbox = () => setLightboxIndex(-1);
  const nextImage = () => setLightboxIndex((i) => (i + 1) % lightboxImages.length);
  const prevImage = () => setLightboxIndex((i) => (i - 1 + lightboxImages.length) % lightboxImages.length);

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
          {headings.length > 0 && (
            <div className="article-view__toc-mobile">
              <button className="article-view__toc-toggle" onClick={() => setTocOpen(!tocOpen)}>
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

      {lightboxIndex >= 0 && (
        <Lightbox
          images={lightboxImages}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onNext={nextImage}
          onPrev={prevImage}
        />
      )}
    </div>
  );
}
