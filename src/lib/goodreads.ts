import type { ImportBook, Status } from "./types";
import { guessGenre } from "./openlibrary";

// RFC 4180 CSV: quoted fields may contain commas, newlines and "" escapes
// (Goodreads reviews often do).
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        quoted = false;
      } else {
        field += c;
      }
    } else if (c === '"') {
      quoted = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += c;
    }
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((f) => f.trim() !== ""));
}

// "The Final Empire (Mistborn, #1)" → title, series, number.
// Also handles "(The Stormlight Archive #1)" and "(Series, #1-3)".
const SERIES_IN_TITLE = /^(.*\S)\s+\(([^()#]+?),?\s*#(\d+(?:\.\d+)?)[^()]*\)$/;

export function splitSeries(rawTitle: string) {
  const match = rawTitle.trim().match(SERIES_IN_TITLE);
  if (!match) return { title: rawTitle.trim(), series: null, series_number: null };
  return { title: match[1], series: match[2].trim(), series_number: Number(match[3]) };
}

// Goodreads wraps ISBNs as ="0441172717" so spreadsheets keep leading zeros.
const cleanIsbn = (value: string) => value.replace(/[^0-9Xx]/g, "").toUpperCase() || null;

const DNF_SHELF = /\b(dnf|did[- ]?not[- ]?finish|abandon(ed)?|gave[- ]?up|unfinished)\b/i;

function reviewToText(html: string) {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .trim();
}

export function parseGoodreads(text: string): ImportBook[] | string {
  const rows = parseCsv(text.replace(/^﻿/, ""));
  const header = rows.shift()?.map((h) => h.trim());
  if (!header || !header.includes("Title") || !header.includes("Exclusive Shelf")) {
    return "This doesn't look like a Goodreads export. It should be the .csv file from Goodreads' “Export Library”.";
  }
  const col = (row: string[], name: string) => row[header.indexOf(name)]?.trim() ?? "";

  const books: ImportBook[] = [];
  for (const row of rows) {
    const { title, series, series_number } = splitSeries(col(row, "Title"));
    const author = col(row, "Author") || col(row, "Author l-f");
    if (!title || !author) continue;

    const shelf = col(row, "Exclusive Shelf").toLowerCase();
    const shelves = col(row, "Bookshelves");
    const status: Status =
      shelf === "currently-reading" ? "reading"
      : shelf === "to-read" ? "want"
      : DNF_SHELF.test(`${shelf} ${shelves}`) ? "dnf"
      : "read";

    const rating = Number(col(row, "My Rating"));
    const readCount = Number(col(row, "Read Count"));

    books.push({
      goodreads_id: col(row, "Book Id") || null,
      title: title.slice(0, 500),
      author: author.slice(0, 200),
      series,
      series_number,
      genre: guessGenre(shelves.split(",").map((s) => s.trim())),
      status,
      rating: rating >= 1 && rating <= 5 ? rating : null,
      isbn: cleanIsbn(col(row, "ISBN13")) ?? cleanIsbn(col(row, "ISBN")),
      notes: reviewToText(col(row, "My Review")) || null,
      read_count: status === "read" ? Math.max(readCount, 1) : Math.max(readCount, 0),
    });
  }
  return books;
}
