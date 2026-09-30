import type { MetadataRoute } from "next";
import { restaurant } from "@/lib/restaurant";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: restaurant.name,
    short_name: "Angel",
    description: "Indian cooking in Jackson Heights, Queens.",
    start_url: "/",
    display: "browser",
    background_color: "#25130D",
    theme_color: "#E5C88F",
    // Reuses the file-convention icon routes (app/icon.tsx, app/apple-icon.tsx)
    // rather than static PNGs; swap for real logo files when the client supplies one.
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png", purpose: "any" },
    ],
  };
}
