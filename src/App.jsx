import { useState } from "react";
import { TOPICS } from "./data";
import { routeQuestion } from "./routing";
import Background from "./components/Background";
import LandingPage from "./pages/LandingPage";
import ChatPage from "./pages/ChatPage";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);

  const send = async (text, forcedTopic) => {
    const message = String(text || "").trim();
    if (!message || sending) return;

    const topic = forcedTopic || routeQuestion(message);
    const userId = `${Date.now()}-${Math.random()}-user`;

    // Topic buttons and recognized portfolio questions keep the card UI.
    if (topic && topic !== "fallback") {
      setMessages((previous) => [
        ...previous,
        { id: userId, role: "user", text: message },
        { id: `${userId}-card`, role: "card", text: message, topic, loading: false },
      ]);
      return;
    }

    const assistantId = `${userId}-assistant`;
    const prior = messages.filter((m) => m.role === "user" || m.role === "assistant");
    setMessages((previous) => [
      ...previous,
      { id: userId, role: "user", text: message },
      { id: assistantId, role: "assistant", text: "", loading: true },
    ]);
    setSending(true);

    try {
      const history = prior.slice(-12).map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        text: m.text,
      }));
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history }),
      });
      const raw = await response.text();
      let data = {};
      try { data = raw ? JSON.parse(raw) : {}; }
      catch { throw new Error(`Invalid API response (HTTP ${response.status}).`); }
      if (!response.ok) throw new Error(data.error || `Request failed: HTTP ${response.status}`);
      if (typeof data.reply !== "string" || !data.reply.trim()) throw new Error("The AI returned an empty response.");
      setMessages((previous) => previous.map((m) => m.id === assistantId ? { ...m, text: data.reply.trim(), loading: false } : m));
    } catch (error) {
      setMessages((previous) => previous.map((m) => m.id === assistantId ? { ...m, text: `Couldn't connect to Priyansu AI: ${error.message || "Please try again."}`, loading: false, error: true } : m));
    } finally {
      setSending(false);
    }
  };

  const onAsk = (question) => send(question);
  const onTopic = (key) => {
    const topic = TOPICS[key];
    if (topic) send(topic.prompt, key);
  };
  const chatting = messages.length > 0;

  return (
    <div className={`app-root ${chatting ? "view-chat" : "view-landing"}`}>
      <Background hidden={chatting} />
      <div className="view-transition-wrapper">
        {chatting ? (
          <ChatPage
            messages={messages}
            onAsk={onAsk}
            onTopic={onTopic}
            onHome={() => setMessages([])}
            sending={sending}
          />
        ) : (
          <LandingPage onAsk={onAsk} onTopic={onTopic} />
        )}
      </div>
    </div>
  );
}
