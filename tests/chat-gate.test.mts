import test from "node:test";
import assert from "node:assert/strict";
import { gateInput, hasReservationIntent, hasCelebrationIntent, resolveCta, REDIRECT } from "../lib/chat/gate.ts";
import type { ChatTurn } from "../lib/chat/validation.ts";

const allowed = (text: string, history: ChatTurn[] = []) => gateInput(text, history).allowed;
// The redirect copy only exists on a refusal, so reading it through a narrowing
// helper also asserts that the input was in fact refused.
const refusal = (text: string, history: ChatTurn[] = []) => {
  const result = gateInput(text, history);
  return result.allowed ? null : result.message;
};

test("blocks arbitrary unknown single words with and without context", () => {
  const history: ChatTurn[] = [{ role: "user", text: "What are the hours?" }, { role: "model", text: "Tuesday–Sunday, 12 PM–10 PM." }];
  for (const word of ["hekki", "qwerty", "xyzabc", "blorptastic"]) {
    assert.equal(allowed(word), false);
    assert.equal(allowed(word, history), false);
    assert.equal(refusal(word, history), REDIRECT);
  }
});

test("keeps contextual follow-ups working", () => {
  const history: ChatTurn[] = [{ role: "user", text: "What are the vegetarian dishes?" }, { role: "model", text: "There are several vegetarian dishes." }];
  assert.equal(allowed("which ones?", history), true);
  assert.equal(allowed("the second one?", history), true);
  assert.equal(allowed("those?", history), true);
  assert.equal(allowed("which ones?", []), false);
});

test("blocks profanity", () => assert.equal(refusal("fuck"), REDIRECT));

// The scope list only held the full phrases ("chef amrit", "angel restaurant"),
// so asking about the subject by its ordinary name was refused as out of scope.
test("bare subject nouns are in scope, not only the full phrases", () => {
  for (const phrase of [
    "tell me about chef",
    "who is amrit?",
    "who is the chef?",
    "tell me about angel",
    "what makes the restaurant special?",
    "chef",
    "amrit",
    "who is chef amrit?",
    "tell me about Chef Amrit Pal Singh",
  ]) {
    assert.equal(gateInput(phrase, []).allowed, true, `gate blocked: ${phrase}`);
  }
});

test("widening the subject list does not open the gate to everything", () => {
  for (const phrase of [
    "What is the capital of France?",
    "Who won the 2024 World Series?",
    "write me a poem about the sea",
    "blorptastic",
  ]) {
    assert.equal(gateInput(phrase, []).allowed, false, `gate wrongly allowed: ${phrase}`);
  }
});

test("reservation detection excludes private services", () => {
  assert.equal(hasReservationIntent("Can I book a table for four?"), true);
  assert.equal(hasReservationIntent("Can I reserve dinner?"), true);
  assert.equal(hasReservationIntent("How do I book private dining for a wedding?"), false);
  assert.equal(hasReservationIntent("Can I book a company dinner?"), false);
});

// Natural booking wording must both reach the model and earn the Resy button.
// Before this, "I want to make a booking" carried no in-scope token at all and
// was refused as out of scope on the site's primary conversion path.
test("natural table-booking language is in scope and offers Resy", () => {
  for (const phrase of [
    "I want to make a booking",
    "Can I book?",
    "Do you have availability Saturday?",
    "Can I get a table tonight?",
    "Can I book a table for four?",
    "Do you take reservations?",
    "How do I reserve a table?",
    "Is a table available on Friday?",
    "I need a table for six",
    "book a party of six",
  ]) {
    assert.equal(gateInput(phrase, []).allowed, true, `gate blocked: ${phrase}`);
    assert.equal(hasReservationIntent(phrase), true, `no Resy CTA: ${phrase}`);
  }
});

test("private-service enquiries stay in scope but never offer Resy", () => {
  for (const phrase of [
    "How do I arrange private dining for a wedding?",
    "Can I book a company dinner?",
    "I want to book a birthday party",
    "Do you do catering?",
    "Can I hire the restaurant for a corporate event?",
    "Can I book the private room?",
    "Do you host wedding receptions?",
  ]) {
    assert.equal(gateInput(phrase, []).allowed, true, `gate blocked: ${phrase}`);
    assert.equal(hasReservationIntent(phrase), false, `wrongly offered Resy: ${phrase}`);
  }
});

// Celebration, event and catering enquiries go to the site's existing private
// dining enquiry form (app/private-dining, <form id="enquiry">), never to Resy.
test("celebration and event enquiries are in scope and never offer Resy", () => {
  for (const phrase of [
    "I want to celebrate my birthday at Angel",
    "Can I have a birthday dinner there?",
    "I want to plan a birthday celebration",
    "Can I host an anniversary dinner?",
    "Can I organize an anniversary dinner?",
    "I want to host an event",
    "I want a private event",
    "I want to plan a private event",
    "Do you have birthday packages?",
    "Can I have catering for my birthday?",
    "We are planning an engagement party",
    "Can you do a family gathering?",
  ]) {
    assert.equal(gateInput(phrase, []).allowed, true, `gate blocked: ${phrase}`);
    assert.equal(hasCelebrationIntent(phrase), true, `not celebration intent: ${phrase}`);
    assert.equal(hasReservationIntent(phrase), false, `wrongly offered Resy: ${phrase}`);
    assert.equal(resolveCta(phrase, []), "event", `wrong CTA: ${phrase}`);
  }
});

test("an ordinary table request still goes to Resy, even when it names an occasion", () => {
  for (const phrase of [
    "I want to book a table tonight",
    "Can I book a table for my birthday?",
    "Can I reserve a table for our anniversary?",
    "Do you take reservations?",
    "Can I get a table tonight?",
  ]) {
    assert.equal(resolveCta(phrase, []), "resy", `wrong CTA: ${phrase}`);
    assert.equal(hasCelebrationIntent(phrase), false, `wrongly treated as an event: ${phrase}`);
  }
});

test("a bare continuation inherits the intent of the exchange above it", () => {
  const event: ChatTurn[] = [{ role: "user", text: "I want to plan a birthday celebration" }, { role: "model", text: "The team follows up on an event enquiry." }];
  const table: ChatTurn[] = [{ role: "user", text: "I want to book a table tonight" }, { role: "model", text: "Reservations are handled through Resy." }];
  assert.equal(gateInput("How do I do that?", event).allowed, true);
  assert.equal(resolveCta("How do I do that?", event), "event");
  assert.equal(resolveCta("How do I do that?", table), "resy");
  // With no conversation behind it the continuation carries nothing.
  assert.equal(gateInput("How do I do that?", []).allowed, false);
  assert.equal(resolveCta("How do I do that?", []), undefined);
  // And it never lingers over an unrelated later question.
  assert.equal(resolveCta("What are your hours?", event), undefined);
});
