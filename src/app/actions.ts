"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { checkPassword, endSession, isAdmin, startSession } from "@/lib/auth";
import { createBook, deleteBook, isStatus, updateBook, updateStatus, type BookInput } from "@/lib/books";

export type FormState = { error?: string };

function text(fd: FormData, key: string) {
  const value = String(fd.get(key) ?? "").trim();
  return value === "" ? null : value;
}

function parseBook(fd: FormData): BookInput | string {
  const title = text(fd, "title");
  const author = text(fd, "author");
  if (!title) return "Title is required.";
  if (!author) return "Author is required.";

  const status = text(fd, "status") ?? "read";
  if (!isStatus(status)) return "Pick a reading status.";

  const ratingRaw = text(fd, "rating");
  const rating = ratingRaw ? Number(ratingRaw) : null;
  if (rating !== null && !(Number.isInteger(rating) && rating >= 1 && rating <= 5)) {
    return "Rating must be 1–5.";
  }

  const series = text(fd, "series");
  const numberRaw = text(fd, "series_number");
  const series_number = series && numberRaw ? Number(numberRaw) : null;
  if (series_number !== null && !(series_number > 0)) return "Series number must be a positive number.";

  const cover_url = text(fd, "cover_url");
  if (cover_url && !/^https:\/\//.test(cover_url)) return "Cover image must be an https:// URL.";

  const isbn = text(fd, "isbn")?.replace(/[^0-9Xx]/g, "").toUpperCase() || null;

  return {
    title,
    author,
    series,
    series_number,
    genre: text(fd, "genre"),
    status,
    rating,
    isbn,
    cover_url,
    notes: text(fd, "notes"),
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

  revalidatePath("/", "layout");
  redirect(`/books/${id}`);
}

export async function setStatus(id: number, status: string) {
  if (!(await isAdmin())) redirect("/login");
  if (!isStatus(status)) return;
  await updateStatus(id, status);
  revalidatePath("/", "layout");
}

export async function removeBook(fd: FormData) {
  if (!(await isAdmin())) redirect("/login");
  await deleteBook(Number(fd.get("id")));
  revalidatePath("/", "layout");
  redirect("/");
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
