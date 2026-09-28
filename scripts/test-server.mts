import { spawnSync, spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
const uri = process.env.TEST_MONGODB_URI;
if (!uri) throw new Error("TEST_MONGODB_URI is required for browser tests. Use a dedicated non-production Atlas database.");
const env = { ...process.env, MONGODB_URI: uri, MONGODB_DB: `angel-e2e-${randomUUID()}`, ADMIN_ACCESS_KEY: "angel-local-e2e-only-access-key-2026", ADMIN_ORIGIN: "http://127.0.0.1:3100", BLOB_READ_WRITE_TOKEN: "", ANGEL_TEST_BUILD: "true", NODE_ENV: "development" as const, VERCEL: "", VERCEL_ENV: "" };
for (const mode of ["migrate", "seed"]) {
  const result = spawnSync(process.execPath, ["scripts/database.mts", mode], { env, stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status || 1);
}
const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "--hostname", "127.0.0.1", "--port", "3100"], { env, stdio: "inherit" });
child.on("exit", code => process.exit(code || 0));
process.on("SIGTERM", () => child.kill());
process.on("SIGINT", () => child.kill());
