"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

// Keep the optimized poster visible until muted playback starts.
export function HeroVideo({ src, poster, posterAlt }: { src: string; poster: string; posterAlt: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const manuallyPaused = useRef(false);
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || failed) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let inView = false;
    // Visitors who asked their browser to save data keep the poster; the Play button still works.
    const saveData = Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);
    const syncPlayback = () => {
      if (document.hidden || preference.matches || saveData || !inView || manuallyPaused.current) {
        video.pause();
      } else {
        video.play().catch(() => setPlaying(false));
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      syncPlayback();
    });
    observer.observe(video);
    document.addEventListener("visibilitychange", syncPlayback);
    preference.addEventListener("change", syncPlayback);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncPlayback);
      preference.removeEventListener("change", syncPlayback);
    };
  }, [failed]);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      manuallyPaused.current = false;
      video.play().catch(() => setPlaying(false));
    } else {
      manuallyPaused.current = true;
      video.pause();
    }
  };

  return (
    <div className="hero-media">
      <Image src={poster} alt={posterAlt} fill sizes="100vw" loading="eager" fetchPriority="high" className="hero-poster" />
      {!failed && <video ref={videoRef} className={`hero-video${playing ? " is-playing" : ""}`} src={src} muted loop playsInline preload="none" aria-hidden="true" onError={() => setFailed(true)} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />}
      {!failed && <button type="button" className="cinematic-pause hero-video-pause" aria-pressed={playing} onClick={toggle}>{playing ? "Pause video" : "Play video"}</button>}
    </div>
  );
}
