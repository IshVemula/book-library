"use client";

import { Check, Save } from "lucide-react";
import { useState, useTransition } from "react";
import { saveSeriesCovers } from "@/app/actions";
import type { CoverCandidate, CoverSet } from "@/lib/covers";
import type { Book } from "@/lib/types";
import { Cover } from "./Cover";

type Pick = { url: string; isbn: string | null } | null;

const describe = (c: CoverCandidate) => [c.publisher, c.year, c.format, c.source].filter(Boolean).join(" · ");

export function SeriesCoverMatcher({
  series,
  books,
  sets,
  candidates,
}: {
  series: string;
  books: Book[];
  sets: CoverSet[];
  candidates: Record<number, CoverCandidate[]>;
}) {
  const [picks, setPicks] = useState<Record<number, Pick>>({});
  const [broken, setBroken] = useState<Set<string>>(new Set());
  const markBroken = (url: string) => setBroken((b) => new Set(b).add(url));
  const [saving, startSaving] = useTransition();
  const changed = Object.entries(picks).filter(([, p]) => p) as [string, NonNullable<Pick>][];

  const choose = (bookId: number, c: CoverCandidate) => setPicks((p) => ({ ...p, [bookId]: { url: c.url, isbn: c.isbn } }));
  const applySet = (set: CoverSet) =>
    setPicks((p) => ({
      ...p,
      ...Object.fromEntries(Object.entries(set.picks).map(([id, c]) => [id, { url: c.url, isbn: c.isbn }])),
    }));

  const save = () =>
    startSaving(() =>
      saveSeriesCovers(
        series,
        changed.map(([bookId, p]) => ({ bookId: Number(bookId), url: p.url, isbn: p.isbn })),
      ),
    );

  return (
    <div className="matcher">
      <div className="matcher-preview">
        <div className="bookcase">
          <ul className="shelf">
            {books.map((book) => (
              <li key={book.id}>
                <div className={`shelf-book${picks[book.id] ? " picked" : ""}`}>
                  <Cover book={{ ...book, cover_url: picks[book.id]?.url ?? book.cover_url }} />
                  <span className="shelf-label">
                    <span className="shelf-title">
                      {book.series_number ? `#${book.series_number} ` : ""}
                      {book.title}
                    </span>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="form-actions">
          <button type="button" className="button primary" disabled={!changed.length || saving} onClick={save}>
            <Save aria-hidden /> {saving ? "Saving…" : `Save ${changed.length || ""} cover${changed.length === 1 ? "" : "s"}`}
          </button>
          {changed.length > 0 && (
            <button type="button" className="button ghost" onClick={() => setPicks({})}>
              Start over
            </button>
          )}
        </div>
      </div>

      <h2>Matching sets</h2>
      {sets.length === 0 ? (
        <p className="muted">No matching sets found, but you can still choose covers book by book below.</p>
      ) : (
        <ul className="sets">
          {sets.map((set) => (
            <li key={set.key} className="set">
              <div className="set-head">
                <div>
                  <strong>{set.label}</strong>
                  <span className="muted">
                    {" "}
                    · {Object.keys(set.picks).length} of {books.length} books · {set.sources.join(" + ")}
                  </span>
                </div>
                <button type="button" className="button" onClick={() => applySet(set)}>
                  <Check aria-hidden /> Use this set
                </button>
              </div>
              <div className="set-covers">
                {books.map((book) => {
                  const c = set.picks[book.id];
                  return c ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={book.id} src={c.thumb} alt={`${book.title}: ${describe(c)}`} title={describe(c)} loading="lazy" />
                  ) : (
                    <span key={book.id} className="cover-ghost" title="No cover from this publisher">
                      #{book.series_number ?? "?"}
                    </span>
                  );
                })}
              </div>
            </li>
          ))}
        </ul>
      )}

      <h2>Book by book</h2>
      {books.map((book) => {
        const options = candidates[book.id] ?? [];
        return (
          <section key={book.id} className="per-book">
            <h3>
              {book.series_number ? `#${book.series_number} · ` : ""}
              {book.title} <span className="muted">({options.length} covers found)</span>
            </h3>
            {options.length === 0 ? (
              <p className="muted">Nothing found online. Use “Change the cover” on the book’s edit page to upload one.</p>
            ) : (
              <div className="option-strip">
                {options
                  .filter((c) => !broken.has(c.thumb))
                  .slice(0, 40)
                  .map((c) => (
                  <button
                    key={c.url}
                    type="button"
                    className="option"
                    aria-pressed={picks[book.id]?.url === c.url}
                    onClick={() => choose(book.id, c)}
                    title={describe(c)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.thumb} alt={describe(c)} loading="lazy" onError={() => markBroken(c.thumb)} />
                    <span>{c.publisher ?? c.source}</span>
                  </button>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
