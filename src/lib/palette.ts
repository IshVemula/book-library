import type { CSSProperties } from "react";
import type { Book } from "./types";

// Bookcloth colour ramps: each runs between two related cloths that share
// lettering and foil colours (both ends dark with light lettering, or both
// light with dark lettering), so any point along the ramp stays readable.
// A series walks along its ramp book by book; a standalone book sits at a
// fixed random point on one.
export type Swatch = { cloth: string; ink: string; foil: string };

type Ramp = { from: string; to: string; ink: string; foil: string };

const RAMPS: Ramp[] = [
  { from: "#6e1f22", to: "#a2482a", ink: "#f6e4cc", foil: "#e2b864" }, // oxblood → burnt orange
  { from: "#1f4a36", to: "#2a6b6e", ink: "#eee3c8", foil: "#d9b866" }, // forest → teal
  { from: "#1d2e4f", to: "#4b6a8f", ink: "#ece3d0", foil: "#d6c08a" }, // navy → slate blue
  { from: "#4b2a45", to: "#94506a", ink: "#f1e2d6", foil: "#d9b56a" }, // plum → rose
  { from: "#1f5a5c", to: "#2d4a80", ink: "#ece4d0", foil: "#d4b46a" }, // teal → deep blue
  { from: "#2d2b2a", to: "#67635e", ink: "#e6dccc", foil: "#c8c1b5" }, // charcoal → pewter, silver foil
  { from: "#5e3a22", to: "#9a5a30", ink: "#f7ecda", foil: "#ecd09a" }, // saddle → cinnamon
  { from: "#45441d", to: "#7f5f24", ink: "#f0e8cf", foil: "#d4b46a" }, // olive → bronze
  { from: "#5a1f3a", to: "#a4485e", ink: "#f6e2e2", foil: "#e2b864" }, // wine → raspberry
  { from: "#2c2a5a", to: "#6a4a8a", ink: "#ece4f0", foil: "#d6c08a" }, // indigo → violet
  { from: "#f1e6cf", to: "#cdb083", ink: "#3a2a1e", foil: "#9a6a3a" }, // cream → sand
  { from: "#e2bfb2", to: "#c4806a", ink: "#3a1f1b", foil: "#6b3a33" }, // blush → terracotta
  { from: "#e8c066", to: "#c9784a", ink: "#2a1c10", foil: "#4a3218" }, // honey → amber
  { from: "#c1cdaa", to: "#86a693", ink: "#1f2618", foil: "#3b4a2c" }, // pale sage → sea green
  { from: "#c4d3df", to: "#a6a0cc", ink: "#1c2733", foil: "#3c4f63" }, // mist → lavender
];

export const SPINE_STYLES = 3;

export function hash(s: string) {
  let h = 7;
  for (const c of s) h = (h * 33 + c.charCodeAt(0)) >>> 0;
  return h;
}

type Identity = Pick<Book, "title" | "author"> & {
  series?: string | null;
  series_number?: number | null;
};

// Books in a series share a key, so they're bound alike, like a box set.
export function bindingKey(book: Identity) {
  return book.series?.trim()
    ? `series:${book.series.trim().toLowerCase()}`
    : `book:${book.title.trim().toLowerCase()}|${book.author.trim().toLowerCase()}`;
}

function mix(a: string, b: string, t: number) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `#${pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, "0")).join("")}`;
}

// How far along its ramp a book sits (0–1). Each book in a series steps a
// third of the way further, bouncing back at the end so long series keep varying.
function rampPosition(book: Identity) {
  if (!book.series?.trim()) return (hash(`pos:${bindingKey(book)}`) % 100) / 100;
  const step = Math.max((book.series_number ?? 1) - 1, 0) / 3;
  const bounce = step % 2;
  return bounce <= 1 ? bounce : 2 - bounce;
}

export function swatchFor(book: Identity): Swatch {
  const ramp = RAMPS[hash(bindingKey(book)) % RAMPS.length];
  return { cloth: mix(ramp.from, ramp.to, rampPosition(book)), ink: ramp.ink, foil: ramp.foil };
}

export function swatchStyle(book: Identity) {
  const { cloth, ink, foil } = swatchFor(book);
  return { "--cloth": cloth, "--ink": ink, "--foil": foil } as CSSProperties;
}

// Deterministic spine size and band style, shared across a series.
export function spineShape(book: Identity) {
  const h = hash(`shape:${bindingKey(book)}`);
  return {
    width: 30 + (h % 6) * 4,
    height: 150 + ((h >>> 4) % 5) * 10,
    style: (h >>> 8) % SPINE_STYLES,
  };
}
