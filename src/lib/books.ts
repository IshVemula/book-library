import { sql } from "./db";
import type { Book, ImportBook, Reread, Sort, Status, BookInput } from "./types";
import { SORTS } from "./types";

export * from "./types";

const COLUMNS = `
  id, title, author, series, series_number::float8 AS series_number, genre, status, rating,
  isbn, cover_url, notes, dnf_progress, lent_to,
  (extract(epoch FROM lent_at) * 1000)::float8 AS lent_at,
  (SELECT count(*)::int FROM rereads r WHERE r.book_id = books.id) AS rereads`;

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
  "title", "author", "series", "series_number", "genre", "status", "rating", "isbn", "cover_url", "notes", "dnf_progress",
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

// Lending

export async function setLending(id: number, lentTo: string | null) {
  await sql(
    `UPDATE books SET lent_to = $2, lent_at = CASE WHEN $2::text IS NULL THEN NULL ELSE now() END WHERE id = $1`,
    [id, lentTo],
  );
}

// Rereads

export async function listRereads(bookId: number) {
  return sql<Reread>(`SELECT id, rating, notes FROM rereads WHERE book_id = $1 ORDER BY id`, [bookId]);
}

export async function addReread(bookId: number, rating: number | null, notes: string | null) {
  await sql(`INSERT INTO rereads (book_id, rating, notes) VALUES ($1, $2, $3)`, [bookId, rating, notes]);
}

export async function deleteReread(bookId: number, rereadId: number) {
  await sql(`DELETE FROM rereads WHERE id = $1 AND book_id = $2`, [rereadId, bookId]);
}

// Series you've marked as finished (no more "add the next book" suggestions)

export async function listFinishedSeries() {
  const rows = await sql<{ name: string }>(`SELECT name FROM finished_series`);
  return new Set(rows.map((r) => r.name));
}

export async function setSeriesFinished(name: string, finished: boolean) {
  await sql(
    finished
      ? `INSERT INTO finished_series (name) VALUES ($1) ON CONFLICT DO NOTHING`
      : `DELETE FROM finished_series WHERE name = $1`,
    [name],
  );
}

// Bulk import (Goodreads)

const IMPORT_COLUMNS = [
  "title", "author", "series", "series_number", "genre", "status", "rating", "isbn", "notes", "goodreads_id",
] as const;

const bookKey = (title: string, author: string) => `${title.trim().toLowerCase()}|${author.trim().toLowerCase()}`;

// Inserts books that aren't already in the library (matched by Goodreads id,
// or by title + author), plus one reread per extra read.
export async function importBooks(books: ImportBook[]) {
  const existing = await sql<{ goodreads_id: string | null; title: string; author: string }>(
    `SELECT goodreads_id, title, author FROM books`,
  );
  const seenIds = new Set(existing.map((b) => b.goodreads_id).filter(Boolean));
  const seenKeys = new Set(existing.map((b) => bookKey(b.title, b.author)));

  const fresh: ImportBook[] = [];
  for (const book of books) {
    const key = bookKey(book.title, book.author);
    if ((book.goodreads_id && seenIds.has(book.goodreads_id)) || seenKeys.has(key)) continue;
    seenKeys.add(key);
    if (book.goodreads_id) seenIds.add(book.goodreads_id);
    fresh.push(book);
  }
  if (fresh.length === 0) return { added: 0, skipped: books.length };

  const params: unknown[] = [];
  const rows = fresh.map((book) => {
    const placeholders = IMPORT_COLUMNS.map((col) => {
      params.push(book[col]);
      return `$${params.length}`;
    });
    return `(${placeholders.join(", ")})`;
  });
  const inserted = await sql<{ id: number; title: string; author: string }>(
    `INSERT INTO books (${IMPORT_COLUMNS.join(", ")}) VALUES ${rows.join(", ")} RETURNING id, title, author`,
    params,
  );

  const idByKey = new Map(inserted.map((r) => [bookKey(r.title, r.author), r.id]));
  const rereadIds = fresh.flatMap((book) => {
    const id = idByKey.get(bookKey(book.title, book.author));
    const extra = Math.min(Math.max(book.read_count - 1, 0), 20);
    return id ? Array.from({ length: extra }, () => id) : [];
  });
  if (rereadIds.length) {
    await sql(
      `INSERT INTO rereads (book_id) VALUES ${rereadIds.map((_, i) => `($${i + 1})`).join(", ")}`,
      rereadIds,
    );
  }

  return { added: fresh.length, skipped: books.length - fresh.length };
}
