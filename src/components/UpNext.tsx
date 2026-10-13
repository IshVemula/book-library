import Link from "next/link";
import { finishSeries } from "@/app/actions";
import type { UpNextItem } from "@/lib/upnext";
import { Cover } from "./Cover";

export function UpNext({ items, admin }: { items: UpNextItem[]; admin: boolean }) {
  // Visitors only see books already on the shelf, not "add this" placeholders.
  const visible = admin ? items : items.filter((i) => i.book);
  if (visible.length === 0) return null;

  return (
    <section className="up-next" aria-labelledby="up-next-title">
      <h2 id="up-next-title">Unfinished business</h2>
      <ul>
        {visible.map(({ series, number, author, book }) => (
          <li key={series}>
            {book ? (
              <Link href={`/books/${book.id}`} className="up-next-card">
                <Cover book={book} size="small" />
                <span className="up-next-text">
                  <span className="up-next-series">
                    {series} #{number}
                  </span>
                  <strong>{book.title}</strong>
                  <span className="muted">Waiting in your TBR pile</span>
                </span>
              </Link>
            ) : (
              <div className="up-next-card missing">
                <span className="cover-ghost">#{number}</span>
                <span className="up-next-text">
                  <span className="up-next-series">
                    {series} #{number}
                  </span>
                  <strong>Not acquired… yet</strong>
                  <span className="up-next-actions">
                    <Link
                      href={`/books/new?${new URLSearchParams({
                        series,
                        series_number: String(number),
                        author,
                        status: "want",
                      })}`}
                    >
                      Get it
                    </Link>
                    <form action={finishSeries.bind(null, series)}>
                      <button type="submit" className="link-button" title="Stop suggesting books from this series">
                        I&rsquo;m done here
                      </button>
                    </form>
                  </span>
                </span>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
