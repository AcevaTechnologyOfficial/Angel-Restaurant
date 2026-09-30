import { EnquiryStatus } from "@/components/admin/enquiry-status";
import { requireAdminPage } from "@/lib/admin-access";
import { listEnquiries } from "@/lib/enquiry-store";

const stamp = (value: string) => new Date(value).toLocaleString("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
const eventDate = (value: string) => new Date(`${value}T12:00:00Z`).toLocaleDateString("en-US", { timeZone: "UTC", month: "short", day: "numeric", year: "numeric" });

export default async function Enquiries() {
  await requireAdminPage();
  const enquiries = await listEnquiries();
  const fresh = enquiries.filter(enquiry => enquiry.status === "new").length;
  return <>
    <div className="admin-page-head"><div><p className="eyebrow">PRIVATE DINING</p><h1>Enquiries</h1><p>{fresh} new · {enquiries.length} total</p></div></div>
    {!enquiries.length && <section className="admin-panel"><p>No enquiries yet. Private dining requests from the website will appear here.</p></section>}
    {enquiries.map(enquiry => <section className="admin-panel" key={enquiry.id}>
      <div className="admin-section-head"><h2>{enquiry.name}</h2><small>{stamp(enquiry.createdAt)}</small></div>
      <div className="admin-summary-row"><span>{[enquiry.occasion || "Occasion not given", eventDate(enquiry.date), `${enquiry.guests} guest${enquiry.guests === 1 ? "" : "s"}`].join(" · ")}</span><span className={`admin-badge${enquiry.status === "new" ? " gold" : ""}`}>{enquiry.status}</span></div>
      <p><a href={`mailto:${enquiry.email}`}>{enquiry.email}</a>{enquiry.phone && <> · <a href={`tel:${enquiry.phone}`}>{enquiry.phone}</a></>}</p>
      {enquiry.message && <p style={{ whiteSpace: "pre-wrap" }}>{enquiry.message}</p>}
      {!enquiry.emailed && <p className="admin-muted">The notification email was not sent for this enquiry, so check it here.</p>}
      <EnquiryStatus id={enquiry.id} status={enquiry.status} />
    </section>)}
  </>;
}
