import "server-only";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { collections } from "./database";

export const ADMIN_COOKIE = "angel_admin";
export class AccessError extends Error {}
export function accessConfigured() { return (process.env.ADMIN_ACCESS_KEY?.length || 0) >= 32; }
export function equalSecret(left: string, right: string) {
  return timingSafeEqual(createHash("sha256").update(left).digest(), createHash("sha256").update(right).digest());
}
export class RateLimitError extends AccessError {}
export const SESSION_SECONDS = 8 * 60 * 60;
const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");
// Sessions are random tokens recorded (hashed) in the database, so each one can be revoked
// individually on sign-out and no longer depends on the login key being used as a signing secret.
export async function createSession() {
  const token = randomBytes(32).toString("hex");
  const now = Date.now();
  await collections().adminSessions.insertOne({ tokenHash: hashToken(token), createdAt: new Date(now).toISOString(), expiresAt: new Date(now + SESSION_SECONDS * 1000) });
  return token;
}
export async function destroySession() {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (token) await collections().adminSessions.deleteOne({ tokenHash: hashToken(token) });
  store.delete(ADMIN_COOKIE);
}
export async function isAdmin() {
  if (!accessConfigured()) return false;
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return false;
  return !!(await collections().adminSessions.findOne({ tokenHash: hashToken(token), expiresAt: { $gt: new Date() } }, { projection: { _id: 1 } }));
}
// Replace this seam with the selected provider's session + restaurant-role check.
export async function requireAdmin() {
  if (!(await isAdmin())) throw new AccessError("Administrator access is required.");
}
export async function requireAdminPage() {
  if (!(await isAdmin())) redirect("/admin");
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const expected = process.env.ADMIN_ORIGIN || new URL(request.url).origin;
  if (origin !== expected) throw new AccessError("This request could not be verified. Reload and try again.");
}
export async function limitAttempts(request: Request) {
  // Shared across instances. Use only Vercel's trusted proxy header; otherwise one global bucket.
  const source = process.env.VERCEL ? request.headers.get("x-vercel-forwarded-for") || "unknown" : "local";
  const bucket = Math.floor(Date.now() / 600000);
  const key = createHash("sha256").update(`${source}:${bucket}`).digest("hex");
  const expiresAt = new Date(Date.now() + 600000);
  const row = await collections().rateLimits.findOneAndUpdate(
    { key },
    { $inc: { hits: 1 }, $set: { expiresAt }, $setOnInsert: { key } },
    { upsert: true, returnDocument: "after" },
  );
  if ((row?.hits || 1) > 10) throw new RateLimitError("Too many attempts. Try again in ten minutes.");
}
