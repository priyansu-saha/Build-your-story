import { useEffect } from "react";
import Icon from "./Icon";

export default function LightboxModal({
  isOpen,
  onClose,
  imageSrc,
  title,
  subtitle,
  category,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft" && hasPrev && onPrev) {
        onPrev();
      } else if (e.key === "ArrowRight" && hasNext && onNext) {
        onNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, onPrev, onNext, hasPrev, hasNext]);

  if (!isOpen || !imageSrc) return null;

  return (
    <div
      className="lightbox-overlay"
      onClick={() => onClose()}
      role="dialog"
      aria-modal="true"
      aria-label={title || "Image Lightbox"}
    >
      <div className="lightbox-backdrop" />

      <div
        className="lightbox-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="lightbox-close"
          onClick={() => onClose()}
          aria-label="Close photo preview"
        >
          ✕
        </button>

        {hasPrev && (
          <button
            type="button"
            className="lightbox-nav lightbox-prev"
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            aria-label="Previous photo"
          >
            <Icon name="left" />
          </button>
        )}

        <div className="lightbox-media-wrapper">
          <img
            src={imageSrc}
            alt={title || "Preview"}
            className="lightbox-image"
          />
        </div>

        {hasNext && (
          <button
            type="button"
            className="lightbox-nav lightbox-next"
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            aria-label="Next photo"
          >
            <Icon name="right" />
          </button>
        )}

        <div className="lightbox-caption">
          {category && <span className="lightbox-category">{category}</span>}
          {title && <h3 className="lightbox-title">{title}</h3>}
          {subtitle && <p className="lightbox-subtitle">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}
