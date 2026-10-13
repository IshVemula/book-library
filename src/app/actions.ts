"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { checkPassword, endSession, isAdmin, startSession } from "@/lib/auth";
import {
  addReread,
  createBook,
  deleteBook,
  deleteReread,
  importBooks,
  isStatus,
  setLending,
  setSeriesFinished,
  updateBook,
  updateStatus,
  type BookInput,
  type ImportBook,
} from "@/lib/books";

export type FormState = { error?: string };

async function requireAdmin() {
  if (!(await isAdmin())) redirect("/login");
}

function refresh() {
  revalidatePath("/", "layout");
}

function text(fd: FormData, key: string, max = 5000) {
  const value = String(fd.get(key) ?? "").trim().slice(0, max);
  return value === "" ? null : value;
}

function parseRating(raw: string | null) {
  const rating = raw ? Number(raw) : null;
  return rating !== null && Number.isInteger(rating) && rating >= 1 && rating <= 5 ? rating : null;
}

function parseBook(fd: FormData): BookInput | string {
  const title = text(fd, "title", 500);
  const author = text(fd, "author", 200);
  if (!title) return "Title is required.";
  if (!author) return "Author is required.";

  const status = text(fd, "status") ?? "read";
  if (!isStatus(status)) return "Pick a reading status.";

  const ratingRaw = text(fd, "rating");
  const rating = parseRating(ratingRaw);
  if (ratingRaw && rating === null) return "Rating must be 1–5.";

  const series = text(fd, "series", 200);
  const numberRaw = text(fd, "series_number");
  const series_number = series && numberRaw ? Number(numberRaw) : null;
  if (series_number !== null && !(series_number > 0)) return "Series number must be a positive number.";

  const cover_url = text(fd, "cover_url", 1000);
  if (cover_url && !/^https:\/\//.test(cover_url)) return "Cover image must be an https:// URL.";

  const isbn = text(fd, "isbn")?.replace(/[^0-9Xx]/g, "").toUpperCase() || null;

  return {
    title,
    author,
    series,
    series_number,
    genre: text(fd, "genre", 100),
    status,
    rating,
    isbn,
    cover_url,
    notes: text(fd, "notes"),
    dnf_progress: status === "dnf" ? text(fd, "dnf_progress", 200) : null,
  };
}

export async function saveBook(_prev: FormState, fd: FormData): Promise<FormState> {
  if (!(await isAdmin())) return { error: "Your session expired. Log in again in another tab, then retry." };

  const book = parseBook(fd);
  if (typeof book === "string") return { error: book };

  let id = Number(fd.get("id"));
  if (id) {
    await updateBook(id, book);
  } else {
    id = await createBook(book);
  }
  // Adding to a series you'd marked finished means it isn't finished after all.
  if (book.series) await setSeriesFinished(book.series, false);

  refresh();
  redirect(`/books/${id}`);
}

export async function setStatus(id: number, status: string) {
  await requireAdmin();
  if (!isStatus(status)) return;
  await updateStatus(id, status);
  refresh();
}

export async function removeBook(fd: FormData) {
  await requireAdmin();
  await deleteBook(Number(fd.get("id")));
  refresh();
  redirect("/");
}

export async function lendBook(id: number, fd: FormData) {
  await requireAdmin();
  const lentTo = text(fd, "lent_to", 80);
  if (!lentTo) return;
  await setLending(id, lentTo);
  refresh();
}

export async function returnBook(id: number) {
  await requireAdmin();
  await setLending(id, null);
  refresh();
}

export async function logReread(id: number, fd: FormData) {
  await requireAdmin();
  await addReread(id, parseRating(text(fd, "rating")), text(fd, "notes"));
  refresh();
}

export async function removeReread(bookId: number, rereadId: number) {
  await requireAdmin();
  await deleteReread(bookId, rereadId);
  refresh();
}

export async function finishSeries(name: string) {
  await requireAdmin();
  await setSeriesFinished(name, true);
  refresh();
}

export async function importGoodreads(books: ImportBook[]) {
  if (!(await isAdmin())) throw new Error("Not logged in");
  if (!Array.isArray(books) || books.length > 500) throw new Error("Send at most 500 books at a time");

  const clean = books.flatMap((b): ImportBook[] => {
    const title = String(b.title ?? "").trim().slice(0, 500);
    const author = String(b.author ?? "").trim().slice(0, 200);
    if (!title || !author) return [];
    const str = (v: unknown, max: number) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null);
    const number = Number(b.series_number);
    return [
      {
        title,
        author,
        series: str(b.series, 200),
        series_number: b.series && number > 0 ? number : null,
        genre: str(b.genre, 100),
        status: isStatus(b.status) ? b.status : "read",
        rating: parseRating(String(b.rating ?? "")),
        isbn: str(b.isbn, 20),
        notes: str(b.notes, 10000),
        goodreads_id: str(b.goodreads_id, 40),
        read_count: Math.min(Math.max(Math.floor(Number(b.read_count) || 0), 0), 50),
      },
    ];
  });

  const result = await importBooks(clean);
  refresh();
  return result;
}

export async function login(_prev: FormState, fd: FormData): Promise<FormState> {
  if (!checkPassword(String(fd.get("password") ?? ""))) {
    return { error: "That password isn't right." };
  }
  await startSession();
  redirect("/");
}

export async function logout() {
  await endSession();
  redirect("/");
}
