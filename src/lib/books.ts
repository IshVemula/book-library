import { sql } from "./db";

export const STATUSES = {
  reading: "Currently reading",
  read: "Read",
  want: "Want to read",
} as const;

export type Status = keyof typeof STATUSES;

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
};

export type BookInput = Omit<Book, "id">;

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

const COLUMNS = `id, title, author, series, series_number::float8 AS series_number, genre, status, rating, isbn, cover_url, notes`;

export async function listBooks({ q = "", genre = "", sort = "added" as Sort } = {}) {
  const where: string[] = [];
  const params: unknown[] = [];

  if (q.trim()) {
    params.push(`%${q.trim()}%`);
    const p = `$${params.length}`;
    where.push(`(title ILIKE ${p} OR author ILIKE ${p} OR series ILIKE ${p} OR notes ILIKE ${p})`);
  }
  if (genre) {
    params.push(genre);
    where.push(`genre = $${params.length}`);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  return sql<Book>(`SELECT ${COLUMNS} FROM books ${whereSql} ORDER BY ${SORTS[sort].order}`, params);
}

export async function getBook(id: number) {
  if (!Number.isInteger(id)) return null;
  const rows = await sql<Book>(`SELECT ${COLUMNS} FROM books WHERE id = $1`, [id]);
  return rows[0] ?? null;
}

async function distinct(column: "genre" | "series") {
  const rows = await sql<{ value: string }>(
    `SELECT DISTINCT ${column} AS value FROM books WHERE ${column} IS NOT NULL AND ${column} <> '' ORDER BY 1`,
  );
  return rows.map((r) => r.value);
}

export const listGenres = () => distinct("genre");
export const listSeries = () => distinct("series");

export async function getStats() {
  const [row] = await sql<{ read: string; authors: string; avg_rating: string | null }>(`
    SELECT
      count(*) FILTER (WHERE status = 'read') AS read,
      count(DISTINCT author) AS authors,
      round(avg(rating) FILTER (WHERE status = 'read'), 1) AS avg_rating
    FROM books`);
  return {
    read: Number(row.read),
    authors: Number(row.authors),
    avgRating: row.avg_rating === null ? null : Number(row.avg_rating),
  };
}

const VALUES = [
  "title", "author", "series", "series_number", "genre", "status", "rating", "isbn", "cover_url", "notes",
] as const satisfies readonly (keyof BookInput)[];

export async function createBook(book: BookInput) {
  const placeholders = VALUES.map((_, i) => `$${i + 1}`).join(", ");
  const [row] = await sql<{ id: number }>(
    `INSERT INTO books (${VALUES.join(", ")}) VALUES (${placeholders}) RETURNING id`,
    VALUES.map((k) => book[k]),
  );
  return row.id;
}

export async function updateBook(id: number, book: BookInput) {
  const sets = VALUES.map((k, i) => `${k} = $${i + 2}`).join(", ");
  await sql(`UPDATE books SET ${sets} WHERE id = $1`, [id, ...VALUES.map((k) => book[k])]);
}

export async function updateStatus(id: number, status: Status) {
  await sql(`UPDATE books SET status = $2 WHERE id = $1`, [id, status]);
}

export async function deleteBook(id: number) {
  await sql(`DELETE FROM books WHERE id = $1`, [id]);
}
