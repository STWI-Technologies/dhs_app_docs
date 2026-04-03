import React, { useEffect, useCallback } from 'react';
import './Lightbox.css';

export default function Lightbox({ images, currentIndex, onClose, onNext, onPrev }) {
  const image = images[currentIndex];

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowRight') onNext();
    if (e.key === 'ArrowLeft') onPrev();
  }, [onClose, onNext, onPrev]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  if (!image) return null;

  return (
    <div className="lightbox" onClick={onClose}>
      <div className="lightbox__content" onClick={(e) => e.stopPropagation()}>
        {/* Close */}
        <button className="lightbox__close" onClick={onClose} aria-label="Close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Prev */}
        {images.length > 1 && (
          <button className="lightbox__nav lightbox__nav--prev" onClick={onPrev} aria-label="Previous">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        )}

        {/* Image */}
        <img src={image.src} alt={image.caption || ''} className="lightbox__image" />

        {/* Next */}
        {images.length > 1 && (
          <button className="lightbox__nav lightbox__nav--next" onClick={onNext} aria-label="Next">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        )}

        {/* Caption + Counter */}
        <div className="lightbox__footer">
          {image.caption && <p className="lightbox__caption">{image.caption}</p>}
          <span className="lightbox__counter">{currentIndex + 1} / {images.length}</span>
        </div>
      </div>
    </div>
  );
}
