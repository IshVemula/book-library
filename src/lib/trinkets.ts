import { hash } from "./palette";
import type { Book } from "./types";

export const TRINKETS = {
  ring: "A small gold ring",
  wand: "A wand",
  pipe: "A detective's pipe",
  magnifier: "A magnifying glass",
  watch: "A pocket watch",
  teacup: "A cup of tea",
  raven: "A raven",
  skull: "A skull",
  whale: "A white whale",
  candle: "A candle",
  lightning: "Lightning in a jar",
  hourglass: "An hourglass of sand",
  vials: "Little metal vials",
  sphere: "A glowing gemstone sphere",
  sword: "A sword in the stone",
  rose: "A rose under glass",
  potion: "A potion",
  crystal: "A crystal ball",
  quill: "A quill and ink",
  rocket: "A toy rocket",
  globe: "A little globe",
  plant: "A potted plant",
} as const;

export type TrinketKind = keyof typeof TRINKETS;

// Matched against "title series author", lowercased. Earlier rules win, so
// specific series come before their author.
const BOOK_MATCHES: [RegExp, TrinketKind][] = [
  [/mistborn|allomanc/, "vials"],
  [/stormlight|way of kings|words of radiance|oathbringer|rhythm of war/, "sphere"],
  [/tolkien|hobbit|lord of the rings|fellowship of the ring|two towers|return of the king|silmarillion/, "ring"],
  [/harry potter|rowling|hogwarts/, "wand"],
  [/sherlock|holmes|conan doyle/, "pipe"],
  [/agatha christie|poirot|marple/, "magnifier"],
  [/alice|wonderland|looking-glass|looking glass|lewis carroll/, "watch"],
  [/jane austen|pride and prejudice|sense and sensibility|persuasion|bridgerton/, "teacup"],
  [/edgar allan poe|\bthe raven\b/, "raven"],
  [/hamlet|shakespeare/, "skull"],
  [/moby[- ]dick|melville/, "whale"],
  [/dracula|bram stoker|vampire/, "candle"],
  [/frankenstein|mary shelley/, "lightning"],
  [/\bdune\b|frank herbert/, "hourglass"],
  [/king arthur|camelot|excalibur|once and future king|witcher|game of thrones|song of ice and fire/, "sword"],
  [/little prince|beauty and the beast/, "rose"],
];

const GENRE_MATCHES: [RegExp, TrinketKind[]][] = [
  [/fantasy/, ["potion", "crystal"]],
  [/science fiction|sci-fi/, ["rocket"]],
  [/mystery|thriller|crime/, ["magnifier"]],
  [/horror|gothic/, ["candle"]],
  [/romance/, ["rose", "teacup"]],
  [/classic|poetry|literary/, ["quill"]],
  [/history|biography|memoir|nonfiction|travel/, ["globe"]],
];

const FALLBACK: TrinketKind[] = ["plant", "hourglass", "teacup", "globe", "candle"];

export function trinketForBook(book: Book): TrinketKind | null {
  const text = `${book.title} ${book.series ?? ""} ${book.author}`.toLowerCase();
  return BOOK_MATCHES.find(([re]) => re.test(text))?.[1] ?? null;
}

function trinketForShelf(books: Book[]): TrinketKind {
  const genres = new Map<string, number>();
  for (const b of books) if (b.genre) genres.set(b.genre, (genres.get(b.genre) ?? 0) + 1);
  const top = [...genres.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]?.toLowerCase() ?? "";
  const seed = hash(books.map((b) => b.id).join(","));
  const options = GENRE_MATCHES.find(([re]) => re.test(top))?.[1] ?? FALLBACK;
  return options[seed % options.length];
}

// Trinkets are switched off for now. Flip to true to put them back on the shelves.
export const SHOW_TRINKETS = false;

export type ShelfItem =
  | { type: "book"; book: Book }
  | { type: "trinket"; kind: TrinketKind; label: string; key: string };

// Interleave trinkets with books: one after each matching book (or after the
// last book of a matching series run), at most one per ~4 books, and always at
// least one per shelf so even a short shelf feels lived in.
export function withTrinkets(books: Book[]): ShelfItem[] {
  if (!SHOW_TRINKETS) return books.map((book) => ({ type: "book", book }));
  const budget = Math.max(1, Math.ceil(books.length / 4));
  const used = new Set<TrinketKind>();
  const items: ShelfItem[] = [];

  books.forEach((book, i) => {
    items.push({ type: "book", book });
    const kind = trinketForBook(book);
    if (!kind || used.has(kind) || used.size >= budget) return;
    if (books[i + 1] && trinketForBook(books[i + 1]) === kind) return; // wait for the end of the run
    used.add(kind);
    items.push({ type: "trinket", kind, label: `${TRINKETS[kind]}, for ${book.series ?? book.title}`, key: `t-${kind}` });
  });

  if (used.size === 0 && books.length > 0) {
    const kind = trinketForShelf(books);
    items.push({ type: "trinket", kind, label: TRINKETS[kind], key: `t-${kind}` });
  }
  return items;
}
