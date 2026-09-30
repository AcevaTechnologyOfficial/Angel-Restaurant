import "server-only";
import { createHash } from "node:crypto";
import { collections } from "./database";

// Rate-limit identity. Only Vercel's own proxy header may be trusted: x-real-ip
// and x-forwarded-for are ordinary request headers, so a caller can rotate them
// per request and defeat the limiter. Off Vercel there is no trusted source, so
// every caller shares one bucket.
export function clientSource(headers: Headers) {
  return process.env.VERCEL ? headers.get("x-vercel-forwarded-for")?.trim() || "unknown" : "local";
}

// Counters live in MongoDB (with a TTL index on expiresAt), so the limit holds
// across serverless instances and cold starts. Returns true while under the limit.
// `failOpen` decides what happens if the database is unreachable.
export async function withinLimit(scope: string, source: string, windowMs: number, max: number, failOpen: boolean) {
  const bucket = Math.floor(Date.now() / windowMs);
  const key = createHash("sha256").update(`${scope}:${source}:${bucket}`).digest("hex");
  try {
    const row = await collections().rateLimits.findOneAndUpdate(
      { key },
      { $inc: { hits: 1 }, $set: { expiresAt: new Date((bucket + 1) * windowMs + 60_000) }, $setOnInsert: { key } },
      { upsert: true, returnDocument: "after" },
    );
    return (row?.hits ?? 1) <= max;
  } catch (error) {
    console.error("Rate limit store unavailable", error instanceof Error ? error.message : error);
    return failOpen;
  }
}
