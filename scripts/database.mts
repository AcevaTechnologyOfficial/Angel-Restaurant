import nextEnv from "@next/env";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import type { AnyBulkWriteOperation } from "mongodb";
import { closeDatabase, collections, getDatabase, type CategoryDocument, type MenuItemDocument } from "../lib/database.ts";

nextEnv.loadEnvConfig(process.cwd());
const mode = process.argv[2];
if (!['migrate', 'seed', 'verify'].includes(mode)) throw new Error("Use migrate, seed, or verify.");

type Dish = { name: string; price: string; description?: string; vegetarian?: boolean; vegan?: boolean; tag?: string };
type Snapshot = { menu: { id: string; filter: string; title: string; kicker?: string; items: Dish[] }[]; signatureDishes: { name: string; image: string; description: string }[] };
const snapshot = JSON.parse(readFileSync("db/original-menu.json", "utf8")) as Snapshot;
const dishId = (name: string) => {
  const hash = createHash("sha256").update(`angel-menu:${name}`).digest("hex");
  return `${hash.slice(0,8)}-${hash.slice(8,12)}-4${hash.slice(13,16)}-a${hash.slice(17,20)}-${hash.slice(20,32)}`;
};

async function migrate() {
  const database = getDatabase();
  const { categories, menuItems, media, rateLimits, migrations } = collections();
  await Promise.all([
    categories.createIndex({ id: 1 }, { unique: true, name: "category_id" }),
    menuItems.createIndex({ id: 1 }, { unique: true, name: "menu_item_id" }),
    menuItems.createIndex({ visible: 1, available: 1, categoryId: 1, sortOrder: 1 }, { name: "public_menu_order" }),
    media.createIndex({ id: 1 }, { unique: true, name: "media_id" }),
    media.createIndex({ url: 1 }, { unique: true, name: "media_url" }),
    rateLimits.createIndex({ key: 1 }, { unique: true, name: "rate_limit_key" }),
    rateLimits.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, name: "rate_limit_expiry" }),
    migrations.createIndex({ id: 1 }, { unique: true, name: "migration_id" }),
  ]);
  await migrations.updateOne({ id: "001-menu" }, { $setOnInsert: { id: "001-menu", appliedAt: new Date().toISOString() } }, { upsert: true });
  // Keep the database name visible in the command output without logging its URI.
  console.log(`MongoDB schema is ready in ${database.databaseName}.`);
}

async function seed() {
  const { categories, menuItems, media, migrations } = collections();
  if (await migrations.findOne({ id: "original-menu-seed" }, { projection: { _id: 1 } })) {
    console.log("Original seed already applied; preserving all admin changes and deletions.");
    return;
  }
  const now = new Date().toISOString();
  const categoryWrites = snapshot.menu.map((section, sortOrder) => ({
    updateOne: {
      filter: { id: section.id },
      update: { $setOnInsert: { id: section.id, filter: section.filter, title: section.title, kicker: section.kicker || "", sortOrder } satisfies CategoryDocument },
      upsert: true,
    },
  }));
  await categories.bulkWrite(categoryWrites);

  const mediaWrites: AnyBulkWriteOperation<{ id: string; url: string; createdAt: string }>[] = [];
  const itemWrites: AnyBulkWriteOperation<MenuItemDocument>[] = [];
  for (const section of snapshot.menu) {
    for (const [position, dish] of section.items.entries()) {
      const featured = snapshot.signatureDishes.find(candidate => candidate.name === dish.name);
      const image = featured ? `/angel/${featured.image}.webp` : section.id === "chefs-special" ? "/angel/amritsari-kulcha-stock.webp" : "";
      if (image) mediaWrites.push({ updateOne: { filter: { url: image }, update: { $setOnInsert: { id: dishId(image), url: image, createdAt: now } }, upsert: true } });
      const record: MenuItemDocument = {
        id: dishId(dish.name), name: dish.name, description: dish.description || "", priceCents: Math.round(Number(dish.price.slice(1)) * 100),
        categoryId: section.id, type: section.id === "chefs-special" ? "chef-special" : "regular", image, available: true, visible: true,
        sortOrder: position, vegetarian: !!dish.vegetarian, vegan: !!dish.vegan, tag: dish.tag || "", featured: !!featured,
        featuredDescription: featured?.description || "", createdAt: now, updatedAt: now,
      };
      itemWrites.push({ updateOne: { filter: { id: record.id }, update: { $setOnInsert: record }, upsert: true } });
    }
  }
  if (mediaWrites.length) await media.bulkWrite(mediaWrites);
  await menuItems.bulkWrite(itemWrites);
  await migrations.insertOne({ id: "original-menu-seed", appliedAt: now });
  console.log("Original menu seeded. Existing names, prices, descriptions and categories preserved.");
}

async function verify() {
  const rows = await collections().menuItems.find({}, { projection: { _id: 0 } }).toArray();
  for (const section of snapshot.menu) for (const dish of section.items) {
    const row = rows.find(candidate => candidate.id === dishId(dish.name));
    if (!row || row.name !== dish.name || row.description !== (dish.description || "") || row.priceCents !== Math.round(Number(dish.price.slice(1)) * 100) || row.categoryId !== section.id) throw new Error(`Migration mismatch: ${dish.name}`);
  }
  console.log(`Verified ${rows.length} dishes against the original snapshot.`);
}

try {
  if (mode === "migrate") await migrate();
  if (mode === "seed") await seed();
  if (mode === "verify") await verify();
} finally {
  await closeDatabase();
}
