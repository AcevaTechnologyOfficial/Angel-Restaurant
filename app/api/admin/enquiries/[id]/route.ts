import { requireAdmin, sameOrigin } from "@/lib/admin-access";
import { apiError, readJson } from "@/lib/api-response";
import { audit } from "@/lib/audit";
import { ENQUIRY_STATUSES, setEnquiryStatus } from "@/lib/enquiry-store";
import type { EnquiryStatus } from "@/lib/database";
import { revalidatePath } from "next/cache";
import { InputError } from "@/lib/menu-validation";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(); sameOrigin(request);
    const { id } = await params;
    const body = (await readJson(request)) as { status?: string };
    if (!ENQUIRY_STATUSES.includes(body.status as EnquiryStatus)) throw new InputError("Choose a valid status.");
    if (!(await setEnquiryStatus(id, body.status as EnquiryStatus))) throw new InputError("This enquiry no longer exists.");
    await audit("enquiry.status", id, { status: body.status });
    revalidatePath("/admin/enquiries");
    return Response.json({ ok: true });
  } catch (error) { return apiError(error); }
}
