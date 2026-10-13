// Shared types and constants. No database imports here: client components use this file.

export const STATUSES = {
  reading: "Currently reading",
  read: "Read",
  want: "Want to read",
  dnf: "Did not finish",
} as const;

export type Status = keyof typeof STATUSES;

// Headings for the status shelves on the home page (the plain labels above
// are kept for buttons, filters and badges).
export const SHELF_NAMES: Record<Status, string> = {
  reading: "On the nightstand",
  read: "Devoured",
  want: "The TBR pile (send help)",
  dnf: "Abandoned, no regrets",
};

export function isStatus(value: unknown): value is Status {
  return typeof value === "string" && value in STATUSES;
}

export type Book = {
  id: number;
  title: string;
  author: string;
  series: string | null;
  series_number: number | null;
  genre: string | null;
  status: Status;
  rating: number | null;
  isbn: string | null;
  cover_url: string | null;
  notes: string | null;
  dnf_progress: string | null;
  lent_to: string | null; // owner-only; strip with hidePrivate() for visitors
  lent_at: number | null; // epoch ms
  rereads: number; // times read again after the first read
};

export type BookInput = Omit<Book, "id" | "lent_to" | "lent_at" | "rereads">;

export type Reread = { id: number; rating: number | null; notes: string | null };

// Who you've lent books to is private to the owner.
export function hidePrivate(book: Book): Book {
  return { ...book, lent_to: null, lent_at: null };
}

export const SORTS = {
  added: { label: "Recently added", order: "id DESC" },
  title: { label: "Title", order: "lower(title), id" },
  author: { label: "Author", order: "lower(author), lower(title)" },
  rating: { label: "Rating", order: "rating DESC NULLS LAST, id DESC" },
} as const;

export type Sort = keyof typeof SORTS;

export function isSort(value: unknown): value is Sort {
  return typeof value === "string" && value in SORTS;
}

export type ImportBook = Omit<BookInput, "cover_url" | "dnf_progress"> & {
  goodreads_id: string | null;
  read_count: number;
};

export function seriesLabel(book: Pick<Book, "series" | "series_number">) {
  if (!book.series) return null;
  return book.series_number ? `${book.series} #${book.series_number}` : book.series;
}
