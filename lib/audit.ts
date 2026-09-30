import "server-only";
import { collections } from "./database";

// Best-effort trail of administrator actions. A logging failure must never block the action itself.
export async function audit(action: string, target: string, detail?: unknown) {
  try {
    await collections().audit.insertOne({ at: new Date().toISOString(), action, target, ...(detail === undefined ? {} : { detail }) });
  } catch (error) {
    console.error("Could not write audit entry", action, error instanceof Error ? error.message : error);
  }
}

export async function recentAudit(limit = 25) {
  return collections().audit.find({}, { projection: { _id: 0 } }).sort({ at: -1 }).limit(limit).toArray();
}
