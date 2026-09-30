"use client";
import Image from "next/image";
import { useState } from "react";

const images = [{ name: "tandoori-aceva", label: "From the fire" }, { name: "room-long-table", label: "Settle in" }, { name: "dal-naan-aceva", label: "Made to share" }, { name: "feast-aceva", label: "A generous table" }];
export function GalleryRail() {
  const [paused, setPaused] = useState(false);
  return <div className="gallery-motion"><div className="gallery-motion-toolbar container-shell"><p className="type-caption">A glimpse of Angel</p><button className="motion-control" aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? "Play motion ▷" : "Pause motion Ⅱ"}</button></div><div className="gallery-window"><div className={`gallery-track ${paused ? "is-paused" : ""}`}>{[0, 1].map((copy) => <div className="gallery-group" key={copy} aria-hidden={copy === 1 ? true : undefined}>{images.map((photo) => <figure key={photo.name}><div><Image src={`/angel/${photo.name}.webp`} alt={copy ? "" : `${photo.label} — Angel editorial collection`} fill sizes="(max-width: 767px) 75vw, 30vw" /></div><figcaption>{photo.label}</figcaption></figure>)}</div>)}</div></div></div>;
}
