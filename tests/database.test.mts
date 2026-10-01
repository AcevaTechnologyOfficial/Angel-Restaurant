import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { MongoClient } from "mongodb";

const uri = process.env.TEST_MONGODB_URI;

test("migration preserves menu content and reseeding cannot resurrect deleted dishes", { skip: !uri && "Set TEST_MONGODB_URI to run MongoDB integration coverage." }, async () => {
  const databaseName = `angel-test-${randomUUID().slice(0, 8)}`;
  const env = { ...process.env, MONGODB_URI: uri!, MONGODB_DB: databaseName, NODE_ENV: "test" as const, VERCEL: "" };
  const run = (mode: string) => {
    const result = spawnSync(process.execPath, ["scripts/database.mts", mode], { env, encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
  };
  const client = new MongoClient(uri!);
  try {
    run("migrate"); run("migrate"); run("seed"); run("verify");
    const database = client.db(databaseName);
    const snapshot = JSON.parse(readFileSync("db/original-menu.json", "utf8"));
    const total = snapshot.menu.reduce((sum: number, category: { items: unknown[] }) => sum + category.items.length, 0);
    assert.equal(await database.collection("menu_items").countDocuments(), total);
    await database.collection("menu_items").deleteOne({});
    run("seed");
    assert.equal(await database.collection("menu_items").countDocuments(), total - 1);
  } finally {
    // Atlas caps database names at 38 bytes (a full UUID overflowed it) and shared-tier users often cannot dropDatabase, so fall back to dropping each collection.
    const scratch = client.db(databaseName);
    await scratch.dropDatabase().catch(async () => { for (const { name } of await scratch.listCollections().toArray()) await scratch.collection(name).drop(); });
    await client.close();
  }
});
