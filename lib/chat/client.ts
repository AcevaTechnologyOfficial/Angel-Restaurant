import "server-only";

const MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

export function geminiConfig() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return { apiKey, model: MODEL };
}
