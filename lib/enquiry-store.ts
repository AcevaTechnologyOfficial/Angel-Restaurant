import "server-only";
import { randomUUID } from "node:crypto";
import { collections, type EnquiryDocument, type EnquiryStatus } from "./database";
import type { EnquiryField } from "./enquiry";

export const ENQUIRY_STATUSES: EnquiryStatus[] = ["new", "contacted", "closed"];

// Saved before the email is attempted, so a Resend outage or missing key never loses a lead.
export async function saveEnquiry(data: Record<EnquiryField, string>): Promise<EnquiryDocument | null> {
  const record: EnquiryDocument = {
    id: randomUUID(), name: data.Name, email: data.Email, phone: data.Phone, guests: Number(data.Guests),
    date: data.Date, occasion: data.Occasion, message: data.Message, status: "new", emailed: false,
    createdAt: new Date().toISOString(),
  };
  try {
    await collections().enquiries.insertOne({ ...record });
    return record;
  } catch (error) {
    console.error("Could not store enquiry", error instanceof Error ? error.message : error);
    return null;
  }
}

export async function markEnquiryEmailed(id: string) {
  try {
    await collections().enquiries.updateOne({ id }, { $set: { emailed: true } });
  } catch {
    // Non-critical: the enquiry itself is already stored.
  }
}

export async function listEnquiries(limit = 200) {
  return collections().enquiries.find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).limit(limit).toArray();
}

export async function setEnquiryStatus(id: string, status: EnquiryStatus) {
  if (!ENQUIRY_STATUSES.includes(status)) throw new RangeError("Unknown status.");
  const result = await collections().enquiries.updateOne({ id }, { $set: { status } });
  return result.matchedCount > 0;
}
