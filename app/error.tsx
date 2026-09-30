"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="main-content" tabIndex={-1} className="surface-dark tone-dark section">
      <div className="container-shell simple-page">
        <h1 className="display-xl">We’ll be right back.</h1>
        <p className="lede">We couldn’t load this page. Please try again shortly.</p>
        <div className="button-row">
          <button className="button button-primary" type="button" onClick={reset}>
            <span>Try again</span><span className="button-icon" aria-hidden="true">↗</span>
          </button>
        </div>
      </div>
    </main>
  );
}
