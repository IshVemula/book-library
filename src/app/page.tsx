import { cookies } from "next/headers";
import Link from "next/link";
import { BookList } from "@/components/BookList";
import { Shelf } from "@/components/Shelf";
import { SpineShelf } from "@/components/SpineShelf";
import { Toolbar, type View } from "@/components/Toolbar";
import { UpNext } from "@/components/UpNext";
import { isAdmin } from "@/lib/auth";
import { getStats, hidePrivate, isSort, isStatus, listBooks, listFinishedSeries, STATUSES, type Status } from "@/lib/books";
import { groupBooks, isGroupBy } from "@/lib/group";
import { upNext } from "@/lib/upnext";

export const dynamic = "force-dynamic";

type Params = { q?: string; genre?: string; status?: string; group?: string; sort?: string; view?: string };

const VIEWS: View[] = ["shelf", "spines", "list"];

export default async function Home({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const prefs = await cookies();

  const q = params.q ?? "";
  const genre = params.genre ?? "";
  const status = isStatus(params.status) ? params.status : "";
  const sort = isSort(params.sort) ? params.sort : "added";
  const groupParam = params.group ?? prefs.get("group")?.value;
  const group = isGroupBy(groupParam) ? groupParam : "status";
  const viewParam = (params.view ?? prefs.get("view")?.value) as View;
  const view = VIEWS.includes(viewParam) ? viewParam : "shelf";

  const [rawBooks, stats, admin, finishedSeries] = await Promise.all([
    listBooks({ q, genre, sort }),
    getStats(),
    isAdmin(),
    listFinishedSeries(),
  ]);
  const all = admin ? rawBooks : rawBooks.map(hidePrivate);

  const counts = Object.fromEntries([
    ["all", all.length],
    ...(Object.keys(STATUSES) as Status[]).map((s) => [s, all.filter((b) => b.status === s).length]),
  ]) as Record<Status | "all", number>;
  const books = status ? all.filter((b) => b.status === status) : all;
  const groups = groupBooks(books, group);
  const libraryEmpty = stats.authors === 0;
  const unfiltered = !q && !genre && !status;
  const lentOut = admin && unfiltered ? all.filter((b) => b.lent_to) : [];

  return (
    <>
      <section className="intro">
        <div>
          <p className="eyebrow">A highly biased record of</p>
          <h1>Every book I&rsquo;ve devoured</h1>
        </div>
        {!libraryEmpty && (
          <dl className="stats">
            <div>
              <dt>Books devoured</dt>
              <dd>{stats.read}</dd>
            </div>
            <div>
              <dt>Authors adored</dt>
              <dd>{stats.authors}</dd>
            </div>
            <div>
              <dt>Average swoon</dt>
              <dd>{stats.avgRating ?? "—"}</dd>
            </div>
          </dl>
        )}
      </section>

      {unfiltered && <UpNext items={upNext(all, finishedSeries)} admin={admin} />}

      {lentOut.length > 0 && (
        <p className="on-loan">
          <span aria-hidden>📖</span> Held hostage by friends:{" "}
          {lentOut.map((b, i) => (
            <span key={b.id}>
              {i > 0 && ", "}
              <Link href={`/books/${b.id}`}>{b.title}</Link> → {b.lent_to}
            </span>
          ))}
        </p>
      )}

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
          <p className="empty-title">Suspiciously empty shelves</p>
          <p>Every great library starts with one book. Or one Goodreads export.</p>
          {admin && (
            <div className="form-actions">
              <Link href="/books/new" className="button primary">
                Shelve your first book
              </Link>
              <Link href="/import" className="button">
                Smuggle them in from Goodreads
              </Link>
            </div>
          )}
        </div>
      ) : books.length === 0 ? (
        <div className="empty">
          <p>Nothing here. Not even a bookmark.</p>
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
            {view === "shelf" ? (
              <Shelf books={g.books} />
            ) : view === "spines" ? (
              <SpineShelf books={g.books} />
            ) : (
              <BookList books={g.books} />
            )}
          </section>
        ))
      )}
    </>
  );
}
