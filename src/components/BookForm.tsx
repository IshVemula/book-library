"use client";

import Link from "next/link";
import { useActionState } from "react";
import { saveBook, type FormState } from "@/app/actions";
import type { Book } from "@/lib/books";

export function BookForm({ book, genres }: { book?: Book; genres: string[] }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveBook, {});

  // After a failed save, refill the form with what was submitted.
  const v = (key: keyof Book) => state.values?.[key] ?? String(book?.[key] ?? "");

  return (
    <form action={action} className="book-form">
      {book && <input type="hidden" name="id" value={book.id} />}

      <label className="field span-2">
        <span>Title</span>
        <input name="title" required defaultValue={v("title")} autoFocus={!book} />
      </label>

      <label className="field span-2">
        <span>Author</span>
        <input name="author" required defaultValue={v("author")} />
      </label>

      <label className="field">
        <span>Genre</span>
        <input name="genre" list="genres" defaultValue={v("genre")} placeholder="e.g. Fantasy" />
        <datalist id="genres">
          {genres.map((g) => (
            <option key={g} value={g} />
          ))}
        </datalist>
      </label>

      <label className="field">
        <span>Date finished</span>
        <input name="finished_on" type="date" defaultValue={v("finished_on")} />
      </label>

      <label className="field">
        <span>Rating</span>
        <select name="rating" defaultValue={v("rating")}>
          <option value="">—</option>
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {"★".repeat(n)} ({n})
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>
          ISBN <small>(optional, for the cover)</small>
        </span>
        <input name="isbn" inputMode="numeric" defaultValue={v("isbn")} placeholder="9780547928227" />
      </label>

      <label className="field span-2">
        <span>Notes</span>
        <textarea name="notes" rows={6} defaultValue={v("notes")} placeholder="Thoughts, favourite quotes…" />
      </label>

      {state.error && (
        <p className="form-error span-2" role="alert">
          {state.error}
        </p>
      )}

      <div className="form-actions span-2">
        <button type="submit" className="button primary" disabled={pending}>
          {pending ? "Saving…" : book ? "Save changes" : "Add book"}
        </button>
        <Link href={book ? `/books/${book.id}` : "/"} className="button">
          Cancel
        </Link>
      </div>
    </form>
  );
}
