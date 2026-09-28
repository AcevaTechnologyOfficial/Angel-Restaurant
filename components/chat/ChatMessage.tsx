"use client";
import { memo, useMemo } from "react";
import { parseMarkdown, type Span, type Block } from "@/lib/chat/markdown";
import { restaurant } from "@/lib/restaurant";

function Spans({ spans }: { spans: Span[] }) {
  return <>{spans.map((span, index) => span.type === "strong" ? <strong key={index}>{span.text}</strong> : <span key={index}>{span.text}</span>)}</>;
}

const NO_BLOCKS: Block[] = [];

// Memoised: a streamed answer re-renders many times per second, and without this
// every earlier message in the transcript re-rendered — and re-parsed its
// markdown — on each chunk. Only the turn whose text actually changed now works.
export const ChatMessage = memo(function ChatMessage({ role, text, cta }: { role: "user" | "model"; text: string; cta?: "resy" | "event" }) {
  // Parsing is memoised on the text itself, so a re-render that does not change
  // the text (a new cta, a sibling updating) costs nothing.
  const blocks = useMemo(() => (role === "model" && text ? parseMarkdown(text) : NO_BLOCKS), [role, text]);

  if (role === "user") return <div className="angel-chat-message angel-chat-message-user">{text}</div>;

  return <div className="angel-chat-message angel-chat-message-model">
    <div className="angel-chat-content">
      {blocks.map((block: Block, index) => {
        if (block.type === "paragraph") return <p key={index}><Spans spans={block.spans} /></p>;
        if (block.type === "heading") return <p key={index} className="angel-chat-heading"><Spans spans={block.spans} /></p>;
        const List = block.type === "ul" ? "ul" : "ol";
        return <List key={index} className="angel-chat-list">{block.items.map((item, itemIndex) => <li key={itemIndex}><Spans spans={item} /></li>)}</List>;
      })}
    </div>
    {/* The canonical Resy listing, shared with the header, footer and JSON-LD, so
        the booking path can never drift between the site and the assistant. */}
    {cta === "resy" && <a className="angel-chat-cta" href={restaurant.resy} target="_blank" rel="noopener noreferrer"><span>Reserve on Resy</span><span className="angel-chat-cta-icon" aria-hidden="true">↗</span></a>}
    {/* The site's existing private dining enquiry, deep-linked to the form
        itself (<form id="enquiry"> in components/enquiry-form.tsx). A plain
        anchor, not next/link: a full navigation dismisses this modal, where a
        client-side one would leave it open over the new page. */}
    {cta === "event" && <a className="angel-chat-cta" href="/private-dining#enquiry"><span>Plan your celebration</span><span className="angel-chat-cta-icon" aria-hidden="true">↗</span></a>}
  </div>;
});
