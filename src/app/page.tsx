import Link from "next/link";
import { Cover } from "@/components/Cover";
import { Stars } from "@/components/Stars";
import { isAdmin } from "@/lib/auth";
import { getStats, isSort, listBooks, listGenres, SORTS } from "@/lib/books";

export const dynamic = "force-dynamic";

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; genre?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const q = params.q ?? "";
  const genre = params.genre ?? "";
  const sort = params.sort && isSort(params.sort) ? params.sort : "recent";

  const [books, genres, stats, admin] = await Promise.all([
    listBooks({ q, genre, sort }),
    listGenres(),
    getStats(),
    isAdmin(),
  ]);
  const filtered = q !== "" || genre !== "";

  return (
    <>
      <section className="intro">
        <h1>Books I&rsquo;ve read</h1>
        <dl className="stats">
          <div>
            <dt>Books</dt>
            <dd>{stats.total}</dd>
          </div>
          <div>
            <dt>This year</dt>
            <dd>{stats.thisYear}</dd>
          </div>
          <div>
            <dt>Avg rating</dt>
            <dd>{stats.avgRating ?? "—"}</dd>
          </div>
        </dl>
      </section>

      {stats.total > 0 && (
        <form className="filters" role="search">
          <input name="q" type="search" defaultValue={q} placeholder="Search title, author, notes…" aria-label="Search" />
          <select name="genre" defaultValue={genre} aria-label="Genre">
            <option value="">All genres</option>
            {genres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          <select name="sort" defaultValue={sort} aria-label="Sort by">
            {Object.entries(SORTS).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <button type="submit" className="button">
            Apply
          </button>
          {filtered && (
            <Link href="/" className="button ghost">
              Clear
            </Link>
          )}
        </form>
      )}

      {books.length === 0 ? (
        <div className="empty">
          {filtered ? (
            <p>No books match that search.</p>
          ) : (
            <>
              <p>No books yet.</p>
              {admin && (
                <Link href="/books/new" className="button primary">
                  Add your first book
                </Link>
              )}
            </>
          )}
        </div>
      ) : (
        <ul className="grid">
          {books.map((book) => (
            <li key={book.id}>
              <Link href={`/books/${book.id}`} className="card">
                <Cover book={book} />
                <div className="card-body">
                  <h2>{book.title}</h2>
                  <p className="author">{book.author}</p>
                  <div className="meta">
                    {book.genre && <span className="chip">{book.genre}</span>}
                    <Stars rating={book.rating} />
                  </div>
                  {book.finished_on && <p className="date">{formatDate(book.finished_on)}</p>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
