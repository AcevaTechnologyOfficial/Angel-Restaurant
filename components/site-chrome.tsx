"use client";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { Header } from "./header";
import { ChapterRail } from "./chapter-rail";
import { Motion } from "./motion";
import { AnalyticsEvents } from "./analytics-events";
// Lazily imported so the assistant and its stylesheet live in their own chunk and
// are only fetched where the chrome below actually renders them — never on the
// administration routes, which return early.
const ChatWidget = dynamic(() => import("./chat/ChatWidget").then((module) => module.ChatWidget));
export function SiteChrome({ children, footer, analytics }: { children: ReactNode; footer: ReactNode; analytics: ReactNode }) {
  const path = usePathname();
  if (path === "/admin" || path.startsWith("/admin/")) return <>{children}</>;
  return <><div className="scroll-progress" aria-hidden="true" /><Header />{children}{footer}<ChapterRail /><ChatWidget /><Motion /><AnalyticsEvents />{analytics}</>;
}
