"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { checkPassword, endSession, isAdmin, startSession } from "@/lib/auth";
import { createBook, deleteBook, updateBook, type BookInput } from "@/lib/books";

export type FormState = { error?: string; values?: Record<string, string> };

function text(fd: FormData, key: string) {
  const value = String(fd.get(key) ?? "").trim();
  return value === "" ? null : value;
}

function parseBook(fd: FormData): BookInput | string {
  const title = text(fd, "title");
  const author = text(fd, "author");
  if (!title) return "Title is required.";
  if (!author) return "Author is required.";

  const finished_on = text(fd, "finished_on");
  if (finished_on && !/^\d{4}-\d{2}-\d{2}$/.test(finished_on)) return "Date finished is invalid.";

  const ratingRaw = text(fd, "rating");
  const rating = ratingRaw ? Number(ratingRaw) : null;
  if (rating !== null && !(Number.isInteger(rating) && rating >= 1 && rating <= 5)) {
    return "Rating must be 1–5.";
  }

  const isbn = text(fd, "isbn")?.replace(/[^0-9Xx]/g, "").toUpperCase() || null;

  return { title, author, genre: text(fd, "genre"), finished_on, rating, isbn, notes: text(fd, "notes") };
}

export async function saveBook(_prev: FormState, fd: FormData): Promise<FormState> {
  const values = Object.fromEntries([...fd.entries()].map(([k, v]) => [k, String(v)]));
  if (!(await isAdmin())) return { error: "Your session expired. Log in again.", values };

  const book = parseBook(fd);
  if (typeof book === "string") return { error: book, values };

  let id = Number(fd.get("id"));
  if (id) {
    await updateBook(id, book);
  } else {
    id = await createBook(book);
  }

  revalidatePath("/");
  redirect(`/books/${id}`);
}

export async function removeBook(fd: FormData) {
  if (!(await isAdmin())) redirect("/login");
  await deleteBook(Number(fd.get("id")));
  revalidatePath("/");
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
