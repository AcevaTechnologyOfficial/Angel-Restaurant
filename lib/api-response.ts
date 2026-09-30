import "server-only";
import { AccessError, RateLimitError } from "./admin-access";
import { InputError } from "./menu-validation";
export function apiError(error: unknown) {
  // Unexpected failures (database down, upload service error) were previously invisible in the logs.
  if (!(error instanceof AccessError || error instanceof InputError || error instanceof SyntaxError)) console.error("Admin API error", error);
  const status = error instanceof RateLimitError ? 429 : error instanceof AccessError ? 403 : error instanceof InputError || error instanceof SyntaxError ? 400 : 503;
  const message = error instanceof AccessError || error instanceof InputError ? error.message : status === 400 ? "Please check the submitted details." : "We could not complete that request. Please try again shortly.";
  return Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}
export async function readJson(request: Request) {
  const text = await readBounded(request, 20000);
  return JSON.parse(new TextDecoder().decode(text)) as unknown;
}
export async function readBounded(request: Request, limit: number) {
  if (Number(request.headers.get("content-length")) > limit) throw new InputError("The upload is too large.");
  const reader = request.body?.getReader();
  if (!reader) throw new InputError("The request is empty.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) { await reader.cancel(); throw new InputError("The upload is too large."); }
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}
