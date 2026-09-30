import { ImageResponse } from "next/og";

export const alt = "Angel Indian Restaurant — Jackson Heights, Queens";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Typographic card built from the same tokens as the live site (gold-wine field,
// espresso ink, Georgia/Arial fallback stack) rather than a fabricated photo —
// keeps the share card honest until the client supplies approved OG photography.
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 88px",
          background: "linear-gradient(155deg, #E5C88F 0%, #D8A05F 100%)",
          color: "#25130D",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase" }}>
            India at heart. New York in spirit.
          </span>
          <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase" }}>
            Est. 2019 / Jackson Heights
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 200, lineHeight: 1, letterSpacing: -6 }}>
            angel
          </span>
          <span style={{ marginTop: 12, fontSize: 26, fontWeight: 700, letterSpacing: 10, textTransform: "uppercase" }}>
            Indian Restaurant
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <span style={{ fontSize: 22, fontWeight: 600 }}>Jackson Heights, Queens · 100% Halal · Full Bar</span>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: 96,
              height: 96,
              borderRadius: 999,
              background: "#25130D",
              color: "#E5C88F",
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: 1,
              textAlign: "center",
              lineHeight: 1.2,
            }}
          >
            <span>Bib</span>
            <span>Gourmand</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
