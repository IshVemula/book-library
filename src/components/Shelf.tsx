"use client";

import Link from "next/link";
import { withTrinkets } from "@/lib/trinkets";
import { seriesLabel, type Book } from "@/lib/types";
import { useFlip } from "./useFlip";
import { bookTags, Cover } from "./Cover";
import { Trinket } from "./Trinket";

export function Shelf({ books }: { books: Book[] }) {
  const ref = useFlip<HTMLUListElement>(books);
  return (
    <div className="bookcase">
      <ul className="shelf" ref={ref}>
        {withTrinkets(books).map((item) =>
          item.type === "trinket" ? (
            <li key={item.key} className="trinket-cell">
              <Trinket kind={item.kind} label={item.label} />
            </li>
          ) : (
            <li key={item.book.id} data-flip={`cover-${item.book.id}`}>
              <ShelfBook book={item.book} />
            </li>
          ),
        )}
      </ul>
    </div>
  );
}

function ShelfBook({ book }: { book: Book }) {
  return (
    <Link href={`/books/${book.id}`} className={`shelf-book status-${book.status}`} title={`${book.title} by ${book.author}`}>
      <Cover book={book} tags={bookTags(book)} />
      <span className="shelf-label">
        <span className="shelf-title">{book.title}</span>
        <span className="shelf-author">{seriesLabel(book) ?? book.author}</span>
      </span>
    </Link>
  );
}
