import { ArrowRight, BookPlus, FileUp, CodeXml, Library, Rocket } from "lucide-react";
import Link from "next/link";
import { Cover } from "@/components/Cover";
import { Stars } from "@/components/Stars";
import { isAdmin } from "@/lib/auth";
import { hidePrivate, listBooks, type Book } from "@/lib/books";
import { spineShape, swatchFor } from "@/lib/palette";
import { DEPLOY_URL, REPO_URL } from "@/lib/site";
import { seriesLabel } from "@/lib/types";

export const dynamic = "force-dynamic";

function CoverRow({ books }: { books: Book[] }) {
  return (
    <ul className="cover-row">
      {books.map((book) => (
        <li key={book.id}>
          <Link href={`/books/${book.id}`} className="cover-card">
            <Cover book={book} />
            <span className="cover-card-title">{book.title}</span>
            <span className="cover-card-sub">{seriesLabel(book) ?? book.author}</span>
            {book.rating ? <Stars rating={book.rating} /> : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}

// A row of the latest spines that slide onto a little shelf in the hero.
function HeroShelf({ books }: { books: Book[] }) {
  return (
    <div className="bookcase spines hero-case" aria-hidden>
      <ul className="shelf spine-row">
        {books.map((book, i) => {
          const { cloth, ink, foil } = swatchFor(book);
          const { width, height, style } = spineShape(book);
          return (
            <li key={book.id} className="hero-spine" style={{ animationDelay: `${i * 0.05}s` }}>
              <Link
                href={`/books/${book.id}`}
                tabIndex={-1}
                className={`spine spine-style-${style}`}
                style={{ "--cloth": cloth, "--ink": ink, "--foil": foil, width, height } as React.CSSProperties}
              >
                <span className="spine-title">{book.title}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const GENRE_COLORS = ["#8a3b2e", "#c58b1c", "#3a6f53", "#4b6a8f", "#94506a", "#6a4a8a", "#9a6a3e"];

export default async function Landing() {
  const [raw, admin] = await Promise.all([listBooks({ sort: "added" }), isAdmin()]);
  const books = raw.map(hidePrivate);

  const read = books.filter((b) => b.status === "read");
  const reading = books.filter((b) => b.status === "reading");
  const favourites = read.filter((b) => b.rating === 5);
  const rated = read.filter((b) => b.rating);
  const avg = rated.length ? rated.reduce((s, b) => s + b.rating!, 0) / rated.length : null;
  const authors = new Set(books.map((b) => b.author.toLowerCase())).size;
  const series = new Set(read.filter((b) => b.series).map((b) => b.series)).size;

  const genreCounts = new Map<string, number>();
  for (const b of read) if (b.genre) genreCounts.set(b.genre, (genreCounts.get(b.genre) ?? 0) + 1);
  const genres = [...genreCounts.entries()].sort((a, b) => b[1] - a[1]);
  const topGenres = genres.slice(0, 6);
  const otherCount = genres.slice(6).reduce((s, [, n]) => s + n, 0);
  if (otherCount) topGenres.push(["Everything else", otherCount]);
  const genreTotal = topGenres.reduce((s, [, n]) => s + n, 0);

  return (
    <div className="landing">
      <section className="hero">
        <div className="hero-text">
          <p className="eyebrow">A highly biased record of</p>
          <h1>Every book I&rsquo;ve devoured</h1>
          <p className="hero-lede">
            Books, series and stray thoughts, kept on shelves of my own. Have a browse; mind the dust jackets.
          </p>
          <div className="form-actions">
            <Link href="/shelf" className="button primary">
              <Library aria-hidden /> Browse the shelves
            </Link>
            {reading.length > 0 && (
              <a href="#nightstand" className="button ghost">
                What I&rsquo;m reading now
              </a>
            )}
          </div>
        </div>
        {books.length > 0 && <HeroShelf books={read.slice(0, 18)} />}
      </section>

      {books.length === 0 ? (
        <div className="empty">
          <p className="empty-title">Suspiciously empty shelves</p>
          <p>Every great library starts with one book. Or one Goodreads export.</p>
          {admin && (
            <div className="form-actions">
              <Link href="/books/new" className="button primary">
                <BookPlus aria-hidden /> Shelve your first book
              </Link>
              <Link href="/import" className="button">
                <FileUp aria-hidden /> Smuggle them in from Goodreads
              </Link>
            </div>
          )}
        </div>
      ) : (
        <>
          <dl className="landing-stats">
            <div>
              <dt>Books devoured</dt>
              <dd>{read.length}</dd>
            </div>
            <div>
              <dt>Authors adored</dt>
              <dd>{authors}</dd>
            </div>
            <div>
              <dt>Series binged</dt>
              <dd>{series}</dd>
            </div>
            <div>
              <dt>Average swoon</dt>
              <dd>{avg ? avg.toFixed(1) : "—"}</dd>
            </div>
          </dl>

          {reading.length > 0 && (
            <section id="nightstand" className="landing-section">
              <h2>On the nightstand</h2>
              <CoverRow books={reading.slice(0, 6)} />
            </section>
          )}

          {read.length > 0 && (
            <section className="landing-section">
              <div className="section-head">
                <h2>Recently devoured</h2>
                <Link href="/shelf?status=read" className="section-link">
                  All of them <ArrowRight className="inline-icon" aria-hidden />
                </Link>
              </div>
              <CoverRow books={read.slice(0, 6)} />
            </section>
          )}

          {favourites.length > 0 && (
            <section className="landing-section">
              <div className="section-head">
                <h2>Swoon-worthy</h2>
                <Link href="/shelf?status=read&sort=rating" className="section-link">
                  Top rated <ArrowRight className="inline-icon" aria-hidden />
                </Link>
              </div>
              <CoverRow books={favourites.slice(0, 6)} />
            </section>
          )}

          {genreTotal > 0 && (
            <section className="landing-section">
              <h2>What I reach for</h2>
              <div className="genre-bar" role="img" aria-label={topGenres.map(([g, n]) => `${g}: ${n}`).join(", ")}>
                {topGenres.map(([genre, n], i) => (
                  <span
                    key={genre}
                    style={{ flexGrow: n, background: GENRE_COLORS[i % GENRE_COLORS.length] }}
                    title={`${genre}: ${n}`}
                  />
                ))}
              </div>
              <ul className="genre-legend">
                {topGenres.map(([genre, n], i) => (
                  <li key={genre}>
                    <span className="swatch" style={{ background: GENRE_COLORS[i % GENRE_COLORS.length] }} />
                    {genre === "Everything else" ? (
                      genre
                    ) : (
                      <Link href={`/shelf?genre=${encodeURIComponent(genre)}`}>{genre}</Link>
                    )}{" "}
                    <span className="muted">{Math.round((n / genreTotal) * 100)}%</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      <section className="landing-cta">
        <div>
          <h2>Want a shelf like this?</h2>
          <p className="muted">
            Shelf Indulgence is free and open source. Get your own copy in about three minutes, with no coding: import
            your Goodreads history, and it&rsquo;s yours to fill.
          </p>
        </div>
        <div className="form-actions">
          <a href={DEPLOY_URL} className="button primary" target="_blank" rel="noreferrer">
            <Rocket aria-hidden /> Get your own shelf
          </a>
          <a href={REPO_URL} className="button" target="_blank" rel="noreferrer">
            <CodeXml aria-hidden /> See the code
          </a>
        </div>
      </section>
    </div>
  );
}
