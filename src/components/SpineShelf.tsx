"use client";

import Link from "next/link";
import { useState } from "react";
import { STATUSES, type Book } from "@/lib/types";
import { bookTags, Cover, titleHue } from "./Cover";
import { seriesLabel } from "./Shelf";
import { Stars } from "./Stars";

// Deterministic "physical" size per book, so the shelf looks the same every visit.
function spineSize(title: string) {
  let h = 7;
  for (const c of title) h = (h * 33 + c.charCodeAt(0)) >>> 0;
  return { width: 30 + (h % 6) * 4, height: 150 + ((h >>> 4) % 5) * 10 };
}

const surname = (author: string) => author.trim().split(/\s+/).pop();

export function SpineShelf({ books }: { books: Book[] }) {
  const [openId, setOpenId] = useState<number | null>(null);
  const open = books.find((b) => b.id === openId);

  return (
    <div className="bookcase spines">
      <ul className="shelf spine-row">
        {books.map((book) => {
          const { width, height } = spineSize(book.title);
          return (
            <li key={book.id}>
              <button
                type="button"
                className={`spine status-${book.status}`}
                style={{ "--hue": titleHue(book.title), width, height } as React.CSSProperties}
                aria-expanded={openId === book.id}
                onClick={() => setOpenId(openId === book.id ? null : book.id)}
                title={`${book.title} by ${book.author}`}
              >
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
                Put it back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
