import type { CSSProperties, ReactNode } from "react";
import { Words } from "@/components/split-text";

// Numbered section opener: "—— 01 · Label", a two-line display heading whose
// second line is italic gold, a lede, and an optional right-hand CTA or aside.
export function SectionHead({
  number,
  label,
  title,
  italic,
  lede,
  cta,
  aside,
  centered = false,
  id,
}: {
  number?: string;
  label: string;
  title: string;
  italic?: string;
  lede?: string;
  cta?: ReactNode;
  aside?: ReactNode;
  centered?: boolean;
  id?: string;
}) {
  const titleWords = title.split(" ").length;
  return (
    <div className={`section-head${centered ? " is-centered" : ""}`} data-reveal="words">
      <div className="section-head-main">
        <p className={`eyebrow eyebrow-rule rise${centered ? " is-centered" : ""}`}>{number && <span className="section-num" aria-hidden="true">{number} · </span>}{label}</p>
        <h2 className="display-lg" id={id}>
          <Words text={title} />
          {italic && (
            <>
              <br />
              <em><Words text={italic} from={titleWords} /></em>
            </>
          )}
        </h2>
        {lede && <p className="lede rise rise-late">{lede}</p>}
      </div>
      {(cta || aside) && (
        <div className="section-head-side rise rise-late">
          {aside}
          {cta}
        </div>
      )}
    </div>
  );
}

// Manifesto copy: each word is a span that Motion lights up as the block scrolls
// through the viewport. Segments marked `em` render in italic gold.
export function ScrollWords({ segments }: { segments: { text: string; em?: boolean }[] }) {
  const words = segments.flatMap((segment) => segment.text.split(" ").filter(Boolean).map((word) => ({ word, em: segment.em })));
  // `--i`/`--n` drive the scroll-linked lighting range of each word (site.css .sw).
  return (
    <span className="sw-block" style={{ "--n": words.length } as CSSProperties}>
      {words.map((entry, index) => (
        <span key={index}>
          <span className={`sw${entry.em ? " sw-em" : ""}`} style={{ "--i": index } as CSSProperties}>{entry.word}</span>
          {index < words.length - 1 ? " " : null}
        </span>
      ))}
    </span>
  );
}
