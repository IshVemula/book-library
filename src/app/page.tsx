import { cookies } from "next/headers";
import Link from "next/link";
import { BookList } from "@/components/BookList";
import { Shelf } from "@/components/Shelf";
import { Toolbar } from "@/components/Toolbar";
import { isAdmin } from "@/lib/auth";
import { getStats, isSort, isStatus, listBooks } from "@/lib/books";
import { groupBooks, isGroupBy } from "@/lib/group";

export const dynamic = "force-dynamic";

type Params = { q?: string; genre?: string; status?: string; group?: string; sort?: string; view?: string };

export default async function Home({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const prefs = await cookies();

  const q = params.q ?? "";
  const genre = params.genre ?? "";
  const status = isStatus(params.status) ? params.status : "";
  const sort = isSort(params.sort) ? params.sort : "added";
  const groupParam = params.group ?? prefs.get("group")?.value;
  const group = isGroupBy(groupParam) ? groupParam : "status";
  const view = (params.view ?? prefs.get("view")?.value) === "list" ? "list" : "shelf";

  const [all, stats, admin] = await Promise.all([listBooks({ q, genre, sort }), getStats(), isAdmin()]);

  const counts = {
    all: all.length,
    reading: all.filter((b) => b.status === "reading").length,
    read: all.filter((b) => b.status === "read").length,
    want: all.filter((b) => b.status === "want").length,
  };
  const books = status ? all.filter((b) => b.status === status) : all;
  const groups = groupBooks(books, group);
  const libraryEmpty = stats.authors === 0;

  return (
    <>
      <section className="intro">
        <div>
          <p className="eyebrow">A reading log</p>
          <h1>My Bookshelf</h1>
        </div>
        {!libraryEmpty && (
          <dl className="stats">
            <div>
              <dt>Books read</dt>
              <dd>{stats.read}</dd>
            </div>
            <div>
              <dt>Authors</dt>
              <dd>{stats.authors}</dd>
            </div>
            <div>
              <dt>Avg rating</dt>
              <dd>{stats.avgRating ?? "—"}</dd>
            </div>
          </dl>
        )}
      </section>

      {!libraryEmpty && <Toolbar q={q} status={status} group={group} sort={sort} view={view} counts={counts} />}

      {genre && (
        <p className="active-filter">
          Showing genre <strong>{genre}</strong>
          <Link href="/" className="chip chip-remove" aria-label="Clear genre filter">
            ✕ Clear
          </Link>
        </p>
      )}

      {libraryEmpty ? (
        <div className="empty">
          <p className="empty-title">The shelves are empty</p>
          <p>Books you add will show up here.</p>
          {admin && (
            <Link href="/books/new" className="button primary">
              Add your first book
            </Link>
          )}
        </div>
      ) : books.length === 0 ? (
        <div className="empty">
          <p>No books match.</p>
        </div>
      ) : (
        groups.map((g) => (
          <section key={g.key} className="group" aria-label={g.title ?? "All books"}>
            {g.title && (
              <header className="group-head">
                <h2>{g.title}</h2>
                <span className="count">
                  {g.books.length} {g.books.length === 1 ? "book" : "books"}
                </span>
              </header>
            )}
            {view === "shelf" ? <Shelf books={g.books} /> : <BookList books={g.books} />}
          </section>
        ))
      )}
    </>
  );
}
