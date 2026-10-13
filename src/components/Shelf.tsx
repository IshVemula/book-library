import Link from "next/link";
import { withTrinkets } from "@/lib/trinkets";
import type { Book } from "@/lib/types";
import { bookTags, Cover } from "./Cover";
import { Trinket } from "./Trinket";

export function seriesLabel(book: Pick<Book, "series" | "series_number">) {
  if (!book.series) return null;
  return book.series_number ? `${book.series} #${book.series_number}` : book.series;
}

export function Shelf({ books }: { books: Book[] }) {
  return (
    <div className="bookcase">
      <ul className="shelf">
        {withTrinkets(books).map((item) =>
          item.type === "trinket" ? (
            <li key={item.key} className="trinket-cell">
              <Trinket kind={item.kind} label={item.label} />
            </li>
          ) : (
            <li key={item.book.id}>
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
