import sharp from "sharp";
import { put, del } from "@vercel/blob";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import { resolve } from "node:path";
import { requireAdmin, sameOrigin } from "@/lib/admin-access";
import { apiError, readBounded } from "@/lib/api-response";
import { InputError } from "@/lib/menu-validation";
import { collections } from "@/lib/database";

export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    await requireAdmin(); sameOrigin(request);
    if (!["image/jpeg", "image/png", "image/webp"].includes(request.headers.get("content-type") || "")) throw new InputError("Choose a JPEG, PNG or WebP image.");
    const input = await readBounded(request, 4 * 1024 * 1024);
    let image: Buffer;
    try {
      const processor = sharp(input, { limitInputPixels: 40000000, animated: false });
      const metadata = await processor.metadata();
      if (!["jpeg", "png", "webp"].includes(metadata.format || "")) throw new Error("Invalid format");
      image = await processor.rotate().resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true }).webp({ quality: 85 }).toBuffer();
    } catch { throw new InputError("This image could not be read. Choose a valid JPEG, PNG or WebP under 40 megapixels."); }
    const id = randomUUID();
    let url: string;
    let cleanup: () => Promise<unknown>;
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(`menu/${id}.webp`, image, { access: "public", contentType: "image/webp", addRandomSuffix: false });
      url = blob.url;
      cleanup = () => del(url);
    } else {
      if (process.env.VERCEL) throw new InputError("Image storage is not configured. Please contact your site administrator.");
      const directory = resolve(".data/uploads");
      await mkdir(directory, { recursive: true });
      const path = resolve(directory, `${id}.webp`);
      await writeFile(path, image, { flag: "wx" });
      url = `/api/media/${id}`;
      cleanup = () => unlink(path);
    }
    try { await collections().media.insertOne({ id, url, createdAt: new Date().toISOString() }); }
    catch (error) { await cleanup().catch(() => {}); throw error; }
    return Response.json({ url }, { status: 201 });
  } catch (error) { return apiError(error); }
}
