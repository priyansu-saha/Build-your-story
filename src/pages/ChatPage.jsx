import { useEffect, useRef, useState } from "react";
import Avatar from "../components/Avatar";
import AskBar from "../components/AskBar";
import QuickChips from "../components/QuickChips";
import Icon from "../components/Icon";
import Typing from "../components/Typing";
import { SECTIONS } from "../sections";

// Helper to format assistant text with bolding and paragraphs
function FormattedMessage({ text }) {
  if (!text) return null;

  // Split into paragraphs
  const paragraphs = text.split("\n\n").filter(Boolean);

  const formatLine = (line) => {
    // Replace **bold** with strong
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="formatted-text">
      {paragraphs.map((p, pIndex) => (
        <p key={pIndex}>
          {p.split("\n").map((line, lIndex) => (
            <span key={lIndex}>
              {formatLine(line)}
              {lIndex < p.split("\n").length - 1 && <br />}
            </span>
          ))}
        </p>
      ))}
    </div>
  );
}

export default function ChatPage({
  messages,
  onAsk,
  onTopic,
  onHome,
  sending,
}) {
  const [chipsOpen, setChipsOpen] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const bottomRef = useRef(null);

  // Esc key listener to return home
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onHome();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onHome]);

  // Smooth scroll to bottom on new messages
  useEffect(() => {
    const container = document.querySelector(".chat .scroll");
    if (!container) return;

    const start = container.scrollTop;
    const end = container.scrollHeight - container.clientHeight;
    const duration = 600;
    let startTime;

    function animateScroll(timestamp) {
      if (startTime === undefined) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      container.scrollTop = start + (end - start) * eased;

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    }

    requestAnimationFrame(animateScroll);
  }, [messages]);

  const copyToClipboard = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }).catch(() => {});
  };

  return (
    <section className="chat">
      <header className="chat-top">
        <button
          type="button"
          className="chat-back-btn"
          onClick={() => onHome()}
          title="Return to start (Esc)"
        >
          <Avatar className="mini" aria-hidden="true" />
          <div className="chat-identity">
            <span className="chat-name">Priyansu AI</span>
            <span className="chat-status">
              <span className="status-dot" /> Online Twin
            </span>
          </div>
          <span className="chat-back-pill">
            ← Home <kbd>Esc</kbd>
          </span>
        </button>
      </header>

      <div className="scroll">
        <div className="thread">
          {messages.map((m) => {
            if (m.role === "user") {
              return (
                <div key={m.id} className="bubble-wrapper">
                  <div className="bubble">{m.text}</div>
                </div>
              );
            }
            if (m.role === "card") {
              const Section = SECTIONS[m.topic] || SECTIONS.fallback;
              return (
                <div key={m.id} className="reply reply-card">
                  <Section />
                </div>
              );
            }
            return (
              <div key={m.id} className="assistant-message">
                <div className="assistant-avatar-badge" aria-hidden="true">
                  <span>P</span>
                </div>
                {m.loading ? (
                  <div className="typing-bubble">
                    <Typing />
                    <span className="typing-label">Thinking…</span>
                  </div>
                ) : (
                  <div className={`reply${m.error ? " reply-error" : ""}`}>
                    <FormattedMessage text={m.text} />
                    {!m.error && (
                      <button
                        type="button"
                        className="copy-msg-btn"
                        onClick={() => copyToClipboard(m.text, m.id)}
                        title="Copy answer"
                      >
                        {copiedId === m.id ? "✓ Copied" : "Copy"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      <footer className="dock">
        <button
          className="toggle"
          type="button"
          aria-expanded={chipsOpen}
          onClick={() => setChipsOpen((o) => !o)}
        >
          <Icon name="down" />
          <span>{chipsOpen ? "Hide" : "Show"} quick questions</span>
        </button>
        <QuickChips off={!chipsOpen} onPick={onTopic} />
        <AskBar
          dock
          placeholder={sending ? "Priyansu AI is thinking…" : "Ask me anything..."}
          onSend={onAsk}
        />
        <p className="credit">Priyansu Saha · Generative AI &amp; Full Stack</p>
      </footer>
    </section>
  );
}
