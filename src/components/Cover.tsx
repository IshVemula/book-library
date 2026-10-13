import { swatchStyle } from "@/lib/palette";
import type { Book } from "@/lib/types";

type CoverBook = Pick<Book, "title" | "author" | "isbn" | "cover_url"> & {
  status?: Book["status"];
  series?: string | null;
};

function imageUrl(book: CoverBook, size: "M" | "L") {
  if (book.cover_url) return book.cover_url;
  if (book.isbn) return `https://covers.openlibrary.org/b/isbn/${book.isbn}-${size}.jpg`;
  return null;
}

// Little labels shown on a cover: DNF, reread count, lent out.
export function bookTags(book: Pick<Book, "status" | "rereads" | "lent_to">) {
  return [
    book.status === "dnf" && "DNF",
    book.rereads > 0 && `Read ${book.rereads + 1}×`,
    book.lent_to && "Lent",
  ].filter((t): t is string => Boolean(t));
}

// A generated cloth cover (same colours as the book's spine, shared across a
// series) with the title, overlaid by the real cover image when there is one. Open Library returns a transparent pixel for ISBNs it has
// no cover for, so the generated cover shows through.
export function Cover({
  book,
  size = "medium",
  tags = [],
}: {
  book: CoverBook;
  size?: "small" | "medium" | "large";
  tags?: string[];
}) {
  // Open Library's "S" covers are too low-res even for thumbnails on hi-dpi screens.
  const src = imageUrl(book, size === "large" ? "L" : "M");

  return (
    <div className={`cover cover-${size}`} style={swatchStyle(book)}>
      <span className="cover-title">{book.title}</span>
      <span className="cover-author">{book.author}</span>
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" loading="lazy" />
      )}
      {book.status === "reading" && <span className="ribbon" title="Currently reading" />}
      {tags.length > 0 && size !== "small" && (
        <span className="cover-tags">
          {tags.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </span>
      )}
    </div>
  );
}
