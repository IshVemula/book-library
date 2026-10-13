"use client";

import { FileUp, Library } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { importGoodreads } from "@/app/actions";
import { STATUSES, type ImportBook, type Status } from "@/lib/types";
import { parseGoodreads } from "@/lib/goodreads";
import { useFindCovers } from "./MissingCovers";

const BATCH = 200;

type Phase =
  | { step: "pick"; error?: string }
  | { step: "preview"; books: ImportBook[]; fileName: string }
  | { step: "importing"; done: number; total: number }
  | { step: "done"; added: number; skipped: number }
  | { step: "failed"; error: string; added: number };

export function ImportForm() {
  const [phase, setPhase] = useState<Phase>({ step: "pick" });
  const covers = useFindCovers();

  async function onFile(file: File | undefined) {
    if (!file) return;
    const result = parseGoodreads(await file.text());
    if (typeof result === "string") setPhase({ step: "pick", error: result });
    else if (result.length === 0) setPhase({ step: "pick", error: "That file has no books in it." });
    else setPhase({ step: "preview", books: result, fileName: file.name });
  }

  async function runImport(books: ImportBook[]) {
    let added = 0;
    let skipped = 0;
    setPhase({ step: "importing", done: 0, total: books.length });
    for (let i = 0; i < books.length; i += BATCH) {
      try {
        const result = await importGoodreads(books.slice(i, i + BATCH));
        added += result.added;
        skipped += result.skipped;
      } catch {
        setPhase({ step: "failed", error: "Something went wrong partway through.", added });
        return;
      }
      setPhase({ step: "importing", done: Math.min(i + BATCH, books.length), total: books.length });
    }
    setPhase({ step: "done", added, skipped });
    if (added > 0) covers.run(); // look online for covers the import didn't bring
  }

  if (phase.step === "pick") {
    return (
      <div className="import">
        <ol className="import-steps">
          <li>
            On Goodreads, open{" "}
            <a href="https://www.goodreads.com/review/import" target="_blank" rel="noreferrer">
              My Books → Import and export
            </a>
            .
          </li>
          <li>
            Click <strong>Export Library</strong>, wait a moment, then download the file it links to.
          </li>
          <li>Choose that file below.</li>
        </ol>
        <label className="dropzone">
          <input type="file" accept=".csv,text/csv" onChange={(e) => onFile(e.target.files?.[0])} />
          <FileUp className="dropzone-icon" aria-hidden />
          <span className="dropzone-title">Choose your Goodreads export</span>
          <span className="muted">goodreads_library_export.csv</span>
        </label>
        {phase.error && (
          <p className="form-error" role="alert">
            {phase.error}
          </p>
        )}
      </div>
    );
  }

  if (phase.step === "preview") {
    const { books } = phase;
    const counts = Object.fromEntries(
      (Object.keys(STATUSES) as Status[]).map((s) => [s, books.filter((b) => b.status === s).length]),
    ) as Record<Status, number>;
    const inSeries = books.filter((b) => b.series).length;
    const rereads = books.filter((b) => b.read_count > 1).length;

    return (
      <div className="import">
        <p className="import-found">
          Found <strong>{books.length}</strong> books in <em>{phase.fileName}</em>
        </p>
        <dl className="import-summary">
          {(Object.keys(STATUSES) as Status[])
            .filter((s) => counts[s] > 0)
            .map((s) => (
              <div key={s}>
                <dt>{STATUSES[s]}</dt>
                <dd>{counts[s]}</dd>
              </div>
            ))}
          <div>
            <dt>In a series</dt>
            <dd>{inSeries}</dd>
          </div>
          <div>
            <dt>Read more than once</dt>
            <dd>{rereads}</dd>
          </div>
        </dl>
        <ul className="import-sample">
          {books.slice(0, 6).map((b, i) => (
            <li key={i}>
              <strong>{b.title}</strong> <span className="muted">· {b.author}</span>
              {b.series && (
                <span className="muted">
                  {" "}
                  · {b.series} #{b.series_number}
                </span>
              )}
            </li>
          ))}
          {books.length > 6 && <li className="muted">…and {books.length - 6} more</li>}
        </ul>
        <p className="muted import-note">
          Books already on your shelves are skipped, so it&rsquo;s safe to import again later. Your Goodreads reviews
          become notes (visible to visitors); private notes aren&rsquo;t imported.
        </p>
        <div className="form-actions">
          <button type="button" className="button primary" onClick={() => runImport(books)}>
            Import {books.length} books
          </button>
          <button type="button" className="button" onClick={() => setPhase({ step: "pick" })}>
            Choose a different file
          </button>
        </div>
      </div>
    );
  }

  if (phase.step === "importing") {
    const pct = Math.round((phase.done / phase.total) * 100);
    return (
      <div className="import">
        <p>
          Putting books on your shelves… {phase.done} / {phase.total}
        </p>
        <div className="progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <span style={{ width: `${pct}%` }} />
        </div>
      </div>
    );
  }

  if (phase.step === "failed") {
    return (
      <div className="import">
        <p className="form-error">
          {phase.error} {phase.added} books were added before it stopped. Importing the same file again will pick up
          where it left off.
        </p>
        <button type="button" className="button" onClick={() => setPhase({ step: "pick" })}>
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="import">
      <p className="import-found">
        🎉 Added <strong>{phase.added}</strong> {phase.added === 1 ? "book" : "books"} to your shelves
        {phase.skipped > 0 && <> (skipped {phase.skipped} already there)</>}.
      </p>
      <p className="muted" aria-live="polite">
        {covers.running
          ? `Now hunting for covers… ${covers.progress?.found ?? 0} found so far.`
          : covers.progress
            ? `Found covers for ${covers.progress.found} of ${covers.progress.checked} books that needed one. For the rest, use “Change the cover” on the book’s edit page.`
            : "Books with an ISBN get their cover automatically."}
      </p>
      <Link href="/" className="button primary">
        <Library aria-hidden /> Go admire your shelves
      </Link>
    </div>
  );
}
