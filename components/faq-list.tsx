"use client";

type FAQ = readonly string[];

export function FAQList({ faqs }: { faqs: readonly FAQ[] }) {
  return (
    <div className="container-shell faq-list" data-reveal data-stagger-children>
      {faqs.map(([question, answer], index) => (
        <details
          className="frame frame-strong"
          key={question}
          onPointerEnter={({ currentTarget, pointerType }) => {
            if (pointerType !== "touch") currentTarget.open = true;
          }}
          onPointerLeave={({ currentTarget, pointerType }) => {
            if (pointerType !== "touch") currentTarget.open = false;
          }}
        >
          <summary><span className="type-caption">0{index + 1}</span><span className="faq-question">{question}</span><span className="faq-icon" aria-hidden="true">+</span></summary>
          <p>{answer}</p>
        </details>
      ))}
    </div>
  );
}
