"use client";
import Link, { useLinkStatus } from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type CSSProperties } from "react";
const links = [["/admin/dashboard", "Overview"], ["/admin/menu", "Menu"], ["/admin/enquiries", "Enquiries"],["/admin/analytics", "Analytics"], ["/admin/settings", "Settings"]];

function NavigationStatus() {
  const { pending } = useLinkStatus();
  return <span className={`admin-nav-status${pending ? " is-pending" : ""}`} aria-hidden="true">↗</span>;
}
export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const activeIndex = Math.max(0, links.findIndex(([href]) => pathname.startsWith(href)));
  return <aside className="admin-sidebar">
    <Link href="/admin/dashboard" className="admin-brand"><span>angel</span><small>RESTAURANT MANAGEMENT</small></Link>
    <nav aria-label="Administration" style={{ "--active-item": activeIndex } as CSSProperties}>{links.map(([href, title]) => <Link key={href} href={href} aria-current={pathname.startsWith(href) ? "page" : undefined}>{title}<NavigationStatus /></Link>)}</nav>
    <div className="admin-sidebar-bottom"><Link href="/menu" target="_blank">View public menu ↗</Link><button disabled={pending} onClick={async () => { if (pending) return; setPending(true); setError(""); try { const response = await fetch("/api/admin/session", { method: "DELETE" }); if (!response.ok) throw new Error(); router.replace("/admin"); router.refresh(); } catch { setError("Could not sign out. Try again."); setPending(false); } }}>{pending ? "Signing out…" : "Sign out"}</button>{error && <p role="alert">{error}</p>}<small>Angel Indian Restaurant<br />Jackson Heights, New York</small></div>
  </aside>;
}
