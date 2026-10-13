"use client";

import Link from "next/link";
import { seriesLabel, type Book } from "@/lib/types";
import { useFlip } from "./useFlip";
import { bookTags, Cover } from "./Cover";

export function Shelf({ books }: { books: Book[] }) {
  const ref = useFlip<HTMLUListElement>(books);
  return (
    <div className="bookcase">
      <ul className="shelf" ref={ref}>
        {books.map((book) => (
          <li key={book.id} data-flip={`cover-${book.id}`}>
            <ShelfBook book={book} />
          </li>
        ))}
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
