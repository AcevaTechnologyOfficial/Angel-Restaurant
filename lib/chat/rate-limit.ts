import "server-only";
import { clientSource, withinLimit } from "@/lib/rate-limit";

const PER_MINUTE = 20;
const PER_DAY = 200;
const DAY_MS = 24 * 60 * 60 * 1000;
// Site-wide ceiling on model calls per day, so a distributed abuser cannot run up the metered API key.
const GLOBAL_PER_DAY = Number(process.env.CHAT_DAILY_LIMIT || 2000);

export const rateLimitKey = (request: Request) => clientSource(request.headers);

// Fails closed: if the counters are unreachable the chat pauses rather than spending unmetered.
export async function rateLimit(source: string) {
  return (
    (await withinLimit("chat-minute", source, 60_000, PER_MINUTE, false)) &&
    (await withinLimit("chat-day", source, DAY_MS, PER_DAY, false)) &&
    (await withinLimit("chat-global", "all", DAY_MS, GLOBAL_PER_DAY, false))
  );
}
