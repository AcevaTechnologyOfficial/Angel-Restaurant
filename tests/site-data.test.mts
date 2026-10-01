import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { restaurant, faqs } from "../lib/restaurant.ts";
import { press } from "../lib/press.ts";
import { money } from "../lib/menu-types.ts";

test("restaurant contact details are well formed and the phone link form is derived from the display form", () => {
  assert.match(restaurant.phone, /^\d{3}-\d{3}-\d{4}$/);
  assert.equal(restaurant.phoneHref, restaurant.phone.replace(/-/g, ""));
  assert.match(restaurant.email, /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i);
  assert.match(restaurant.address, /Jackson Heights, NY 11372$/);
  for (const url of [restaurant.resy, restaurant.directions, restaurant.instagram, restaurant.siteUrl]) assert.doesNotThrow(() => new URL(url), url);
  assert.equal(new URL(restaurant.resy).hostname, "resy.com");
});

test("FAQ entries are complete, unique and carry no stale copy", () => {
  assert.ok(faqs.length >= 6);
  const questions = new Set<string>();
  for (const [question, answer] of faqs) {
    assert.ok(question.trim().endsWith("?"), `question should end with "?": ${question}`);
    assert.ok(answer.trim().length > 20, `answer too short: ${question}`);
    assert.ok(!questions.has(question), `duplicate question: ${question}`);
    questions.add(question);
  }
  assert.ok(faqs.some(([, answer]) => answer.includes(restaurant.phone)), "an answer should quote the current phone number");
});

test("press items: valid https URLs, unique, real dates, known kinds", () => {
  assert.ok(press.length >= 20);
  const seen = new Set<string>();
  const kinds = new Set(["award", "review", "feature", "guide", "listing", "video"]);
  for (const item of press) {
    assert.ok(item.outlet.trim() && item.title.trim(), `blank outlet/title: ${JSON.stringify(item)}`);
    const url = new URL(item.url);
    assert.equal(url.protocol, "https:", item.url);
    assert.match(item.date, /^\d{4}-\d{2}-\d{2}$/, `bad date ${item.date}`);
    assert.ok(!Number.isNaN(Date.parse(item.date)), `unparseable date ${item.date}`);
    assert.ok(new Date(item.date) <= new Date(Date.now() + 86400000), `future date ${item.date} on ${item.title}`);
    assert.ok(kinds.has(item.kind), `unknown kind ${item.kind}`);
    assert.ok(!item.precision || ["day", "month", "year", "none"].includes(item.precision));
    const key = item.url + item.title;
    assert.ok(!seen.has(key), `duplicate press item ${item.title}`);
    seen.add(key);
  }
});

test("money() formats cents as US dollars with two decimals", () => {
  assert.equal(money(1199), "$11.99");
  assert.equal(money(500), "$5.00");
  assert.equal(money(0), "$0.00");
  assert.equal(money(99999), "$999.99");
});

test("original menu snapshot: every dish is priced, named and described, names are unique per category", () => {
  const snapshot = JSON.parse(readFileSync("db/original-menu.json", "utf8")) as { menu: { id: string; title: string; items: { name: string; price: string; description?: string }[] }[] };
  assert.ok(snapshot.menu.length >= 5);
  const ids = new Set<string>();
  let dishes = 0;
  for (const category of snapshot.menu) {
    assert.ok(!ids.has(category.id), `duplicate category ${category.id}`);
    ids.add(category.id);
    const names = new Set<string>();
    for (const dish of category.items) {
      dishes++;
      assert.match(dish.price, /^\$\d+\.\d{2}$/, `${dish.name}: ${dish.price}`);
      assert.ok(Number(dish.price.slice(1)) > 0, `${dish.name} has a zero price`);
      assert.ok(dish.name.trim().length > 1);
      assert.ok(!names.has(dish.name), `duplicate dish "${dish.name}" in ${category.title}`);
      names.add(dish.name);
    }
  }
  assert.ok(dishes >= 80, `only ${dishes} dishes`);
});

test("copy regression: removed wording does not come back in shipped copy", () => {
  const files = ["lib/restaurant.ts", "lib/press.ts", "lib/chat/kb.ts", "app/page.tsx", "app/story/page.tsx", "app/layout.tsx"];
  for (const file of files) {
    const text = readFileSync(file, "utf8").replace(/Punjabi lassis?/gi, "");
    assert.ok(!/Punjab/i.test(text), `${file} still mentions Punjab/Punjabi`);
  }
});

test("every image the code references exists in /public", () => {
  const roots = ["app", "components", "lib"];
  const files: string[] = [];
  const walk = (dir: string) => { for (const entry of readdirSync(dir, { withFileTypes: true })) { const p = `${dir}/${entry.name}`; if (entry.isDirectory()) walk(p); else if (/\.(tsx?|mts)$/.test(entry.name)) files.push(p); } };
  roots.forEach(walk);
  const missing: string[] = [];
  for (const file of files) {
    const text = readFileSync(file, "utf8");
    for (const m of text.matchAll(/name[:=]\s*[{"]?"([a-z0-9-]+(?:-aceva|-stock)|room-[a-z-]+|bar-wine-service|storefront|hero-poster)"/g)) if (!existsSync(`public/angel/${m[1]}.webp`)) missing.push(`${file}: ${m[1]}`);
    for (const m of text.matchAll(/["'`](\/(?:angel|videos|Certificates)\/[A-Za-z0-9_.\-]+)["'`]/g)) if (!existsSync(`public${m[1]}`)) missing.push(`${file}: ${m[1]}`);
  }
  assert.deepEqual([...new Set(missing)], []);
});

test("JSON-LD escapes the less-than sign with a literal backslash-u sequence, so a dish name cannot close the script tag", () => {
  // A single backslash in source is evaluated by JavaScript into a plain "<" and escapes nothing; the file must contain two.
  const backslash = String.fromCharCode(92);
  const expected = ".replace(/</g, \"" + backslash + backslash + "u003c\")";
  for (const file of ["components/json-ld.tsx", "app/layout.tsx"]) assert.ok(readFileSync(file, "utf8").includes(expected), file + " must escape \"<\" with a double backslash");
  const escaped = JSON.stringify({ name: "</script><script>alert(1)</script>" }).replace(/</g, backslash + "u003c");
  assert.ok(!escaped.includes("<"));
  assert.equal(JSON.parse(escaped).name, "</script><script>alert(1)</script>");
});
