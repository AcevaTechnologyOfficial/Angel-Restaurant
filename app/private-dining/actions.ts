"use server";

import { headers } from "next/headers";
import { markEnquiryEmailed, saveEnquiry } from "@/lib/enquiry-store";
import { clientSource, withinLimit } from "@/lib/rate-limit";
import { deliverEnquiry, validateEnquiry, type EnquiryState } from "@/lib/enquiry";

// Every export from a "use server" file becomes a public POST endpoint
// (node_modules/next/dist/docs/01-app/02-guides/server-actions.md, "Security"),
// so validation/rate-limiting/delivery helpers live in lib/enquiry.ts instead —
// this file exports only the one action the form actually calls.
export async function sendEnquiry(_prev: EnquiryState, formData: FormData): Promise<EnquiryState> {
  // Honeypot: a real visitor never fills this hidden field. Fail silently
  // (report success) so a bot gets no signal that it was caught.
  const honeypot = String(formData.get("website") ?? "").trim();
  if (honeypot !== "") return { status: "success" };

  // Minimum fill time: a submission faster than a human can plausibly type
  // this form is almost certainly scripted. The timestamp is only set once
  // the client has mounted (see components/enquiry-form.tsx), so a genuine
  // no-JS submission carries no timestamp and skips this check entirely.
  const startedAt = Number(formData.get("_t"));
  if (startedAt > 0 && Date.now() - startedAt < 3000) return { status: "success" };

  const requestHeaders = await headers();
  // Fails open: if the counter store is down the enquiry is still worth taking.
  if (!(await withinLimit("enquiry", clientSource(requestHeaders), 10 * 60_000, 3, true))) {
    return { status: "error", code: "rate_limit" };
  }

  const result = validateEnquiry(formData);
  if (!result.ok) {
    return { status: "error", code: "validation", fieldErrors: result.fieldErrors, values: result.values };
  }

  // Store first so the lead survives an email failure; email is then best-effort.
  const stored = await saveEnquiry(result.data);
  const delivered = await deliverEnquiry(result.data);
  if (stored && delivered) await markEnquiryEmailed(stored.id);
  if (!stored && !delivered) {
    return { status: "error", code: "delivery", values: result.data };
  }

  return { status: "success" };
}
