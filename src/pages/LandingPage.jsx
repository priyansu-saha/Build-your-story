import { useState, useEffect, useRef } from "react";
import { DATA } from "../data";
import Avatar from "../components/Avatar";
import AskBar from "../components/AskBar";
import QuickChips from "../components/QuickChips";

const BADGE_TEXTS = [
  "Always curious, always building",
  "Using AI, never losing my curiosity",
  "A developer with a creative side",
  "I like making ideas come to life",
];

export default function LandingPage({ onAsk, onTopic }) {
  const [badgeIndex, setBadgeIndex] = useState(0);
  const askBarRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setBadgeIndex((prev) => (prev + 1) % BADGE_TEXTS.length);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  const handleAvatarClick = () => {
    askBarRef.current?.focus();
  };

  return (
    <main className="landing landing-new">
      <div className="landing-hero-content">
        <p className="hello">
          Hey, I'm <strong className="hello-name">{DATA.firstName}</strong> <span className="wave">👋</span>
        </p>

        <div className="hero-text-group">
          <h1 className="hero-title">
            <span className="hero-title-highlight">Building Ideas</span>
            <span className="hero-title-main">Into Reality.</span>
          </h1>

          <p className="hero-subheadline">
            Generative AI · Full Stack Development · Creative Design
          </p>
        </div>

        <div className="hero-rotating-badge" key={badgeIndex}>
          <span className="badge-sparkle">✦</span>
          <span className="badge-text">{BADGE_TEXTS[badgeIndex]}</span>
        </div>

        <Avatar
          className="hero-avatar float"
          interactive
          onClick={handleAvatarClick}
        />

        <div className="hero-wip-badge" title="Continuously evolving & updating">
          <span className="status-pulse-dot wip-dot" />
          <span className="status-pill-text">Work in Progress</span>
        </div>

        <AskBar ref={askBarRef} onSend={onAsk} />
        <QuickChips big onPick={onTopic} />

        <p className="landing-helper">
          <span className="helper-dot" />
          <span>Pick a topic or ask anything above to begin</span>
        </p>
      </div>
    </main>
  );
}
