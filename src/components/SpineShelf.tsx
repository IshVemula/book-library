"use client";

import Link from "next/link";
import { useState } from "react";
import { STATUSES, type Book } from "@/lib/types";
import { spineShape, swatchFor, SPINE_STYLES, bindingKey } from "@/lib/palette";
import { withTrinkets } from "@/lib/trinkets";
import { bookTags, Cover } from "./Cover";
import { seriesLabel } from "./Shelf";
import { Stars } from "./Stars";
import { Trinket } from "./Trinket";

// Colours and sizes come from the shared palette (so a spine matches its
// generated cover, and a series looks like a box set). If two different books
// land side by side in the same colour, vary the band style so they still
// read as separate books.
function spineLooks(books: Book[]) {
  let prev: { key: string; cloth: string; style: number } | null = null;
  return books.map((book) => {
    const key = bindingKey(book);
    const { cloth, ink, foil } = swatchFor(book);
    const { width, height, style: preferred } = spineShape(book);
    const clash = prev && prev.key !== key && prev.cloth === cloth && prev.style === preferred;
    const style = clash ? (preferred + 1) % SPINE_STYLES : preferred;
    prev = { key, cloth, style };
    return { cloth, ink, foil, width, height, style };
  });
}

const surname = (author: string) => author.trim().split(/\s+/).pop();

export function SpineShelf({ books }: { books: Book[] }) {
  const [openId, setOpenId] = useState<number | null>(null);
  const open = books.find((b) => b.id === openId);
  const looks = new Map(spineLooks(books).map((look, i) => [books[i].id, look]));

  return (
    <div className="bookcase spines">
      <ul className="shelf spine-row">
        {withTrinkets(books).map((item) => {
          if (item.type === "trinket") {
            return (
              <li key={item.key} className="trinket-cell">
                <Trinket kind={item.kind} label={item.label} />
              </li>
            );
          }
          const { book } = item;
          const { cloth, ink, foil, width, height, style } = looks.get(book.id)!;
          return (
            <li key={book.id}>
              <button
                type="button"
                className={`spine spine-style-${style} status-${book.status}${book.series_number ? " numbered" : ""}`}
                style={{ "--cloth": cloth, "--ink": ink, "--foil": foil, width, height } as React.CSSProperties}
                aria-expanded={openId === book.id}
                onClick={() => setOpenId(openId === book.id ? null : book.id)}
                title={`${book.title} by ${book.author}`}
              >
                {book.series_number ? <span className="spine-number">{book.series_number}</span> : null}
                <span className="spine-title">{book.title}</span>
                <span className="spine-author">{surname(book.author)}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {open && (
        <div className="spine-detail" aria-live="polite">
          <Cover book={open} tags={bookTags(open)} />
          <div className="spine-detail-text">
            {seriesLabel(open) && <p className="spine-detail-series">{seriesLabel(open)}</p>}
            <h3>{open.title}</h3>
            <p>{open.author}</p>
            <p className="spine-detail-meta">
              <span>{STATUSES[open.status]}</span>
              <Stars rating={open.rating} />
            </p>
            <div className="form-actions">
              <Link href={`/books/${open.id}`} className="button primary">
                Open book
              </Link>
              <button type="button" className="button ghost on-dark" onClick={() => setOpenId(null)}>
                Back on the shelf
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
