// Server infrastructure shared by route handlers, Server Components, and the database CLI.
import { attachDatabasePool } from "@vercel/functions";
import { MongoClient, type Db } from "mongodb";

export type CategoryDocument = { id: string; filter: string; title: string; kicker: string; sortOrder: number };
export type MenuItemDocument = {
  id: string; name: string; description: string; priceCents: number; categoryId: string;
  type: "regular" | "chef-special"; image: string; available: boolean; visible: boolean;
  sortOrder: number; vegetarian: boolean; vegan: boolean; tag: string; featured: boolean;
  featuredDescription: string; createdAt: string; updatedAt: string;
};
export type MediaDocument = { id: string; url: string; createdAt: string };
export type RateLimitDocument = { key: string; hits: number; expiresAt: Date };
export type EnquiryStatus = "new" | "contacted" | "closed";
export type EnquiryDocument = {
  id: string; name: string; email: string; phone: string; guests: number; date: string; occasion: string; message: string;
  status: EnquiryStatus; emailed: boolean; createdAt: string;
};
// Only a hash of the session token is stored, so a database read cannot be replayed as a login.
export type AdminSessionDocument = { tokenHash: string; createdAt: string; expiresAt: Date };
export type AuditDocument = { at: string; action: string; target: string; detail?: unknown };
export type MigrationDocument = { id: string; appliedAt: string };

type MongoState = typeof globalThis & { angelMongoClient?: MongoClient; angelMongoDatabase?: Db; angelMongoPoolAttached?: boolean };
const state = globalThis as MongoState;

function connectionUri() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is required. Connect MongoDB Atlas in Vercel or set it in .env.local.");
  return uri;
}

export function getDatabase() {
  if (!state.angelMongoClient) {
    state.angelMongoClient = new MongoClient(connectionUri(), {
      maxPoolSize: Number(process.env.DB_POOL_MAX || 3), minPoolSize: 0,
      maxIdleTimeMS: 20_000, serverSelectionTimeoutMS: 10_000,
    });
    // A closed client is unusable ("Topology is closed"); drop the cached one so the next call reconnects.
    const client = state.angelMongoClient;
    const forget = () => {
      if (state.angelMongoClient !== client) return;
      delete state.angelMongoClient;
      delete state.angelMongoDatabase;
      delete state.angelMongoPoolAttached;
    };
    client.on("close", forget);
    // A failed first connection (network drop, Atlas IP allowlist, DNS) makes the driver close its topology
    // without emitting "close", which would leave this dead client cached and every later query failing
    // with "Topology is closed". Connect eagerly (queries share this attempt) and discard the client on failure.
    client.connect().catch(() => { forget(); void client.close().catch(() => {}); });
  }
  if (process.env.VERCEL && !state.angelMongoPoolAttached) {
    attachDatabasePool(state.angelMongoClient);
    state.angelMongoPoolAttached = true;
  }
  state.angelMongoDatabase ??= state.angelMongoClient.db(process.env.MONGODB_DB || "angel-restaurant");
  return state.angelMongoDatabase;
}

export function collections() {
  const database = getDatabase();
  return {
    categories: database.collection<CategoryDocument>("categories"),
    menuItems: database.collection<MenuItemDocument>("menu_items"),
    media: database.collection<MediaDocument>("media"),
    adminSessions: database.collection<AdminSessionDocument>("admin_sessions"),
    audit: database.collection<AuditDocument>("audit_log"),
    enquiries: database.collection<EnquiryDocument>("enquiries"),
    rateLimits: database.collection<RateLimitDocument>("rate_limits"),
    migrations: database.collection<MigrationDocument>("migrations"),
  };
}

export async function closeDatabase() {
  await state.angelMongoClient?.close();
  delete state.angelMongoClient;
  delete state.angelMongoDatabase;
  delete state.angelMongoPoolAttached;
}
