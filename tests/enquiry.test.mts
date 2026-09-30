import { test } from "node:test";
import assert from "node:assert/strict";
import { validateEnquiry } from "../lib/enquiry.ts";

const inDays = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
function form(patch: Record<string, string | null> = {}) {
  const base: Record<string, string> = { Name: "Asha", Email: "asha@example.com", Phone: "", Guests: "12", Date: inDays(30), Occasion: "Birthday", Message: "", Consent: "on" };
  const data = new FormData();
  for (const [key, value] of Object.entries({ ...base, ...patch })) if (value !== null) data.set(key, value);
  return data;
}

test("a complete enquiry is accepted and trimmed", () => {
  const result = validateEnquiry(form({ Name: "  Asha  " }));
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.data.Name, "Asha");
});

test("missing consent is reported on its own field, not on Message", () => {
  const result = validateEnquiry(form({ Consent: null }));
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.ok(result.fieldErrors.Consent);
    assert.equal(result.fieldErrors.Message, undefined);
  }
});

test("invalid occasion, party size, email, phone and dates are rejected", () => {
  const patches: Record<string, string>[] = [{ Occasion: "Coup" }, { Guests: "0" }, { Guests: "1.5" }, { Email: "nope" }, { Phone: "abc" }, { Phone: "123" }, { Date: inDays(-2) }, { Date: inDays(900) }, { Date: "2026-02-31" }];
  for (const patch of patches) {
    assert.equal(validateEnquiry(form(patch)).ok, false, JSON.stringify(patch));
  }
});

test("header-injection characters are stripped from name and email", () => {
  const result = validateEnquiry(form({ Name: "Asha\r\nBcc: x@y.com" }));
  assert.equal(result.ok, true);
  if (result.ok) assert.doesNotMatch(result.data.Name, /[\r\n]/);
});
