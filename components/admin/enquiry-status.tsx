"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const STATUSES = [["new", "New"], ["contacted", "Contacted"], ["closed", "Closed"]] as const;

export function EnquiryStatus({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function change(next: string) {
    if (pending || next === status) return;
    setPending(true); setError("");
    try {
      const response = await fetch(`/api/admin/enquiries/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: next }) });
      if (!response.ok) throw new Error();
      router.refresh();
    } catch { setError("Could not update. Try again."); }
    setPending(false);
  }
  return <div role="group" aria-label="Enquiry status">
    {STATUSES.map(([value, label]) => <button key={value} type="button" className={`admin-button${value === status ? " primary" : ""}`} aria-pressed={value === status} disabled={pending} onClick={() => change(value)}>{label}</button>)}
    {error && <p role="alert">{error}</p>}
  </div>;
}
