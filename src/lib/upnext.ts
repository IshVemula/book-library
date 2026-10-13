import type { Book } from "./types";

export type UpNextItem = {
  series: string;
  number: number;
  author: string;
  book: Book | null; // null: the next book isn't in the library yet
};

// For each series you've started: once you've read the latest book you
// started, suggest the next number, either the copy already on your Want to
// read shelf or a placeholder to add it. Series where you're mid-book or
// stopped (DNF) are skipped, as are placeholders for series marked finished.
export function upNext(books: Book[], finished: Set<string>): UpNextItem[] {
  const bySeries = new Map<string, Book[]>();
  for (const book of books) {
    if (!book.series) continue;
    bySeries.set(book.series, [...(bySeries.get(book.series) ?? []), book]);
  }

  const items: UpNextItem[] = [];
  for (const [series, list] of bySeries) {
    const started = list.filter((b) => b.series_number !== null && b.status !== "want");
    if (started.length === 0) continue;

    const latest = started.reduce((a, b) => (b.series_number! > a.series_number! ? b : a));
    if (latest.status !== "read") continue;

    const number = Math.floor(latest.series_number!) + 1;
    const next = list.find((b) => b.series_number === number) ?? null;

    if (next) {
      if (next.status === "want") items.push({ series, number, author: next.author, book: next });
    } else if (!finished.has(series)) {
      items.push({ series, number, author: latest.author, book: null });
    }
  }

  // Books you already own first, then placeholders.
  return items.sort((a, b) => Number(!a.book) - Number(!b.book) || a.series.localeCompare(b.series));
}
