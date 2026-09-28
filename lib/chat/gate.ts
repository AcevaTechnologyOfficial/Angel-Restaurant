// Deterministic scope/intent gate. Runs BEFORE the model, on the server only.
//
// This module imports the knowledge base to build its scope lexicon, so importing
// it from a client component would ship the entire KB to the browser. The chat
// widget therefore does not gate locally: every message is gated in the route
// handler (app/api/chat/route.ts) and the verdict comes back over the wire.
// See lib/chat/kb.ts for why `server-only` is not imported here.
// Explicit extension: tests/chat-gate.test.mts loads this module under plain
// `node --test`, whose ESM loader does not resolve extensionless specifiers.
import { kb } from "./kb.ts";
import type { ChatTurn } from "./validation";

export type GateResult =
  | { allowed: true }
  | { allowed: false; kind: "redirect" | "profanity" | "gibberish"; message: string };

const REDIRECT = "Ask me about Chef Amrit or Angel Indian Restaurant.";
const PROFANITY = /(^|[^a-z])(fuck|fucking|shit|bullshit|bitch|asshole|motherfucker|cunt|pussy|whore|slut|dickhead|bastard)(?=$|[^a-z])/i;
const GREETINGS = /^(hi|hello|hey|good morning|good afternoon|good evening)\b/i;
const FOLLOW_UP = /^(?:which|what)\s+(?:ones?|items?|dishes?|options?)\??$|^(?:those|these|them|that|this)\??$|^(?:and\s+)?(?:the\s+)?(?:first|second|third|last|next|previous)\s+(?:one|ones|item|items|dish|dishes|option|options)\??$|^(?:and\s+)?(?:what about|how about)\s+(?:that|this|those|these|the\s+(?:first|second|last|other)\s+one)\??$/i;
// Private-service enquiries are handled by the restaurant team, never by Resy,
// so this is tested first everywhere below and always wins over booking wording.
const PRIVATE_SERVICE = /(private\s+(?:dining|event|party|room|hire)|wedding|corporate\s+(?:event|dinner)|birthday\s+party|company\s+dinner|\bevents?\b|\bcater(?:ing|er|ers|ed)?\b|\bhire\b|\bbuy\s?out\b)/i;
// Celebration vocabulary, grounded in the Occasion options the existing enquiry
// form already offers (OCCASIONS in lib/enquiry.ts) plus the natural phrasings
// visitors use for them. These route to the private dining enquiry, never Resy.
const CELEBRATION = /\b(birthdays?|anniversar(?:y|ies)|engagements?|weddings?|celebrations?|celebrate|celebrating|graduations?|reunions?|christening|banquet|baby\s+shower|bridal\s+shower|rehearsal\s+dinner|family\s+gathering|get[-\s]together)\b/i;
// A bare continuation ("how do I do that?") carries no intent words of its own,
// so it inherits the intent of the exchange directly above it.
const CONTINUATION = /^(?:and\s+)?(?:how|what|where|when|who)\b[^?]*\b(?:that|this|it|them|those)\b\??$|^(?:how|what)\s+(?:do|should|can|would)\s+i\b/i;
// The subjects this assistant exists to talk about. strongTopics below only holds
// the full phrases ("chef amrit", "angel restaurant"), so without this a visitor
// asking "tell me about chef" or "who is amrit?" was refused as out of scope.
const SUBJECT = /\b(chef|chefs|amrit|singh|angel|angel's|restaurant)\b/i;
// Ordinary table-booking vocabulary. Used both to admit the question into scope
// and to decide whether the Resy call to action is offered.
const RESERVATION = /\b(reserve|reservations?|resy|book|booking|availability|available)\b/i;
// Booking phrasing that never uses one of those words: "can I get a table
// tonight", "a table for four", "table Saturday".
const TABLE_REQUEST = /\b(?:get|getting|want|need|have|grab|find)\s+(?:us\s+|me\s+)?(?:a\s+)?table\b|\btable\s+(?:for|tonight|tomorrow|today|this|on|at|next|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i;

const strongTopics = [
  "angel indian restaurant", "angel restaurant", "chef amrit", "amrit pal singh", "menu", "dish", "dishes", "food", "halal", "vegetarian", "vegan", "tandoor", "biryani", "curry", "naan", "lamb", "chicken", "goat", "paneer", "dal", "private dining", "private event", "bar", "pathankot", "punjab", "australia", "rahi", "adda", "michelin", "bib gourmand", "jackson heights", "queens", "74 st", "broadway", "allergy", "dietary"
];
const operationalTopics = ["hours", "open", "closed", "address", "location", "phone", "email", "contact", "reservation", "reservations", "reserve", "resy", "table"];
const menuWords = kb.menu_snapshot.categories.flatMap((category) => category.items.map((item) => item.name.toLowerCase()));
const factWords = kb.facts.flatMap((fact) => fact.body.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length >= 4));
const scopeLexicon = new Set([...strongTopics, ...operationalTopics, ...menuWords, ...factWords]);

function singleUnknownWord(text: string) {
  const normalized = text.toLowerCase().replace(/[^a-z0-9'-]+/g, " ").trim();
  if (!normalized || normalized.includes(" ")) return false;
  return !scopeLexicon.has(normalized) && !GREETINGS.test(normalized);
}

function isClearlyInScope(text: string) {
  const normalized = text.toLowerCase();
  if (PRIVATE_SERVICE.test(normalized)) return true;
  if (CELEBRATION.test(normalized)) return true;
  // Booking language is in scope on its own. Without this, "I want to make a
  // booking" carries no other in-scope token and is refused as out of scope.
  if (RESERVATION.test(normalized) || TABLE_REQUEST.test(normalized)) return true;
  if (SUBJECT.test(normalized)) return true;
  if (menuWords.some((term) => normalized.includes(term))) return true;
  if (strongTopics.some((term) => normalized.includes(term))) return true;
  if (operationalTopics.some((term) => normalized.includes(term))) return true;
  return false;
}

export function hasReservationIntent(text: string) {
  const normalized = text.toLowerCase();
  if (PRIVATE_SERVICE.test(normalized)) return false;
  return RESERVATION.test(normalized) || TABLE_REQUEST.test(normalized);
}

// A celebration, event or catering enquiry. The restaurant team handles these
// through the existing private dining enquiry form, so they must never be sent
// to Resy. An explicit ordinary-table request wins: "can I book a table for my
// birthday?" is a normal reservation that happens to name an occasion.
export function hasCelebrationIntent(text: string) {
  const normalized = text.toLowerCase();
  if (hasReservationIntent(normalized)) return false;
  return PRIVATE_SERVICE.test(normalized) || CELEBRATION.test(normalized);
}

// Which call to action, if any, the answer should carry. Intent in the current
// message always wins; only an explicit continuation inherits from the turn
// above it, so the button never lingers over an unrelated later question.
export function resolveCta(text: string, history: ChatTurn[]): "resy" | "event" | undefined {
  if (hasReservationIntent(text)) return "resy";
  if (hasCelebrationIntent(text)) return "event";
  if (!CONTINUATION.test(text.trim())) return undefined;
  for (let index = history.length - 1; index >= 0; index--) {
    const turn = history[index];
    if (turn.role !== "user") continue;
    if (hasReservationIntent(turn.text)) return "resy";
    if (hasCelebrationIntent(turn.text)) return "event";
    return undefined;
  }
  return undefined;
}

export function gateInput(text: string, history: ChatTurn[]): GateResult {
  const value = text.trim();
  if (!value) return { allowed: false, kind: "redirect", message: REDIRECT };
  if (PROFANITY.test(value)) return { allowed: false, kind: "profanity", message: REDIRECT };
  if (GREETINGS.test(value) && value.split(/\s+/).length <= 3) return { allowed: false, kind: "redirect", message: REDIRECT };
  if (isClearlyInScope(value)) return { allowed: true };
  // A one-word follow-up ("those?", "them?") is indistinguishable from gibberish
  // in isolation, so the conversation is consulted before the unknown-word check
  // rather than after it. A word with no in-scope question behind it still falls
  // through to that check and is refused, so nothing is loosened.
  const hasRelevantContext = history.some((turn) => turn.role === "user" && isClearlyInScope(turn.text));
  if (hasRelevantContext && (FOLLOW_UP.test(value) || CONTINUATION.test(value))) return { allowed: true };
  if (singleUnknownWord(value)) return { allowed: false, kind: "gibberish", message: REDIRECT };
  return { allowed: false, kind: "redirect", message: REDIRECT };
}

export { REDIRECT };
