import { useEffect, useRef, useState } from "react";
import { DATA } from "../data";
import Icon from "../components/Icon";

// Map projects to rich tags
const PROJECT_TAGS = {
  CortexAI: ["LangChain", "Multi-Agent", "RAG", "MERN Stack"],
  TaxPal: ["React", "Node.js", "Express", "Fintech"],
  GreenPulse: ["Smart Agro", "React", "Node.js", "AI Analytics"],
};

export default function ProjectsSection() {
  const rail = useRef(null);
  const [edge, setEdge] = useState({ start: true, end: false });
  const [activeFilter, setActiveFilter] = useState("all");
  const [cardTilt, setCardTilt] = useState({});

  const update = () => {
    const el = rail.current;
    if (!el) return;
    setEdge({
      start: el.scrollLeft <= 4,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
    });
  };

  useEffect(() => {
    update();
    const el = rail.current;
    if (!el) return;

    const observer = new ResizeObserver(update);
    observer.observe(el);
    window.addEventListener("resize", update);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  // 3D tilt tracking for cards
  const handleCardMouseMove = (e, title) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -8;
    const rotY = ((x - centerX) / centerX) * 8;

    setCardTilt((prev) => ({
      ...prev,
      [title]: { x: rotX, y: rotY, shineX: (x / rect.width) * 100, shineY: (y / rect.height) * 100 },
    }));
  };

  const handleCardMouseLeave = (title) => {
    setCardTilt((prev) => ({
      ...prev,
      [title]: { x: 0, y: 0, shineX: 50, shineY: 50 },
    }));
  };

  const move = (direction) => {
    const el = rail.current;
    const card = el?.querySelector(".project-card");
    if (!el || !card) return;

    const styles = window.getComputedStyle(el);
    const gap = parseFloat(styles.columnGap) || 16;
    el.scrollBy({
      left: direction * (card.getBoundingClientRect().width + gap),
      behavior: "smooth",
    });
  };

  const filteredProjects = DATA.projects.filter((p) => {
    if (activeFilter === "genai") return p.kicker.toLowerCase().includes("generative") || p.title === "CortexAI";
    if (activeFilter === "fullstack") return p.kicker.toLowerCase().includes("stack") || p.title === "TaxPal" || p.title === "GreenPulse";
    return true;
  });

  return (
    <section className="projects-section">
      <div className="projects-header">
        <div>
          <h2>Featured Work</h2>
          <p className="section-intro">
            Interactive software, multi-agent frameworks, and applications I've built.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="project-filter-tabs">
          <button
            type="button"
            className={`filter-tab ${activeFilter === "all" ? "active" : ""}`}
            onClick={() => setActiveFilter("all")}
          >
            All ({DATA.projects.length})
          </button>
          <button
            type="button"
            className={`filter-tab ${activeFilter === "genai" ? "active" : ""}`}
            onClick={() => setActiveFilter("genai")}
          >
            AI &amp; Agents
          </button>
          <button
            type="button"
            className={`filter-tab ${activeFilter === "fullstack" ? "active" : ""}`}
            onClick={() => setActiveFilter("fullstack")}
          >
            Full Stack
          </button>
        </div>
      </div>

      <div className="rail" ref={rail} onScroll={update}>
        {filteredProjects.map((project) => {
          const tilt = cardTilt[project.title] || { x: 0, y: 0, shineX: 50, shineY: 50 };
          const tags = PROJECT_TAGS[project.title] || [];

          return (
            <a
              key={project.title}
              className="project-card"
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: project.bg,
                transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
              }}
              onMouseMove={(e) => handleCardMouseMove(e, project.title)}
              onMouseLeave={() => handleCardMouseLeave(project.title)}
            >
              <div
                className="project-shine"
                style={{
                  background: `radial-gradient(circle at ${tilt.shineX}% ${tilt.shineY}%, rgba(255,255,255,0.22) 0%, transparent 60%)`,
                }}
              />

              <div className="project-image">
                {project.image ? (
                  <img src={project.image} alt={`${project.title} preview`} />
                ) : (
                  <span className="project-art-fallback">{project.art}</span>
                )}
              </div>

              <div className="project-overlay-badge">
                <span className="project-kicker-pill">{project.kicker}</span>
                <span className="project-arrow" aria-hidden="true">↗</span>
              </div>
            </a>
          );
        })}
      </div>

      <div className="arrows">
        <button
          type="button"
          onClick={() => move(-1)}
          disabled={edge.start}
          aria-label="Previous projects"
        >
          <Icon name="left" />
        </button>
        <button
          type="button"
          onClick={() => move(1)}
          disabled={edge.end}
          aria-label="Next projects"
        >
          <Icon name="right" />
        </button>
      </div>

      <div className="projects-detailed-list">
        {filteredProjects.map((project) => (
          <article className="project-detail-card" key={project.title}>
            <div className="detail-header">
              <span className="detail-art">{project.art}</span>
              <div>
                <h3>{project.title}</h3>
                <span className="detail-kicker">{project.kicker}</span>
              </div>
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="detail-link-btn"
                aria-label={`View ${project.title} on GitHub`}
              >
                GitHub ↗
              </a>
            </div>
            <p className="detail-text">{project.text}</p>
            <div className="detail-tags">
              {(PROJECT_TAGS[project.title] || []).map((tag) => (
                <span key={tag} className="detail-tag">{tag}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
