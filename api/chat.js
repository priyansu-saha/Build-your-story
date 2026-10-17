import { GoogleGenAI } from "@google/genai";

const PROFILE = `
IDENTITY & PURPOSE
You are Priyansu AI, a friendly, smart, and conversational AI representation of Priyansu Saha.
You represent Priyansu's portfolio, ideas, skills, and approach to technology, while also being a capable, witty, and thoughtful conversational partner.

ABOUT PRIYANSU
- Background: Engineering student in Electronics and Telecommunication at VSSUT, Burla (Sambalpur, Odisha).
- Focus: Full Stack Development, Generative AI, AI Agents, and Creative Design (calligraphy, UI/UX, lettering).
- Key Projects:
  1. CortexAI: Multi-agent application exploring document intelligence, agent orchestration, RAG architectures, and autonomous workflows.
  2. TaxPal: Smart full-stack freelancer tax estimation & financial planning platform.
  3. GreenPulse: Smart agrotech platform helping farmers track soil health and crop vitals with practical tech.
- Philosophy & Approach:
  - "Curiosity Over Comfort": Driven by an itch to understand how things work underneath.
  - "Build to Understand": Learns fastest by building real things and solving practical problems.
  - "Creativity Meets Logic": Merges technical engineering rigor with creative design aesthetics.
  - "Think Beyond AI": Uses AI as a powerful cognitive amplifier, while ensuring genuine human curiosity, judgment, and creativity remain at the center.

CONVERSATION & GENERAL QUESTIONS
- You are happy to answer ANY question! You do NOT restrict conversation only to Priyansu's resume.
- When asked general questions — whether about coding (React, Node, Python, C++), AI concepts (LLMs, RAG, embeddings, fine-tuning, agents), system design, tech news, career, creative ideas, or even casual fun prompts (jokes, casual banter) — answer helpfully, clearly, and insightfully from your perspective as an enthusiastic engineering student who loves software and GenAI!
- For questions specifically about Priyansu, share the confirmed details above naturally in the first person ("I built...", "I'm exploring...").
- For questions outside Priyansu's personal life, share your best knowledge generously and conversationally.
- Tone: Casual, sharp, authentic, and developer-friendly. Use contractions ("I'm", "it's", "don't"). Avoid robotic corporate fluff. Keep responses concise and engaging.
`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader?.("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed. Please use POST." });
  }

  const rawKey = process.env.GEMINI_API_KEY || "";
  const apiKey = rawKey.replace(/^["']|["']$/g, "").trim();

  if (!apiKey) {
    return res.status(500).json({
      error: "GEMINI_API_KEY is not configured. Please add your Gemini API key to the .env file.",
    });
  }

  try {
    const { message, history = [] } = req.body ?? {};

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        error: "Please enter a message.",
      });
    }

    if (message.length > 4000) {
      return res.status(400).json({
        error: "Please keep your message under 4000 characters.",
      });
    }

    // Format valid conversation turns
    const safeHistory = Array.isArray(history)
      ? history
          .filter(
            (item) =>
              item &&
              ["user", "model"].includes(item.role) &&
              typeof item.text === "string"
          )
          .slice(-10)
          .map((item) => ({
            role: item.role,
            parts: [{ text: item.text.slice(0, 4000) }],
          }))
      : [];

    const ai = new GoogleGenAI({ apiKey });

    const requestedModel = (process.env.GEMINI_MODEL || "gemini-3.8-flash")
      .replace(/^["']|["']$/g, "")
      .trim();

    // Discover active models for this key if permitted
    let discoveredModels = [];
    try {
      const modelPager = await ai.models.list({ config: { pageSize: 50 } });
      for await (const m of modelPager) {
        if (m.name) {
          discoveredModels.push(m.name.replace(/^models\//, ""));
        }
      }
    } catch {
      // Continue with standard candidate models
    }

    const candidateModels = [
      requestedModel,
      "gemini-3.8-flash",
      ...discoveredModels.filter((m) => m.includes("flash")),
      "gemini-2.0-flash",
      "gemini-2.5-flash",
      "gemini-2.0-flash-lite",
      "gemini-1.5-flash",
    ].filter((m, i, arr) => m && arr.indexOf(m) === i);

    let replyText = "";
    let lastError = null;

    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: [
            ...safeHistory,
            {
              role: "user",
              parts: [{ text: message.trim() }],
            },
          ],
          config: {
            systemInstruction: PROFILE,
            temperature: 0.75,
            maxOutputTokens: 800,
          },
        });

        if (response?.text) {
          replyText = response.text.trim();
          break;
        }
      } catch (err) {
        console.warn(`Gemini model ${model} attempt failed:`, err.message);
        lastError = err;
      }
    }

    if (replyText) {
      return res.status(200).json({ reply: replyText });
    }

    // If all candidate models failed
    const errorMsg = lastError?.message || "All candidate Gemini models failed to respond.";
    console.error("Gemini invocation failed:", errorMsg);

    return res.status(500).json({
      error: `Gemini API error: ${errorMsg}. Please verify your GEMINI_API_KEY.`,
    });
  } catch (error) {
    console.error("Handler error:", error);
    return res.status(500).json({
      error: `Server error: ${error.message || "Failed to process chat request."}`,
    });
  }
}
