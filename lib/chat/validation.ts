export type ChatRole = "user" | "model";
export type ChatTurn = { role: ChatRole; text: string };

const MAX_MESSAGE = 1200;
const MAX_TURNS = 20;

export function validateMessage(value: unknown): string {
  if (typeof value !== "string") throw new Error("Invalid message.");
  const text = value.trim();
  if (!text || text.length > MAX_MESSAGE) throw new Error("Invalid message.");
  return text;
}

export function trimHistory(value: unknown): ChatTurn[] {
  if (!Array.isArray(value)) return [];
  const turns = value.flatMap((turn) => {
    if (!turn || typeof turn !== "object") return [];
    const role = (turn as { role?: unknown }).role;
    const text = (turn as { text?: unknown }).text;
    if ((role !== "user" && role !== "model") || typeof text !== "string") return [];
    const clean = text.trim();
    if (!clean || clean.length > MAX_MESSAGE) return [];
    return [{ role, text: clean } as ChatTurn];
  });
  return turns.slice(-MAX_TURNS);
}

export { MAX_MESSAGE, MAX_TURNS };
