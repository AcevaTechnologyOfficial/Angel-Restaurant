import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { collections } from "./database";

export const ADMIN_COOKIE = "angel_admin";
export class AccessError extends Error {}
export function accessConfigured() { return (process.env.ADMIN_ACCESS_KEY?.length || 0) >= 32; }
export function equalSecret(left: string, right: string) {
  return timingSafeEqual(createHash("sha256").update(left).digest(), createHash("sha256").update(right).digest());
}
const sign = (value: string) => createHmac("sha256", process.env.ADMIN_ACCESS_KEY!).update(value).digest("hex");
export function createSession() {
  const expiry = String(Date.now() + 8 * 60 * 60 * 1000);
  return `${expiry}.${sign(expiry)}`;
}
export async function isAdmin() {
  if (!accessConfigured()) return false;
  const token = (await cookies()).get(ADMIN_COOKIE)?.value || "";
  const [expiry, signature] = token.split(".");
  return !!signature && Number(expiry) > Date.now() && equalSecret(signature, sign(expiry));
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
  if ((row?.hits || 1) > 10) throw new AccessError("Too many attempts. Try again in ten minutes.");
}
