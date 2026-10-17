import { useState } from "react";
import { DATA } from "../data";

const CONTACT_DETAILS = {
  Email: {
    handle: "priyansu.saha04@gmail.com",
    tagline: "Always open for collaborations & AI discussions",
    color: "#2563eb",
  },
  LinkedIn: {
    handle: "in/priyansu-saha-9067ab243",
    tagline: "Let's connect professionally & exchange ideas",
    color: "#0a66c2",
  },
  GitHub: {
    handle: "github.com/priyansu-saha",
    tagline: "Check out my repositories, agents, & open source code",
    color: "#24292f",
  },
};

export default function ContactSection() {
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText("priyansu.saha04@gmail.com").then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    }).catch(() => {});
  };

  return (
    <section className="contact-section">
      <div className="contact-heading-box">
        <div className="contact-badge-pill">
          <span className="contact-live-dot" />
          <span>Quick Connect</span>
        </div>
        <h2>Let's Build Something Great</h2>
        <p className="section-intro">
          Have an exciting project, an AI agent idea, or looking to collaborate?
          Reach out anytime — I'd love to chat.
        </p>
      </div>

      <div className="links">
        {DATA.contact.map((contact) => {
          const meta = CONTACT_DETAILS[contact.label] || {};
          const isEmail = contact.label === "Email";

          return (
            <div className="contact-card-wrapper" key={contact.label}>
              <a
                className="contact-card"
                href={contact.href}
                target={isEmail ? undefined : "_blank"}
                rel="noopener noreferrer"
                style={{ "--contact-color": meta.color || "#2563eb" }}
              >
                <div className="contact-card-icon" aria-hidden="true">
                  <span>{contact.emoji}</span>
                </div>

                <div className="contact-card-info">
                  <div className="contact-card-header">
                    <strong>{contact.label}</strong>
                    <span className="contact-handle">{meta.handle}</span>
                  </div>
                  <p className="contact-tagline">{meta.tagline}</p>
                </div>

                <span className="contact-arrow" aria-hidden="true">↗</span>
              </a>

              {isEmail && (
                <button
                  type="button"
                  className="contact-copy-btn"
                  onClick={handleCopyEmail}
                  title="Copy email address"
                  aria-label="Copy email address"
                >
                  {copied ? "✓ Copied!" : "📋 Copy"}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {copied && (
        <div className="contact-toast" role="status" aria-live="polite">
          <span>✨ Email copied to clipboard: <strong>priyansu.saha04@gmail.com</strong></span>
        </div>
      )}
    </section>
  );
}
