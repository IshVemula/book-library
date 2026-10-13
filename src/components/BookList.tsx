import Link from "next/link";
import type { Book } from "@/lib/types";
import { bookTags, Cover } from "./Cover";
import { seriesLabel } from "./Shelf";
import { Stars } from "./Stars";
import { StatusBadge } from "./StatusBadge";

export function BookList({ books }: { books: Book[] }) {
  return (
    <ul className="book-list">
      {books.map((book) => {
        const series = seriesLabel(book);
        const tags = bookTags(book).filter((t) => t !== "DNF"); // the status badge already says it
        return (
          <li key={book.id}>
            <Link href={`/books/${book.id}`} className="row">
              <Cover book={book} size="small" />
              <span className="row-main">
                <span className="row-title">{book.title}</span>
                <span className="row-sub">
                  {book.author}
                  {series && <> · {series}</>}
                  {tags.map((t) => (
                    <span key={t} className="mini-tag">
                      {t}
                    </span>
                  ))}
                </span>
              </span>
              <span className="row-genre">{book.genre && <span className="chip">{book.genre}</span>}</span>
              <span className="row-status">
                <StatusBadge status={book.status} />
              </span>
              <span className="row-rating">
                <Stars rating={book.rating} />
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
