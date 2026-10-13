"use client";

import Link from "next/link";
import { startTransition, useActionState, useEffect, useState } from "react";
import { saveBook, type FormState } from "@/app/actions";
import { STATUSES, type Book } from "@/lib/types";
import type { LookupResult } from "@/lib/openlibrary";
import { Cover } from "./Cover";

const FIELDS = [
  "title", "author", "series", "series_number", "genre", "status", "rating", "isbn", "cover_url", "notes", "dnf_progress",
] as const;
export type Fields = Record<(typeof FIELDS)[number], string>;

function toFields(book?: Book, initial: Partial<Fields> = {}): Fields {
  const fields = Object.fromEntries(FIELDS.map((k) => [k, String(initial[k] ?? book?.[k] ?? "")])) as Fields;
  fields.status ||= "read";
  return fields;
}

export function BookForm({
  book,
  initial,
  genres,
  series,
}: {
  book?: Book;
  initial?: Partial<Fields>; // prefill for a new book, e.g. "next in series"
  genres: string[];
  series: string[];
}) {
  const [state, dispatch, pending] = useActionState<FormState, FormData>(saveBook, {});
  const [f, setF] = useState(() => toFields(book, initial));
  const [filledFrom, setFilledFrom] = useState<string | null>(null);

  const bind = (key: keyof Fields) => ({
    name: key,
    value: f[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setF((prev) => ({ ...prev, [key]: e.target.value })),
  });

  function fill(r: LookupResult) {
    setF((prev) => ({
      ...prev,
      title: r.title,
      author: r.author ?? prev.author,
      isbn: r.isbn ?? "",
      cover_url: r.cover_url ?? "",
      genre: prev.genre || r.genre || "",
    }));
    setFilledFrom(r.title);
  }

  // Submit manually so React doesn't reset the (controlled) form on errors.
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => dispatch(fd));
  }

  return (
    <div className="form-layout">
      <aside className="form-cover">
        <Cover
          size="large"
          book={{
            title: f.title || "Untitled",
            author: f.author,
            series: f.series,
            series_number: Number(f.series_number) || null,
            isbn: f.isbn || null,
            cover_url: f.cover_url || null,
            status: f.status as Book["status"],
          }}
        />
        {f.cover_url && (
          <button type="button" className="link-button" onClick={() => setF((p) => ({ ...p, cover_url: "" }))}>
            Remove cover image
          </button>
        )}
      </aside>

      <div className="form-main">
        <Lookup
          onPick={fill}
          defaultQuery={!book && initial?.series ? [initial.series, initial.author].filter(Boolean).join(" ") : ""}
        />
        {filledFrom && (
          <p className="filled-note" role="status">
            Filled in from Open Library. Check the details below.
          </p>
        )}

        <form onSubmit={onSubmit} className="book-form">
          {book && <input type="hidden" name="id" value={book.id} />}
          <input type="hidden" {...bind("cover_url")} />

          <fieldset className="field span-2">
            <legend>Status</legend>
            <div className="segmented">
              {Object.entries(STATUSES).map(([value, label]) => (
                <label key={value} className="segmented-option">
                  <input
                    type="radio"
                    name="status"
                    value={value}
                    checked={f.status === value}
                    onChange={() => setF((p) => ({ ...p, status: value }))}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {f.status === "dnf" && (
            <label className="field span-2">
              <span>
                Where did you stop? <small>(optional)</small>
              </span>
              <input {...bind("dnf_progress")} placeholder="e.g. page 120, or chapter 9" />
            </label>
          )}

          <label className="field span-2">
            <span>Title</span>
            <input required {...bind("title")} />
          </label>

          <label className="field span-2">
            <span>Author</span>
            <input required {...bind("author")} />
          </label>

          <label className="field">
            <span>
              Series <small>(optional)</small>
            </span>
            <input list="series-list" {...bind("series")} placeholder="e.g. Mistborn" />
            <datalist id="series-list">
              {series.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </label>

          <label className="field">
            <span>Book # in series</span>
            <input type="number" min="0" step="any" inputMode="decimal" disabled={!f.series} {...bind("series_number")} />
          </label>

          <label className="field">
            <span>Genre</span>
            <input list="genres" {...bind("genre")} placeholder="e.g. Fantasy" />
            <datalist id="genres">
              {genres.map((g) => (
                <option key={g} value={g} />
              ))}
            </datalist>
          </label>

          <label className="field">
            <span>Rating</span>
            <select {...bind("rating")}>
              <option value="">—</option>
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {"★".repeat(n)} ({n})
                </option>
              ))}
            </select>
          </label>

          <label className="field span-2">
            <span>
              ISBN <small>(optional, used for the cover if there&rsquo;s no image)</small>
            </span>
            <input inputMode="numeric" {...bind("isbn")} />
          </label>

          <label className="field span-2">
            <span>Notes</span>
            <textarea rows={6} {...bind("notes")} placeholder="Thoughts, favourite quotes…" />
          </label>

          {state.error && (
            <p className="form-error span-2" role="alert">
              {state.error}
            </p>
          )}

          <div className="form-actions span-2">
            <button type="submit" className="button primary" disabled={pending}>
              {pending ? "Saving…" : book ? "Save changes" : "Add to shelf"}
            </button>
            <Link href={book ? `/books/${book.id}` : "/"} className="button">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

function Lookup({ onPick, defaultQuery = "" }: { onPick: (r: LookupResult) => void; defaultQuery?: string }) {
  const [q, setQ] = useState(defaultQuery);
  const [results, setResults] = useState<LookupResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const term = q.trim();

  useEffect(() => {
    if (term.length < 3) return;
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/lookup?q=${encodeURIComponent(term)}`, { signal: ctrl.signal });
        if (!res.ok) throw new Error(String(res.status));
        setResults(await res.json());
        setError(null);
      } catch {
        if (!ctrl.signal.aborted) setError("Couldn't reach Open Library. You can still fill the form in by hand.");
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    }, 400);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [term]);

  const show = term.length >= 3;

  return (
    <div className="lookup">
      <label className="field">
        <span>Find a book to auto-fill</span>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by title, author or ISBN…"
        />
      </label>
      {show && (
        <div className="lookup-results" aria-live="polite">
          {loading && !results && <p className="muted">Searching Open Library…</p>}
          {error && <p className="form-error">{error}</p>}
          {results && results.length === 0 && !loading && <p className="muted">No matches. Fill the form in by hand.</p>}
          {results && results.length > 0 && (
            <ul>
              {results.map((r, i) => (
                <li key={`${r.title}-${i}`}>
                  <button
                    type="button"
                    onClick={() => {
                      onPick(r);
                      setQ("");
                      setResults(null);
                    }}
                  >
                    <Cover book={{ title: r.title, author: r.author ?? "", isbn: null, cover_url: r.cover_url }} size="small" />
                    <span>
                      <strong>{r.title}</strong>
                      <span className="muted">
                        {[r.author, r.year].filter(Boolean).join(" · ")}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
