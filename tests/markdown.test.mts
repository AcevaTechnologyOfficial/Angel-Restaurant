import test from "node:test";
import assert from "node:assert/strict";
import { parseMarkdown } from "../lib/chat/markdown.ts";
test("parses headings, bold and lists", () => {
  const blocks = parseMarkdown("### Vegetarian Appetizers\n- **Samosa** — $5.99\n- Pani Puri — $8.99");
  assert.equal(blocks[0].type, "heading"); assert.equal(blocks[1].type, "ul");
  assert.equal(blocks[1].items[0][0].type, "strong"); assert.equal(blocks[1].items[0][0].text, "Samosa");
});
test("streaming prefixes never expose incomplete bold markers", () => {
  const source = "**Samosa** is a popular dish.";
  for (let i = 1; i <= source.length; i++) assert.equal(JSON.stringify(parseMarkdown(source.slice(0, i))).includes("**"), false);
});
