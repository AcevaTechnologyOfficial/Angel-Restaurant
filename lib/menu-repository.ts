import "server-only";
import { cache } from "react";
import { MongoServerError } from "mongodb";
import { collections, type MenuItemDocument } from "./database";
import { money, type Category, type MenuItem, type MenuInput } from "./menu-types";
import { InputError, validateMenu } from "./menu-validation";
import { requireAdmin } from "./admin-access";
import { audit } from "./audit";

function item(row: MenuItemDocument): MenuItem {
  return {
    id: row.id, name: row.name, description: row.description, priceCents: row.priceCents,
    categoryId: row.categoryId, type: row.type, image: row.image, available: row.available,
    visible: row.visible, sortOrder: row.sortOrder, vegetarian: row.vegetarian, vegan: row.vegan,
    tag: row.tag, featured: row.featured, featuredDescription: row.featuredDescription,
    createdAt: row.createdAt, updatedAt: row.updatedAt,
  };
}

export const getCategories = cache(async (): Promise<Category[]> => {
  const rows = await collections().categories.find({}, { projection: { _id: 0 } }).sort({ sortOrder: 1, id: 1 }).toArray();
  return rows.map(({ id, filter, title, kicker, sortOrder }) => ({ id, filter, title, kicker, sortOrder }));
});

export const getPublicMenu = cache(async () => {
  const [categories, rows] = await Promise.all([
    getCategories(),
    collections().menuItems.find({ visible: true, available: true }, { projection: { _id: 0 } }).sort({ sortOrder: 1, name: 1, id: 1 }).toArray(),
  ]);
  const items = rows.map(item);
  return {
    categories,
    items,
    sections: categories.map(category => ({ ...category, items: items.filter(dish => dish.categoryId === category.id).map(dish => ({ ...dish, price: money(dish.priceCents) })) })),
    specials: items.filter(dish => dish.type === "chef-special" || dish.featured),
  };
});

export async function getAdminMenu() {
  await requireAdmin();
  return (await collections().menuItems.find({}, { projection: { _id: 0 } }).sort({ sortOrder: 1, name: 1, id: 1 }).toArray()).map(item);
}

export async function getAdminItem(id: string) {
  await requireAdmin();
  const row = await collections().menuItems.findOne({ id }, { projection: { _id: 0 } });
  return row ? item(row) : null;
}

export async function saveMenu(input: unknown, creating: boolean, version?: string) {
  await requireAdmin();
  const data = validateMenu(input, (await getCategories()).map(category => category.id));
  const { menuItems, media } = collections();
  if (data.image && !await media.findOne({ url: data.image }, { projection: { _id: 1 } })) throw new InputError("Upload a valid dish image before saving.");
  const now = new Date().toISOString();
  if (creating) {
    try {
      await menuItems.insertOne({ ...data, createdAt: now, updatedAt: now });
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000) throw new InputError("This dish was already saved. Return to the dish list.");
      throw error;
    }
  } else {
    if (!version) throw new InputError("Reload this dish before saving.");
    const result = await menuItems.updateOne({ id: data.id, updatedAt: version }, { $set: { ...data, updatedAt: now } });
    if (!result.matchedCount) throw new InputError("This dish changed or was deleted in another session. Reload before saving.");
  }
  await audit(creating ? "menu.create" : "menu.update", data.name, { id: data.id });
}

export async function deleteMenu(id: string, version: string) {
  await requireAdmin();
  const { menuItems } = collections();
  // Deletion is permanent, so the full record is kept in the audit trail and can be re-created by hand.
  const snapshot = await menuItems.findOne({ id, updatedAt: version }, { projection: { _id: 0 } });
  const result = await menuItems.deleteOne({ id, updatedAt: version });
  if (!result.deletedCount) throw new InputError("This dish changed or was deleted. Refresh the list and try again.");
  await audit("menu.delete", snapshot?.name ?? id, snapshot ?? { id });
}

export async function setMenuStatus(id: string, field: "visible" | "available", enabled: boolean, version: string) {
  const dish = await getAdminItem(id);
  if (!dish) throw new InputError("This dish no longer exists.");
  await saveMenu({ ...dish, [field]: enabled } satisfies MenuInput, false, version);
}
