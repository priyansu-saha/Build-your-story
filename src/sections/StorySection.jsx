import { useState } from "react";
import { DATA } from "../data";
import Icon from "../components/Icon";

export default function StorySection() {
  const [selectedNode, setSelectedNode] = useState(null);
  const story = DATA.story;

  return (
    <section className="story-section">
      {/* Header */}
      <div className="story-header">
        <div className="story-eyebrow-pill">
          <span className="story-beacon" />
          <span>EVOLUTION &amp; IDENTITY</span>
        </div>
        <h2>My Story &amp; Evolution</h2>
        <p className="story-lead">
          {story.tagline}
        </p>
      </div>

      {/* Part 1: Interactive Journey Flowchart */}
      <div className="flowchart-container">
        <div className="flowchart-heading">
          <span className="flowchart-icon">🗺️</span>
          <div>
            <h3>The Journey Flowchart</h3>
            <p>From questioning circuits to architecting autonomous multi-agent workflows.</p>
          </div>
        </div>

        <div className="timeline-flowchart">
          <div className="flowchart-spine" aria-hidden="true" />

          {story.timeline.map((item, index) => {
            const isSelected = selectedNode === index;
            const isFuture = item.year.toLowerCase().includes("horizon");

            return (
              <div
                key={item.phase}
                className={`flowchart-node ${isFuture ? "node-future" : ""} ${isSelected ? "selected" : ""}`}
                style={{ "--node-accent": item.color }}
                onClick={() => setSelectedNode(isSelected ? null : index)}
              >
                {/* Node Milestone Stamp on Spine */}
                <div className="node-marker" style={{ borderColor: item.color }}>
                  <span className="marker-dot" style={{ background: item.color }} />
                </div>

                <div className="node-card">
                  <div className="node-header">
                    <div className="node-year-badge" style={{ background: item.color }}>
                      {item.year}
                    </div>
                    <span className="node-phase">{item.phase}</span>
                    <span className="node-category">{item.category}</span>
                  </div>

                  <h4 className="node-title">{item.title}</h4>
                  <p className="node-summary">{item.summary}</p>

                  <div className="node-footer">
                    <span className="milestone-badge">
                      <span className="milestone-sparkle">✦</span>
                      <span>{item.milestone}</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Part 2: Personality Spectrum ("Who I Am at My Core") */}
      <div className="personality-container">
        <div className="personality-header">
          <span className="personality-badge">🧠 + 🎨</span>
          <h3>{story.personality.headline}</h3>
          <p>{story.personality.subhead}</p>
        </div>

        <div className="duality-grid">
          {story.personality.traits.map((trait) => (
            <article className="duality-card" key={trait.title}>
              <div className="duality-top">
                <div className="duality-icon">
                  <Icon name={trait.icon} />
                </div>
                <div>
                  <h4>{trait.title}</h4>
                  <span className="duality-tag">{trait.tag}</span>
                </div>
              </div>

              <ul className="duality-points">
                {trait.points.map((pt, i) => (
                  <li key={i}>
                    <span className="point-arrow">›</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        {/* Core Personal Philosophies */}
        <div className="philosophies-box">
          <h4>Core Principles That Guide Me</h4>
          <div className="values-grid">
            {story.personality.values.map((val) => (
              <div className="value-item" key={val.label}>
                <strong>{val.label}</strong>
                <p>{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Part 3: What I Want to Become */}
      <div className="aspirations-container">
        <div className="aspirations-header">
          <span className="vision-star">✦</span>
          <h3>What I Want to Become</h3>
          <p>
            Where I am steering my energy, learning curve, and engineering career next.
          </p>
        </div>

        <div className="aspirations-grid">
          {story.aspirations.map((asp, idx) => (
            <article className="aspiration-card" key={asp.title}>
              <span className="asp-index">0{idx + 1}</span>
              <span className="asp-tag">{asp.tag}</span>
              <h4>{asp.title}</h4>
              <p>{asp.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
