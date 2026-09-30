"use client";

import { restaurant } from "@/lib/restaurant";

export default function MenuError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="main-content" tabIndex={-1} className="surface-dark tone-dark section">
      <div className="container-shell simple-page">
        <h1 className="display-xl">The menu will be back shortly.</h1>
        <p className="lede">
          We couldn’t load our dishes. Please try again, or call us for today’s menu at{" "}
          <a href={`tel:${restaurant.phoneHref}`}>{restaurant.phone}</a>.
        </p>
        <div className="button-row">
          <button className="button button-primary" type="button" onClick={reset}>
            <span>Try again</span><span className="button-icon" aria-hidden="true">↗</span>
          </button>
        </div>
      </div>
    </main>
  );
}
