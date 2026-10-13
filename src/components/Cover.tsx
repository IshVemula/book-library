import type { Book } from "@/lib/books";

type CoverBook = Pick<Book, "title" | "author" | "isbn" | "cover_url"> & { status?: Book["status"] };

function hue(s: string) {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h % 360;
}

function imageUrl(book: CoverBook, size: "M" | "L") {
  if (book.cover_url) return book.cover_url;
  if (book.isbn) return `https://covers.openlibrary.org/b/isbn/${book.isbn}-${size}.jpg`;
  return null;
}

// A generated cloth cover with the title, overlaid by the real cover image
// when there is one. Open Library returns a transparent pixel for ISBNs it has
// no cover for, so the generated cover shows through.
export function Cover({ book, size = "medium" }: { book: CoverBook; size?: "small" | "medium" | "large" }) {
  // Open Library's "S" covers are too low-res even for thumbnails on hi-dpi screens.
  const src = imageUrl(book, size === "large" ? "L" : "M");

  return (
    <div className={`cover cover-${size}`} style={{ "--hue": hue(book.title) } as React.CSSProperties}>
      <span className="cover-title">{book.title}</span>
      <span className="cover-author">{book.author}</span>
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" loading="lazy" />
      )}
      {book.status === "reading" && <span className="ribbon" title="Currently reading" />}
    </div>
  );
}
