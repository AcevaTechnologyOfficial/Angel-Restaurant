import { requireAdmin, sameOrigin } from "@/lib/admin-access";
import { apiError, readJson } from "@/lib/api-response";
import { deleteMenu, saveMenu, setMenuStatus } from "@/lib/menu-repository";
import { InputError } from "@/lib/menu-validation";
import { revalidatePath, revalidateTag } from "next/cache";
type Context = { params: Promise<{ id: string }> };
async function mutate(request: Request, context: Context) {
  try {
    await requireAdmin(); sameOrigin(request);
    const { id } = await context.params;
    const input = await readJson(request) as Record<string, unknown>;
    if (!input || typeof input.updatedAt !== "string") throw new InputError("Reload the dish and try again.");
    if (request.method === "DELETE") await deleteMenu(id, input.updatedAt);
    else if (request.method === "PATCH") {
      if ((input.field !== "visible" && input.field !== "available") || typeof input.enabled !== "boolean") throw new InputError("Choose a valid status.");
      await setMenuStatus(id, input.field, input.enabled, input.updatedAt);
    } else await saveMenu({ ...input, id }, false, input.updatedAt);
    revalidateTag("public-menu", { expire: 0 }); revalidatePath("/menu"); revalidatePath("/"); revalidatePath("/admin", "layout");
    return Response.json({ ok: true });
  } catch (error) { return apiError(error); }
}
export { mutate as PUT, mutate as PATCH, mutate as DELETE };
