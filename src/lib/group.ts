import { STATUSES, type Book, type Status } from "./types";

export const GROUPS = {
  status: "Reading status",
  author: "Author",
  series: "Series",
  genre: "Genre",
  none: "Nothing",
} as const;

export type GroupBy = keyof typeof GROUPS;

export function isGroupBy(value: unknown): value is GroupBy {
  return typeof value === "string" && value in GROUPS;
}

export type BookGroup = { key: string; title: string | null; books: Book[] };

const surname = (author: string) => author.trim().split(/\s+/).pop()!.toLowerCase();

function bucket(books: Book[], keyOf: (b: Book) => string | null) {
  const map = new Map<string, Book[]>();
  const rest: Book[] = [];
  for (const book of books) {
    const key = keyOf(book)?.trim();
    if (!key) rest.push(book);
    else map.set(key, [...(map.get(key) ?? []), book]);
  }
  return { map, rest };
}

// Books arrive already sorted; grouping keeps that order within each group
// (except series, which are always ordered by book number).
export function groupBooks(books: Book[], by: GroupBy): BookGroup[] {
  switch (by) {
    case "none":
      return [{ key: "all", title: null, books }];

    case "status":
      return (Object.keys(STATUSES) as Status[])
        .map((s) => ({ key: s, title: STATUSES[s], books: books.filter((b) => b.status === s) }))
        .filter((g) => g.books.length > 0);

    case "author": {
      const { map } = bucket(books, (b) => b.author);
      return [...map.entries()]
        .sort(([a], [b]) => surname(a).localeCompare(surname(b)) || a.localeCompare(b))
        .map(([author, books]) => ({ key: author, title: author, books }));
    }

    case "genre": {
      const { map, rest } = bucket(books, (b) => b.genre);
      const groups = [...map.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([genre, books]) => ({ key: genre, title: genre, books }));
      return rest.length ? [...groups, { key: "~none", title: "No genre", books: rest }] : groups;
    }

    case "series": {
      const { map, rest } = bucket(books, (b) => b.series);
      const byNumber = (a: Book, b: Book) =>
        (a.series_number ?? Infinity) - (b.series_number ?? Infinity) || a.title.localeCompare(b.title);
      const groups = [...map.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([series, books]) => ({ key: series, title: series, books: books.sort(byNumber) }));
      return rest.length ? [...groups, { key: "~none", title: "Standalones", books: rest }] : groups;
    }
  }
}
