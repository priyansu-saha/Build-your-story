import { useState } from "react";
import { DATA } from "../data";
import LightboxModal from "../components/LightboxModal";

const doodles = {
  Travel: "✈",
  "Graphic Designing": "🎨",
  Calligraphy: "✒️",
};

export default function FunSection() {
  const [lightboxState, setLightboxState] = useState({
    isOpen: false,
    imageSrc: "",
    title: "",
    subtitle: "",
    category: "",
    currentIndex: 0,
    imagesList: [],
  });

  // Collect all images across categories for smooth lightbox cycling
  const allMedia = DATA.fun.flatMap((item) =>
    (Array.isArray(item.images) ? item.images : []).map((src) => ({
      src,
      title: item.title,
      subtitle: item.subtitle,
      category: item.category,
    }))
  );

  const openLightbox = (src, title, subtitle, category) => {
    const index = allMedia.findIndex((m) => m.src === src);
    setLightboxState({
      isOpen: true,
      imageSrc: src,
      title,
      subtitle,
      category,
      currentIndex: index >= 0 ? index : 0,
    });
  };

  const closeLightbox = () => {
    setLightboxState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleNext = () => {
    if (lightboxState.currentIndex < allMedia.length - 1) {
      const nextIndex = lightboxState.currentIndex + 1;
      const nextItem = allMedia[nextIndex];
      setLightboxState((prev) => ({
        ...prev,
        currentIndex: nextIndex,
        imageSrc: nextItem.src,
        title: nextItem.title,
        subtitle: nextItem.subtitle,
        category: nextItem.category,
      }));
    }
  };

  const handlePrev = () => {
    if (lightboxState.currentIndex > 0) {
      const prevIndex = lightboxState.currentIndex - 1;
      const prevItem = allMedia[prevIndex];
      setLightboxState((prev) => ({
        ...prev,
        currentIndex: prevIndex,
        imageSrc: prevItem.src,
        title: prevItem.title,
        subtitle: prevItem.subtitle,
        category: prevItem.category,
      }));
    }
  };

  return (
    <section className="fun-section">
      <div className="fun-heading">
        <div>
          <span className="fun-heading-sparkle">✧</span>
          <h2>Beyond the Code</h2>
          <p>
            A glimpse into what fuels my curiosity outside engineering —
            travelling misty hills, designing graphics, and practicing calligraphy.
          </p>
        </div>

        <div className="fun-handwritten">
          Same me, just
          <br />
          with a different
          <br />
          kind of creativity ✨
        </div>
      </div>

      <div className="fun-gallery-hint">
        <span className="gallery-hint-dot" />
        <span>Click any photograph or artwork to view in fullscreen high-res</span>
      </div>

      <div className="fun-cards">
        {DATA.fun.map((item, index) => {
          const images = (
            Array.isArray(item.images)
              ? item.images
              : item.image
                ? [item.image]
                : []
          ).filter(Boolean);

          return (
            <article
              className={`fun-card fun-card-${index + 1}`}
              key={item.title}
            >
              <div className="fun-card-top">
                <span className="fun-category">
                  {item.category}
                </span>
                <span className="fun-doodle" aria-hidden="true">
                  {doodles[item.title] || "✦"}
                </span>
              </div>

              <h3>{item.title}</h3>
              <p className="fun-subtitle">{item.subtitle}</p>

              <div className="fun-collage">
                {images.map((src, imageIndex) => (
                  <div
                    className={`fun-photo fun-photo-${imageIndex + 1}`}
                    key={src}
                    onClick={() =>
                      openLightbox(src, item.title, item.subtitle, item.category)
                    }
                    role="button"
                    tabIndex={0}
                    aria-label={`View ${item.title} image ${imageIndex + 1} in full size`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        openLightbox(src, item.title, item.subtitle, item.category);
                      }
                    }}
                  >
                    <img
                      src={src}
                      alt={`${item.title} ${imageIndex + 1}`}
                      loading="lazy"
                    />
                    <span className="fun-photo-tape" />
                    <span className="photo-zoom-badge" aria-hidden="true">🔍</span>
                  </div>
                ))}
              </div>
            </article>
          );
        })}
      </div>

      <div className="fun-footer">
        <span>MADE OF LITTLE THINGS I LOVE</span>
        <span aria-hidden="true" className="fun-sparkles-row">✦ ✧ ♡ ✈</span>
      </div>

      {/* Lightbox Modal */}
      <LightboxModal
        isOpen={lightboxState.isOpen}
        onClose={closeLightbox}
        imageSrc={lightboxState.imageSrc}
        title={lightboxState.title}
        subtitle={lightboxState.subtitle}
        category={lightboxState.category}
        onPrev={handlePrev}
        onNext={handleNext}
        hasPrev={lightboxState.currentIndex > 0}
        hasNext={lightboxState.currentIndex < allMedia.length - 1}
      />
    </section>
  );
}
