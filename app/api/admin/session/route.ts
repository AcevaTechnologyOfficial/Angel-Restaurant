import { cookies } from "next/headers";
import { ADMIN_COOKIE, SESSION_SECONDS, accessConfigured, createSession, destroySession, equalSecret, isAdmin, limitAttempts, sameOrigin } from "@/lib/admin-access";
import { apiError, readJson } from "@/lib/api-response";
import { audit } from "@/lib/audit";
import { InputError } from "@/lib/menu-validation";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    if (!accessConfigured()) return Response.json({ error: "Administrator access has not been configured." }, { status: 503 });
    await limitAttempts(request);
    const input = await readJson(request) as { key?: unknown };
    if (typeof input?.key !== "string" || !equalSecret(input.key, process.env.ADMIN_ACCESS_KEY!)) {
      await audit("login.failed", "admin");
      throw new InputError("The access key is incorrect.");
    }
    (await cookies()).set(ADMIN_COOKIE, await createSession(), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: SESSION_SECONDS });
    await audit("login", "admin");
    return Response.json({ ok: true });
  } catch (error) { return apiError(error); }
}
export async function DELETE(request: Request) {
  try {
    sameOrigin(request);
    const wasAdmin = await isAdmin();
    await destroySession();
    if (wasAdmin) await audit("logout", "admin");
    return Response.json({ ok: true });
  } catch (error) { return apiError(error); }
}
