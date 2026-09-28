"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { ChatMessage } from "./ChatMessage";
// Imported here rather than in app/layout.tsx so the stylesheet travels with this
// component's chunk. SiteChrome loads the widget lazily and only outside /admin,
// so administration pages request neither the markup nor these styles.
import "@/app/chat.css";

// The assistant's single out-of-scope reply. The server owns the deterministic
// gate (it needs the knowledge base to run); this copy only covers the case where
// a response arrives with no usable text at all.
const REDIRECT = "Ask me about Chef Amrit or Angel Indian Restaurant.";
const MAX_TURNS = 20;
const MAX_MESSAGE = 1200;
// How close to the bottom counts as "following along", in pixels.
const PINNED_SLACK = 56;
// Exit transition. Kept in step with the angel-chat-settle keyframes in
// app/chat.css: the dialog stays mounted for exactly as long as it animates.
const EXIT_MS = 240;
const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type Cta = "resy" | "event";
type Turn = { id: number; role: "user" | "model"; text: string; cta?: Cta };

// Placing the caret in the composer opens the on-screen keyboard on a touch
// device, which would cover the transcript the visitor just opened. Keyboard
// and mouse visitors get the caret; touch visitors tap when they are ready.
// Same capability test as components/cursor.tsx.
const prefersCaret = () => typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

let turnId = 0;
const nextId = () => ++turnId;
const modelTurn = (id: number, text: string, cta?: Cta): Turn => ({ id, role: "model", text, cta });

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [loading, setLoading] = useState(false);
  // Held open for the length of the exit animation, then unmounted.
  const [closing, setClosing] = useState(false);
  const exitTimer = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const frameRef = useRef(0);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  // Auto-scroll only while the visitor is at the bottom, so scrolling up to
  // re-read an answer is never yanked back down mid-stream.
  const pinnedRef = useRef(true);

  // A native modal dialog, as components/gallery-lightbox.tsx uses: focus
  // containment, Escape and an inert background come from the platform rather
  // than from a hand-rolled key handler. Cleanup returns focus to the launcher.
  useEffect(() => {
    if (!open) return;
    const launcher = launcherRef.current;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    dialogRef.current?.showModal();
    if (prefersCaret()) inputRef.current?.focus();
    pinnedRef.current = true;
    return () => {
      document.body.style.overflow = overflow;
      launcher?.focus();
    };
  }, [open]);

  // The composer is disabled while a reply streams, and a disabled control
  // cannot hold focus, so the browser drops it to <body>. Put the caret back
  // once the answer settles — but only when nothing else holds focus, so a link
  // or button the visitor deliberately moved to is never stolen from.
  useEffect(() => {
    if (!open || loading || !prefersCaret()) return;
    const active = document.activeElement;
    if (!active || active === document.body || active === dialogRef.current) inputRef.current?.focus();
  }, [open, loading]);

  // A direct scrollTop write rather than scrollIntoView: one layout write per
  // committed frame instead of a read-then-scroll on every streamed chunk.
  useEffect(() => {
    if (!open || !pinnedRef.current) return;
    const el = transcriptRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  });

  useEffect(() => () => {
    abortRef.current?.abort();
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    if (exitTimer.current) clearTimeout(exitTimer.current);
  }, []);

  const onTranscriptScroll = useCallback(() => {
    const el = transcriptRef.current;
    if (el) pinnedRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < PINNED_SLACK;
  }, []);

  // The panel settles out rather than vanishing. The dialog stays mounted and
  // modal for the duration, so focus containment holds throughout and the
  // launcher is refocused by the open effect's cleanup exactly as before —
  // just a beat later. Reduced motion skips the wait entirely.
  function close() {
    if (closing) return;
    abortRef.current?.abort();
    if (reducedMotion()) { setOpen(false); return; }
    setClosing(true);
    exitTimer.current = window.setTimeout(() => { setClosing(false); setOpen(false); }, EXIT_MS);
  }

  async function submit(event?: FormEvent) {
    event?.preventDefault();
    const message = input.trim();
    if (!message || loading) return;
    const history = turns.slice(-MAX_TURNS).map(({ role, text }) => ({ role, text }));
    const base = [...turns, { id: nextId(), role: "user", text: message } as Turn].slice(-MAX_TURNS);
    setInput("");
    setTurns(base);
    setLoading(true);
    pinnedRef.current = true;
    const controller = new AbortController();
    abortRef.current = controller;
    const modelId = nextId();
    let text = "";
    let started = false;

    // Streamed chunks arrive far faster than the screen refreshes. Text is
    // accumulated in a local and committed at most once per animation frame, so
    // 100+ chunks become ~1 render per frame instead of 100+ React commits.
    const commit = () => {
      frameRef.current = 0;
      setTurns((prev) => prev.map((turn) => (turn.id === modelId ? { ...turn, text } : turn)));
    };
    const schedule = () => { if (!frameRef.current) frameRef.current = requestAnimationFrame(commit); };
    const settle = (value: string, cta?: Cta) => {
      if (frameRef.current) { cancelAnimationFrame(frameRef.current); frameRef.current = 0; }
      setTurns((prev) => (started
        ? prev.map((turn) => (turn.id === modelId ? { ...turn, text: value, cta } : turn))
        : [...prev, modelTurn(modelId, value, cta)].slice(-MAX_TURNS)));
    };

    try {
      const response = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message, history }), signal: controller.signal });
      const type = response.headers.get("content-type") || "";
      // Reservation intent is decided on the server, beside the gate, so the
      // browser never needs the knowledge base to know when to offer Resy.
      const header = response.headers.get("x-chat-cta");
      const cta = header === "resy" || header === "event" ? (header as Cta) : undefined;
      if (type.includes("application/json")) {
        // `cta` is honoured here too: when the model is unavailable the visitor
        // still gets the booking route rather than only "try again shortly".
        const data = await response.json() as { message?: string; error?: string };
        settle(data.message || data.error || REDIRECT, cta);
        return;
      }
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response stream.");
      const decoder = new TextDecoder();
      started = true;
      setTurns((prev) => [...prev, modelTurn(modelId, "", cta)].slice(-MAX_TURNS));
      while (true) {
        const { value, done } = await reader.read();
        if (value) { text += decoder.decode(value, { stream: !done }); schedule(); }
        if (done) break;
      }
      text += decoder.decode();
      settle(text || REDIRECT, cta);
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        settle(text ? `${text} — Sorry, that answer was cut short.` : REDIRECT);
      } else if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = 0;
      }
    } finally {
      abortRef.current = null;
      setLoading(false);
    }
  }

  // Shown from the moment the question is sent until the first streamed
  // character lands, then replaced by the answer itself as it types out.
  const latest = turns[turns.length - 1];
  const typing = loading && (!latest || latest.role === "user" || latest.text === "");

  return (
    <>
      <button ref={launcherRef} className="angel-chat-launcher" type="button" aria-haspopup="dialog" aria-expanded={open} aria-label="Ask Angel" onClick={() => setOpen(true)}>
        <span className="angel-chat-launcher-mark" aria-hidden="true">A</span>
        <span className="angel-chat-launcher-label">Ask Angel</span>
      </button>
      {open && (
        <dialog
          ref={dialogRef}
          className="angel-chat-dialog"
          data-closing={closing || undefined}
          aria-label="Ask Angel assistant"
          onCancel={(event) => { event.preventDefault(); close(); }}
          onMouseDown={(event) => { if (event.target === dialogRef.current) close(); }}
        >
          <section className="angel-chat-panel">
            <header className="angel-chat-header">
              <span className="angel-chat-crest" aria-hidden="true">A</span>
              <span className="angel-chat-titles">
                <span className="angel-chat-kicker">Angel Indian Restaurant</span>
                <span className="angel-chat-title">Ask Angel</span>
              </span>
              <button className="angel-chat-close" type="button" aria-label="Close chat" title="Close" onClick={close}>
                <span className="angel-chat-close-label" aria-hidden="true">Close</span>
                <svg className="angel-chat-close-mark" viewBox="0 0 10 10" aria-hidden="true" focusable="false"><path d="M1 1 9 9M9 1 1 9" /></svg>
              </button>
            </header>
            <div className="angel-chat-transcript" ref={transcriptRef} onScroll={onTranscriptScroll} aria-live="polite" aria-busy={loading}>
              {turns.length === 0 && (
                <div className="angel-chat-welcome">
                  <span className="angel-chat-welcome-rule" aria-hidden="true" />
                  <p className="angel-chat-welcome-lead">Welcome to Angel.</p>
                  <p className="angel-chat-welcome-note">Ask about Chef Amrit, the menu, the restaurant, or reservations.</p>
                </div>
              )}
              {/* The stream opens an empty model turn before the first chunk; the
                  typing indicator stands in for it rather than an empty bubble. */}
              {turns.map((turn) => turn.role === "model" && !turn.text ? null : <ChatMessage key={turn.id} role={turn.role} text={turn.text} cta={turn.cta} />)}
              {typing && (
                <div className="angel-chat-message angel-chat-message-model angel-chat-typing">
                  <span className="angel-chat-sr">Angel is typing</span>
                  <span className="angel-chat-typing-dots" aria-hidden="true"><i /><i /><i /></span>
                </div>
              )}
            </div>
            <form className="angel-chat-form" onSubmit={submit}>
              <input ref={inputRef} value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask about Angel…" aria-label="Message Angel" maxLength={MAX_MESSAGE} disabled={loading} autoComplete="off" enterKeyHint="send" />
              <button className="angel-chat-send" type="submit" aria-label="Send message" disabled={loading || !input.trim()}>
                <span aria-hidden="true">↗</span>
              </button>
            </form>
          </section>
        </dialog>
      )}
    </>
  );
}
