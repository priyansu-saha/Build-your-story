// Keyword routing for portfolio topics
const KEYS = {
  story: /story|journey|timeline|flow\s*chart|roadmap|how\s*it\s*started|start|began|become|becoming|dream|goal|vision|future|personality|get\s*to\s*know|know\s*me|know\s*you|talk\s*to\s*me|talk\s*with\s*me/i,
  me: /who|about|you\b|bio|age|live/i,
  projects: /project|work|build|portfolio/i,
  skills: /skill|stack|tech|language|tool/i,
  fun: /fun|hobb|sport|free time|calligraphy|travel/i,
  contact: /contact|email|reach|hire|touch|linkedin|github/i
};
export const routeQuestion = (q) => Object.keys(KEYS).find((k) => KEYS[k].test(q)) || "fallback";
