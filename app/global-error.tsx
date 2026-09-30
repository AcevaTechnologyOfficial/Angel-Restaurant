"use client";

// Replaces the root layout when it fails, so it cannot rely on the site's fonts or stylesheets.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: "100vh", display: "grid", placeItems: "center", background: "#1f130d", color: "#f3e7d3", fontFamily: "Georgia, serif", textAlign: "center", padding: "1.5rem" }}>
        <main>
          <h1 style={{ fontWeight: 300, fontSize: "clamp(2rem, 6vw, 3.5rem)", margin: "0 0 1rem" }}>We’ll be right back.</h1>
          <p style={{ margin: "0 0 1.5rem" }}>We couldn’t load this page. Please try again shortly.</p>
          <button type="button" onClick={reset} style={{ font: "inherit", padding: ".8rem 1.6rem", background: "#e5c88f", color: "#1f130d", border: 0, cursor: "pointer" }}>Try again</button>
        </main>
      </body>
    </html>
  );
}
