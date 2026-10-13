import type { Book } from "@/lib/books";

function hue(s: string) {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h % 360;
}

// A generated "cloth cover" with the title, overlaid by the real cover from
// Open Library when an ISBN is known (Open Library returns a transparent
// pixel when it has no cover, so the generated one shows through).
export function Cover({ book, large = false }: { book: Pick<Book, "title" | "author" | "isbn">; large?: boolean }) {
  return (
    <div
      className={large ? "cover cover-large" : "cover"}
      style={{ "--hue": hue(book.title) } as React.CSSProperties}
    >
      <span className="cover-title">{book.title}</span>
      <span className="cover-author">{book.author}</span>
      {book.isbn && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`https://covers.openlibrary.org/b/isbn/${book.isbn}-${large ? "L" : "M"}.jpg`}
          alt=""
          loading="lazy"
        />
      )}
    </div>
  );
}
