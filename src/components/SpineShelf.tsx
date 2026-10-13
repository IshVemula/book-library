"use client";

import Link from "next/link";
import { useState } from "react";
import { STATUSES, type Book } from "@/lib/types";
import { bookTags, Cover } from "./Cover";
import { seriesLabel } from "./Shelf";
import { Stars } from "./Stars";

// Classic bookcloth colours: [cloth, lettering, foil bands]. Mostly deep
// tones with a few light ones (cream, sage, rose, ochre) for contrast.
const SPINE_PALETTE: [string, string, string][] = [
  ["#6e1f22", "#f2dfc4", "#c9a24a"], // oxblood
  ["#1f4a36", "#ece0c4", "#c9a24a"], // forest
  ["#1d2e4f", "#e8ddc6", "#c9a24a"], // navy
  ["#b9862f", "#2a1c10", "#4a3218"], // ochre
  ["#1f5a5c", "#ebe2cd", "#d4b46a"], // teal
  ["#4b2a45", "#efe0d2", "#c9a24a"], // plum
  ["#9a6a43", "#f6ead6", "#ecd09a"], // tan leather
  ["#2d2b2a", "#e2d8c8", "#b9b2a6"], // charcoal, silver foil
  ["#a8482a", "#f7e6d2", "#f0c27a"], // burnt orange
  ["#c49a8f", "#3a1f1b", "#6b3a33"], // dusty rose
  ["#e6d8bd", "#3a2a1e", "#9a6a3a"], // cream
  ["#8a9a74", "#1f2618", "#3b4a2c"], // sage
  ["#4c6178", "#ede5d5", "#d6c08a"], // slate blue
  ["#5b5a2a", "#efe6cc", "#d4b46a"], // olive
];

function hash(s: string) {
  let h = 7;
  for (const c of s) h = (h * 33 + c.charCodeAt(0)) >>> 0;
  return h;
}

// Deterministic "physical" size per book, so the shelf looks the same every visit.
function spineSize(title: string) {
  const h = hash(title);
  return { width: 30 + (h % 6) * 4, height: 150 + ((h >>> 4) % 5) * 10 };
}

// Colour by title, nudged so two neighbouring books never share a colour.
function spineColours(books: Book[]) {
  let prev = -1;
  return books.map((book) => {
    let i = hash(`${book.title}|${book.author}`) % SPINE_PALETTE.length;
    if (i === prev) i = (i + 1) % SPINE_PALETTE.length;
    prev = i;
    return SPINE_PALETTE[i];
  });
}

const surname = (author: string) => author.trim().split(/\s+/).pop();

export function SpineShelf({ books }: { books: Book[] }) {
  const [openId, setOpenId] = useState<number | null>(null);
  const open = books.find((b) => b.id === openId);
  const colours = spineColours(books);

  return (
    <div className="bookcase spines">
      <ul className="shelf spine-row">
        {books.map((book, i) => {
          const { width, height } = spineSize(book.title);
          const [cloth, ink, foil] = colours[i];
          return (
            <li key={book.id}>
              <button
                type="button"
                className={`spine status-${book.status}`}
                style={
                  { "--cloth": cloth, "--ink": ink, "--foil": foil, width, height } as React.CSSProperties
                }
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
