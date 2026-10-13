import type { CSSProperties } from "react";
import type { Book } from "./types";

// Classic bookcloth colours: cloth, lettering, foil. Mostly deep tones with a
// few light ones (cream, sage, rose, ochre) for contrast on the shelf.
export type Swatch = { cloth: string; ink: string; foil: string };

const PALETTE: Swatch[] = [
  { cloth: "#6e1f22", ink: "#f2dfc4", foil: "#c9a24a" }, // oxblood
  { cloth: "#1f4a36", ink: "#ece0c4", foil: "#c9a24a" }, // forest
  { cloth: "#1d2e4f", ink: "#e8ddc6", foil: "#c9a24a" }, // navy
  { cloth: "#b9862f", ink: "#2a1c10", foil: "#4a3218" }, // ochre
  { cloth: "#1f5a5c", ink: "#ebe2cd", foil: "#d4b46a" }, // teal
  { cloth: "#4b2a45", ink: "#efe0d2", foil: "#c9a24a" }, // plum
  { cloth: "#9a6a43", ink: "#f6ead6", foil: "#ecd09a" }, // tan leather
  { cloth: "#2d2b2a", ink: "#e2d8c8", foil: "#b9b2a6" }, // charcoal, silver foil
  { cloth: "#a8482a", ink: "#f7e6d2", foil: "#f0c27a" }, // burnt orange
  { cloth: "#c49a8f", ink: "#3a1f1b", foil: "#6b3a33" }, // dusty rose
  { cloth: "#e6d8bd", ink: "#3a2a1e", foil: "#9a6a3a" }, // cream
  { cloth: "#8a9a74", ink: "#1f2618", foil: "#3b4a2c" }, // sage
  { cloth: "#4c6178", ink: "#ede5d5", foil: "#d6c08a" }, // slate blue
  { cloth: "#5b5a2a", ink: "#efe6cc", foil: "#d4b46a" }, // olive
];

export const SPINE_STYLES = 3;

export function hash(s: string) {
  let h = 7;
  for (const c of s) h = (h * 33 + c.charCodeAt(0)) >>> 0;
  return h;
}

type Identity = Pick<Book, "title" | "author"> & { series?: string | null };

// Books in a series share a key, so they're bound alike, like a box set.
export function bindingKey(book: Identity) {
  return book.series?.trim()
    ? `series:${book.series.trim().toLowerCase()}`
    : `book:${book.title.trim().toLowerCase()}|${book.author.trim().toLowerCase()}`;
}

export function swatchFor(book: Identity): Swatch {
  return PALETTE[hash(bindingKey(book)) % PALETTE.length];
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
