import "server-only";
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 20;
const windows = new Map<string, { started: number; count: number }>();
// Rate-limit identity. Only Vercel's own proxy header may be trusted: x-real-ip
// and x-forwarded-for are ordinary request headers, so a caller can rotate them
// per request and defeat the limiter entirely — which matters here because the
// endpoint spends a metered API key. Mirrors limitAttempts() in lib/admin-access.ts.
// Off Vercel there is no trusted source, so every caller shares one bucket.
export function rateLimitKey(request: Request) {
  return process.env.VERCEL ? request.headers.get("x-vercel-forwarded-for")?.trim() || "unknown" : "local";
}
export function rateLimit(key: string) {
  const now = Date.now(); const current = windows.get(key);
  if (!current || now - current.started >= WINDOW_MS) { windows.set(key, { started: now, count: 1 }); return true; }
  current.count += 1; return current.count <= MAX_REQUESTS;
}
export function resetRateLimits() { windows.clear(); }
