import { sql } from "./db";

export type Book = {
  id: number;
  title: string;
  author: string;
  genre: string | null;
  finished_on: string | null; // YYYY-MM-DD
  rating: number | null;
  isbn: string | null;
  notes: string | null;
};

export type BookInput = Omit<Book, "id">;

export const SORTS = {
  recent: { label: "Recently read", order: "books.finished_on DESC NULLS LAST, id DESC" },
  title: { label: "Title", order: "lower(title), id" },
  author: { label: "Author", order: "lower(author), lower(title)" },
  rating: { label: "Rating", order: "rating DESC NULLS LAST, books.finished_on DESC NULLS LAST" },
} as const;

export type Sort = keyof typeof SORTS;

export function isSort(value: string): value is Sort {
  return value in SORTS;
}

const COLUMNS = `id, title, author, genre, to_char(finished_on, 'YYYY-MM-DD') AS finished_on, rating, isbn, notes`;

export async function listBooks({ q = "", genre = "", sort = "recent" as Sort } = {}) {
  const where: string[] = [];
  const params: unknown[] = [];

  if (q.trim()) {
    params.push(`%${q.trim()}%`);
    where.push(`(title ILIKE $${params.length} OR author ILIKE $${params.length} OR notes ILIKE $${params.length})`);
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

export async function listGenres() {
  const rows = await sql<{ genre: string }>(
    `SELECT DISTINCT genre FROM books WHERE genre IS NOT NULL AND genre <> '' ORDER BY genre`,
  );
  return rows.map((r) => r.genre);
}

export async function getStats() {
  const [row] = await sql<{ total: string; this_year: string; avg_rating: string | null }>(`
    SELECT
      count(*) AS total,
      count(*) FILTER (WHERE date_part('year', finished_on) = date_part('year', now())) AS this_year,
      round(avg(rating), 1) AS avg_rating
    FROM books`);
  return {
    total: Number(row.total),
    thisYear: Number(row.this_year),
    avgRating: row.avg_rating === null ? null : Number(row.avg_rating),
  };
}

const VALUES = [
  "title", "author", "genre", "finished_on", "rating", "isbn", "notes",
] as const satisfies readonly (keyof BookInput)[];

export async function createBook(book: BookInput) {
  const [row] = await sql<{ id: number }>(
    `INSERT INTO books (${VALUES.join(", ")}) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    VALUES.map((k) => book[k]),
  );
  return row.id;
}

export async function updateBook(id: number, book: BookInput) {
  const sets = VALUES.map((k, i) => `${k} = $${i + 2}`).join(", ");
  await sql(`UPDATE books SET ${sets} WHERE id = $1`, [id, ...VALUES.map((k) => book[k])]);
}

export async function deleteBook(id: number) {
  await sql(`DELETE FROM books WHERE id = $1`, [id]);
}
