"use client";

import { BookOpen, Undo2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { seriesLabel, STATUSES, type Book } from "@/lib/types";
import { spineShape, swatchFor, SPINE_STYLES, bindingKey } from "@/lib/palette";
import { withTrinkets } from "@/lib/trinkets";
import { useFlip } from "./useFlip";
import { bookTags, Cover } from "./Cover";
import { MotifField, shelfGenre } from "./GenreArt";
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
  const ref = useFlip<HTMLUListElement>(books);
  const [openId, setOpenId] = useState<number | null>(null);
  const open = books.find((b) => b.id === openId);
  const looks = new Map(spineLooks(books).map((look, i) => [books[i].id, look]));

  return (
    <div className="bookcase spines">
      <ul className="shelf spine-row" ref={ref}>
        <MotifField
          as="li"
          className="motif-wall"
          genre={shelfGenre(books)}
          seed={`spine-${books[0]?.id}`}
          rows={2 * Math.ceil(books.length / 24)}
        />
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
            <li key={book.id} data-flip={`spine-${book.id}`}>
              <motion.button
                type="button"
                animate={openId === book.id ? { y: -22, rotate: -2.5 } : { y: 0, rotate: 0 }}
                whileHover={openId === book.id ? undefined : { y: -7 }}
                whileTap={{ scale: 0.97 }}
                className={`spine spine-style-${style} status-${book.status}${book.series_number ? " numbered" : ""}`}
                style={{ "--cloth": cloth, "--ink": ink, "--foil": foil, width, height } as React.CSSProperties}
                aria-expanded={openId === book.id}
                onClick={() => setOpenId(openId === book.id ? null : book.id)}
                title={`${book.title} by ${book.author}`}
              >
                {book.series_number ? <span className="spine-number">{book.series_number}</span> : null}
                <span className="spine-title">{book.title}</span>
                <span className="spine-author">{surname(book.author)}</span>
              </motion.button>
            </li>
          );
        })}
      </ul>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="detail"
            className="spine-detail-wrap"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="spine-detail" aria-live="polite">
              {/* The cover swings round as if the book were turned to face you. */}
              <motion.div
                key={open.id}
                className="spine-detail-cover"
                initial={{ rotateY: -75, x: -30, opacity: 0 }}
                animate={{ rotateY: 0, x: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 160, damping: 18 }}
              >
                <Cover book={open} tags={bookTags(open)} />
              </motion.div>
              <motion.div
                key={`text-${open.id}`}
                className="spine-detail-text"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {seriesLabel(open) && <p className="spine-detail-series">{seriesLabel(open)}</p>}
                <h3>{open.title}</h3>
                <p>{open.author}</p>
                <p className="spine-detail-meta">
                  <span>{STATUSES[open.status]}</span>
                  <Stars rating={open.rating} />
                </p>
                <div className="form-actions">
                  <Link href={`/books/${open.id}`} className="button primary">
                    <BookOpen aria-hidden /> Open book
                  </Link>
                  <button type="button" className="button ghost on-dark" onClick={() => setOpenId(null)}>
                    <Undo2 aria-hidden /> Back on the shelf
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
