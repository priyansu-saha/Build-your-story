import { useState } from "react";
import { DATA } from "../data";
import Avatar from "../components/Avatar";

const reflections = [
  {
    number: "01",
    title: "Who I Am",
    text: "I’m an engineering student who enjoys understanding how things work — from building full-stack applications to exploring what generative AI can make possible. I’m equally drawn to the creative side of things, whether that’s design, visual storytelling, or calligraphy.",
    highlight: "Engineering + Creativity",
  },
  {
    number: "02",
    title: "Who I Want to Be",
    text: "I want to become an engineer with strong fundamentals, an open mind, and the ability to turn ideas into useful things. I want to keep learning, adapt as technology changes, and choose depth over simply chasing the next trend.",
    highlight: "Depth over Trends",
  },
  {
    number: "03",
    title: "How I See Myself",
    text: "I see myself as a work in progress — curious, sometimes pulled in many directions, but always exploring. Engineering helps me break problems down; creativity reminds me that there can be more than one way to see them. I’m still figuring things out, and I’m okay with that.",
    highlight: "Curious & Evolving",
  },
];

export default function MeSection() {
  const [activeReflection, setActiveReflection] = useState(null);

  return (
    <section className="me-section">
      <div className="me-profile">
        <div className="me-photo-wrapper">
          <div className="me-photo">
            {DATA.photo ? (
              <img src={DATA.photo} alt={DATA.name} />
            ) : (
              <Avatar />
            )}
            <div className="me-photo-overlay" />
          </div>

          <div className="me-status-chip">
            <span className="me-live-beacon" />
            <span>Undergrad @ VSSUT</span>
          </div>
        </div>

        <div className="me-info">
          <div className="me-eyebrow">ABOUT ME</div>
          <h2>{DATA.name}</h2>

          <p className="me-meta">
            {DATA.age && (
              <>
                <span>{DATA.age} years old</span> <span className="meta-sep">•</span>
              </>
            )}
            <span>📍 {DATA.city}</span>
          </p>

          <div className="me-intro-lines">
            {DATA.intro.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>

          <div className="me-stats-row">
            <div className="stat-pill">
              <strong>🎓 B.Tech</strong>
              <small>Electronics &amp; Telecommunication</small>
            </div>
            <div className="stat-pill">
              <strong>⚡ 3+ Apps</strong>
              <small>Full Stack &amp; AI</small>
            </div>
            <div className="stat-pill">
              <strong>🎨 Creative</strong>
              <small>Design &amp; Lettering</small>
            </div>
          </div>

          <div className="me-tags">
            {DATA.tags.map((tag) => (
              <span key={tag} className="me-tag">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="me-bio-card">
        <h3>Background &amp; Philosophy</h3>
        {DATA.bio.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>

      {/* Reflective Stepper Section */}
      <div className="me-reflection">
        <div className="me-reflection-heading">
          <p className="me-reflection-eyebrow">
            A LITTLE MORE ABOUT ME
          </p>

          <h2>Still becoming.</h2>

          <p className="me-reflection-intro">
            Not a finished story — just a snapshot of who I am,
            what I’m working toward, and how I see myself right now.
          </p>
        </div>

        {/* Stepper connector bar */}
        <div className="me-stepper-line" aria-hidden="true" />

        <div className="me-reflection-grid">
          {reflections.map((item, index) => {
            const isActive = activeReflection === index;
            return (
              <article
                className={`me-reflection-card ${isActive ? "active" : ""}`}
                key={item.number}
                onMouseEnter={() => setActiveReflection(index)}
                onMouseLeave={() => setActiveReflection(null)}
              >
                <div className="card-top-row">
                  <span className="me-reflection-number">{item.number}</span>
                  <span className="reflection-badge">{item.highlight}</span>
                </div>

                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            );
          })}
        </div>

        {/* Story Flowchart Link Callout */}
        <div className="me-story-callout">
          <div className="story-callout-text">
            <h4>🗺️ Want to see how it all started and where I'm headed?</h4>
            <p>Explore the full interactive journey flowchart, personality spectrum, and future milestones.</p>
          </div>
          <span className="story-callout-pill">Ask "My Story" below 👇</span>
        </div>
      </div>
    </section>
  );
}

