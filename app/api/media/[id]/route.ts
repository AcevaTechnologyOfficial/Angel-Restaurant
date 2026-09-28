import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (process.env.VERCEL || !/^[a-f0-9-]{36}$/.test(id)) return new Response(null, { status: 404 });
  try {
    const data = await readFile(resolve(".data/uploads", `${id}.webp`));
    return new Response(data, { headers: { "Content-Type": "image/webp", "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" } });
  } catch { return new Response(null, { status: 404 }); }
}
