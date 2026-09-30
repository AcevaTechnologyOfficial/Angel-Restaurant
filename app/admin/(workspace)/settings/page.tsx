import { requireAdminPage } from "@/lib/admin-access";
import { recentAudit } from "@/lib/audit";

const LABELS: Record<string, string> = {
  login: "Signed in", "login.failed": "Failed sign-in", logout: "Signed out", "menu.create": "Dish added", "menu.update": "Dish updated",
  "menu.delete": "Dish deleted", upload: "Image uploaded", "enquiry.status": "Enquiry status changed",
};
const stamp = (value: string) => new Date(value).toLocaleString("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

export default async function Settings() {
  await requireAdminPage();
  const activity = await recentAudit().catch(() => []);
  return <><div className="admin-page-head"><div><p className="eyebrow">WORKSPACE</p><h1>Settings</h1></div></div><section className="admin-panel"><h2>Administrator access</h2><p>This workspace currently uses a temporary access key with an eight-hour session. Individual accounts, roles, recovery and multi-factor authentication will be configured separately.</p></section><section className="admin-panel"><h2>Menu infrastructure</h2><div className="admin-summary-row"><span>Database</span><span>{process.env.MONGODB_URI ? "MongoDB Atlas" : "MongoDB not configured"}</span></div><div className="admin-summary-row"><span>Image storage</span><span>{process.env.BLOB_READ_WRITE_TOKEN ? "Vercel Blob" : "Local files · development"}</span></div><p>Existing categories are preserved. Category editing and restaurant settings can be added here later.</p></section>
    <section className="admin-panel"><h2>Recent activity</h2>{activity.length ? activity.map(entry => <div className="admin-summary-row" key={entry.at + entry.action + entry.target}><span>{LABELS[entry.action] ?? entry.action}{entry.target !== "admin" && <small> · {entry.target}</small>}</span><small>{stamp(entry.at)}</small></div>) : <p>No activity recorded yet.</p>}</section></>;
}
