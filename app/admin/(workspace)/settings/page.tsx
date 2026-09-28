import { requireAdminPage } from "@/lib/admin-access";
export default async function Settings() {
  await requireAdminPage();
  return <><div className="admin-page-head"><div><p className="eyebrow">WORKSPACE</p><h1>Settings</h1></div></div><section className="admin-panel"><h2>Administrator access</h2><p>This workspace currently uses a temporary access key with an eight-hour session. Individual accounts, roles, recovery and multi-factor authentication will be configured separately.</p></section><section className="admin-panel"><h2>Menu infrastructure</h2><div className="admin-summary-row"><span>Database</span><span>{process.env.MONGODB_URI ? "MongoDB Atlas" : "MongoDB not configured"}</span></div><div className="admin-summary-row"><span>Image storage</span><span>{process.env.BLOB_READ_WRITE_TOKEN ? "Vercel Blob" : "Local files · development"}</span></div><p>Existing categories are preserved. Category editing and restaurant settings can be added here later.</p></section></>;
}
