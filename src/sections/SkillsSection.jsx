import { useState } from "react";
import { DATA } from "../data";
import Icon from "../components/Icon";

const CATEGORY_COLORS = {
  "Frontend Development": "#06b6d4",
  "Backend & Databases": "#10b981",
  "AI & Generative AI": "#8b5cf6",
  "Programming & Tools": "#f59e0b",
  "Design & Creative Tools": "#ec4899",
  "Soft Skills": "#6366f1",
};

export default function SkillsSection() {
  const [search, setSearch] = useState("");

  const query = search.trim().toLowerCase();

  return (
    <section className="skills-section">
      <div className="skills-header">
        <div>
          <h2>Skills &amp; Expertise</h2>
          <p className="section-intro">
            Modern tools and technologies I use to build scalable web applications and intelligent AI agents.
          </p>
        </div>

        {/* Live Filter / Search input */}
        <div className="skills-search-wrapper">
          <span className="search-icon" aria-hidden="true">🔍</span>
          <input
            type="text"
            className="skills-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search skill (e.g. React, LangChain, Python)..."
            aria-label="Search skills"
          />
          {search && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="skills-bento-grid">
        {DATA.skills.map((group) => {
          const accentColor = CATEGORY_COLORS[group.title] || "#3b82f6";
          const matchingItems = group.items.filter((item) =>
            query ? item.toLowerCase().includes(query) : true
          );
          const hasMatches = matchingItems.length > 0;

          return (
            <article
              className={`skill-group-card ${!hasMatches && query ? "skill-card-dimmed" : ""}`}
              key={group.title}
              style={{ "--group-accent": accentColor }}
            >
              <div className="skill-card-header">
                <div className="skill-icon-pill" style={{ color: accentColor }}>
                  <Icon name={group.icon} />
                </div>
                <h3>{group.title}</h3>
                <span className="skill-count">{group.items.length}</span>
              </div>

              <div className="skill-tags">
                {group.items.map((skill) => {
                  const isHighlighted = query && skill.toLowerCase().includes(query);
                  return (
                    <span
                      key={skill}
                      className={`skill-pill ${isHighlighted ? "highlighted" : ""}`}
                    >
                      <span className="skill-dot" />
                      {skill}
                    </span>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
