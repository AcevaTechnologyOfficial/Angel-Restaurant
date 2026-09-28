export type Span = { type: "text" | "strong"; text: string };
export type Block =
  | { type: "paragraph"; spans: Span[] }
  | { type: "ul" | "ol"; items: Span[][] }
  | { type: "heading"; spans: Span[] };

function inline(text: string): Span[] {
  const result: Span[] = [];
  let rest = text;
  while (rest) {
    const match = rest.match(/\*\*([^*]+)\*\*/);
    if (!match || match.index === undefined) {
      const marker = rest.indexOf("**");
      if (marker >= 0) {
        if (marker) result.push({ type: "text", text: rest.slice(0, marker) });
        result.push({ type: "strong", text: rest.slice(marker + 2) });
      } else result.push({ type: "text", text: rest });
      break;
    }
    if (match.index) result.push({ type: "text", text: rest.slice(0, match.index) });
    result.push({ type: "strong", text: match[1] });
    rest = rest.slice(match.index + match[0].length);
  }
  return result;
}

export function parseMarkdown(input: string): Block[] {
  const lines = input.replace(/\r\n?/g, "\n").split("\n");
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let listType: "ul" | "ol" | null = null;
  let listItems: Span[][] = [];
  const flushParagraph = () => { if (paragraph.length) { blocks.push({ type: "paragraph", spans: inline(paragraph.join(" ").trim()) }); paragraph = []; } };
  const flushList = () => { if (listType) blocks.push({ type: listType, items: listItems }); listType = null; listItems = []; };
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) { flushParagraph(); flushList(); continue; }
    const heading = trimmed.match(/^#{1,3}\s+(.+)$/);
    if (heading) { flushParagraph(); flushList(); blocks.push({ type: "heading", spans: inline(heading[1]) }); continue; }
    const unordered = trimmed.match(/^[-*]\s+(.+)$/);
    const ordered = trimmed.match(/^\d+[.)]\s+(.+)$/);
    if (unordered || ordered) {
      flushParagraph();
      const type = unordered ? "ul" : "ol";
      if (listType && listType !== type) flushList();
      listType = type;
      listItems.push(inline((unordered || ordered)![1]));
      continue;
    }
    flushList();
    paragraph.push(trimmed);
  }
  flushParagraph(); flushList();
  return blocks;
}
