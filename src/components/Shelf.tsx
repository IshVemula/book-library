import Link from "next/link";
import type { Book } from "@/lib/types";
import { bookTags, Cover } from "./Cover";

export function seriesLabel(book: Pick<Book, "series" | "series_number">) {
  if (!book.series) return null;
  return book.series_number ? `${book.series} #${book.series_number}` : book.series;
}

export function Shelf({ books }: { books: Book[] }) {
  return (
    <div className="bookcase">
      <ul className="shelf">
        {books.map((book) => (
          <li key={book.id}>
            <Link
              href={`/books/${book.id}`}
              className={`shelf-book status-${book.status}`}
              title={`${book.title} by ${book.author}`}
            >
              <Cover book={book} tags={bookTags(book)} />
              <span className="shelf-label">
                <span className="shelf-title">{book.title}</span>
                <span className="shelf-author">{seriesLabel(book) ?? book.author}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
