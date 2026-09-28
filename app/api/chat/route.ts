import { getPublicMenu } from "@/lib/menu-repository";
import { AccessError, sameOrigin } from "@/lib/admin-access";
import { apiError, readJson } from "@/lib/api-response";
import { InputError } from "@/lib/menu-validation";
import { gateInput, resolveCta } from "@/lib/chat/gate";
import { buildSystemInstruction, toGeminiContents } from "@/lib/chat/prompt";
import { geminiConfig } from "@/lib/chat/client";
import { trimHistory, validateMessage } from "@/lib/chat/validation";
import { rateLimit, rateLimitKey } from "@/lib/chat/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// The upstream call below is given 30 seconds; without this the platform's own
// shorter default would kill the function first and truncate a streamed answer.
export const maxDuration = 30;

const encoder = new TextEncoder();
const UNAVAILABLE = "Please try again shortly.";
// Which onward route the answer offers: "resy" for an ordinary table, "event"
// for a celebration or private-event enquiry the restaurant team handles
// through the existing form. Carried on the failure paths too, so neither
// route disappears when the model is unavailable.
type Cta = "resy" | "event" | undefined;
const ctaHeader = (cta: Cta): Record<string, string> => (cta ? { "x-chat-cta": cta } : {});

// User-facing envelope. Distinct from apiError()'s `{ error }` shape because the
// widget renders these as ordinary assistant replies rather than failures: a
// blocked question is a normal outcome, not a broken request.
function gateResponse(message: string, gate: string, status = 200, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify({ type: "gate", message, gate }), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...extra },
  });
}

function streamText(response: Response, cta: Cta) {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("Gemini returned no stream.");
  const stream = new ReadableStream({
    async start(controller) {
      const decoder = new TextDecoder();
      let buffer = "";
      const emit = (line: string) => {
        if (!line.startsWith("data:")) return;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") return;
        const json = JSON.parse(payload) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
        const text = json.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("") || "";
        if (text) controller.enqueue(encoder.encode(text));
      };
      try {
        while (true) {
          const { value, done } = await reader.read();
          buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) emit(line);
          if (done) break;
        }
        if (buffer.trim()) emit(buffer);
        controller.close();
      } catch (error) {
        controller.error(error);
      } finally {
        reader.releaseLock();
      }
    },
    cancel() { reader.cancel().catch(() => {}); },
  });
  // The reservation verdict is computed server-side alongside the gate, so the
  // browser never needs the KB-backed intent matcher. A header carries it
  // because the body itself is the streamed answer.
  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
      ...ctaHeader(cta),
    },
  });
}

export async function POST(request: Request) {
  // Hoisted so every failure path below can still hand back the booking route.
  let cta: Cta;
  try {
    // Public endpoint, so there is no admin cookie to check. Browsers always send
    // Origin on a POST, so the shared same-origin check is what keeps a metered
    // API key from being driven cross-site.
    sameOrigin(request);

    if (!rateLimit(rateLimitKey(request))) return gateResponse(UNAVAILABLE, "rate_limit", 429, { "Retry-After": "60" });

    // readJson() enforces the same 20 KB bounded body as every other route here,
    // rejecting an oversized payload before it is buffered or parsed.
    const body = await readJson(request) as { message?: unknown; history?: unknown };
    const message = validateMessage(body.message);
    const history = trimHistory(body.history);

    const gate = gateInput(message, history);
    if (!gate.allowed) return gateResponse(gate.message, gate.kind, 200, { "x-chat-gate": gate.kind });

    cta = resolveCta(message, history);
    const config = geminiConfig();
    if (!config) return gateResponse(UNAVAILABLE, "unavailable", 200, ctaHeader(cta));

    const menu = await getPublicMenu();
    const promptMenu = { sections: menu.sections.map((section) => ({ title: section.title, kicker: section.kicker, items: section.items.map((item) => ({ name: item.name, price: item.price, description: item.description, vegetarian: item.vegetarian, vegan: item.vegan, tag: item.tag })) })) };
    const contents = toGeminiContents(history, message);
    // The key travels in a header rather than the query string, so it cannot be
    // captured by proxy logs or surface in an error carrying the request URL.
    const upstream = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(config.model)}:streamGenerateContent?alt=sse`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": config.apiKey },
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(30_000)]),
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: buildSystemInstruction(promptMenu) }] },
        contents,
        generationConfig: { temperature: 0.2, maxOutputTokens: 700, thinkingConfig: { thinkingLevel: "MINIMAL" } },
      }),
    });

    if (!upstream.ok) {
      const detail = await upstream.text().catch(() => "");
      console.error("Gemini chat error", upstream.status, detail.slice(0, 500));
      return gateResponse(UNAVAILABLE, "unavailable", 200, ctaHeader(cta));
    }

    return streamText(upstream, cta);
  } catch (error) {
    // Rejected origin, oversized body and malformed JSON are request faults and
    // answer in the repository's standard `{ error }` shape; anything else stays
    // a neutral in-conversation reply so the widget never leaks internals.
    if (error instanceof AccessError || error instanceof InputError || error instanceof SyntaxError) return apiError(error);
    console.error("Chat route error", error);
    return gateResponse(UNAVAILABLE, "unavailable", 200, ctaHeader(cta));
  }
}
