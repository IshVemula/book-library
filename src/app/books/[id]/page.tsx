import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { lendBook, logReread, removeReread, returnBook, setStatus } from "@/app/actions";
import { bookTags, Cover } from "@/components/Cover";
import { DeleteButton } from "@/components/DeleteButton";
import { Stars } from "@/components/Stars";
import { StatusBadge } from "@/components/StatusBadge";
import { isAdmin } from "@/lib/auth";
import { getBook, hidePrivate, listRereads, STATUSES } from "@/lib/books";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const book = await getBook(Number((await params).id));
  return { title: book?.title ?? "Lost in the stacks" };
}

const ORDINALS = ["1st", "2nd", "3rd"];
const ordinal = (n: number) => ORDINALS[n - 1] ?? `${n}th`;

function timeAgo(ms: number) {
  const days = Math.round((Date.now() - ms) / 86_400_000);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (days < 7) return rtf.format(-days, "day");
  if (days < 60) return rtf.format(-Math.round(days / 7), "week");
  if (days < 365) return rtf.format(-Math.round(days / 30), "month");
  return rtf.format(-Math.round(days / 365), "year");
}

export default async function BookPage({ params }: Props) {
  const id = Number((await params).id);
  const [found, rereads, admin] = await Promise.all([getBook(id), listRereads(id), isAdmin()]);
  if (!found) notFound();
  const book = admin ? found : hidePrivate(found);
  const showHistory = rereads.length > 0 || (admin && book.status === "read");

  return (
    <article className="detail">
      <Link href="/" className="back">
        ← Back to the stacks
      </Link>
      <div className="detail-layout">
        <Cover book={book} size="large" tags={bookTags(book)} />
        <div>
          {book.series && (
            <p className="eyebrow">
              <Link href={`/?group=series&q=${encodeURIComponent(book.series)}`}>
                {book.series}
                {book.series_number ? ` · Book ${book.series_number}` : ""}
              </Link>
            </p>
          )}
          <h1>{book.title}</h1>
          <p className="detail-author">
            by <Link href={`/?group=author&q=${encodeURIComponent(book.author)}`}>{book.author}</Link>
          </p>

          {admin ? (
            <form className="segmented status-switch" aria-label="Reading status">
              {Object.entries(STATUSES).map(([value, label]) => (
                <button
                  key={value}
                  type="submit"
                  formAction={setStatus.bind(null, book.id, value)}
                  aria-pressed={book.status === value}
                >
                  {label}
                </button>
              ))}
            </form>
          ) : (
            <StatusBadge status={book.status} />
          )}

          {book.status === "dnf" && book.dnf_progress && (
            <p className="dnf-note">Stopped at {book.dnf_progress}</p>
          )}

          <dl className="facts">
            {book.genre && (
              <div>
                <dt>Genre</dt>
                <dd>
                  <Link href={`/?genre=${encodeURIComponent(book.genre)}`} className="chip">
                    {book.genre}
                  </Link>
                </dd>
              </div>
            )}
            {book.rating && (
              <div>
                <dt>Rating</dt>
                <dd>
                  <Stars rating={book.rating} />
                </dd>
              </div>
            )}
            {rereads.length > 0 && (
              <div>
                <dt>Times read</dt>
                <dd>{rereads.length + 1}</dd>
              </div>
            )}
            {book.isbn && (
              <div>
                <dt>ISBN</dt>
                <dd>{book.isbn}</dd>
              </div>
            )}
          </dl>

          {book.notes && <div className="notes">{book.notes}</div>}

          {admin && (
            <section className="panel lending" aria-label="Lending">
              {book.lent_to ? (
                <>
                  <p>
                    <span aria-hidden>📖</span> Held hostage by <strong>{book.lent_to}</strong>
                    {book.lent_at && <span className="muted"> · {timeAgo(book.lent_at)}</span>}
                  </p>
                  <form action={returnBook.bind(null, book.id)}>
                    <button type="submit" className="button">
                      It came home
                    </button>
                  </form>
                </>
              ) : (
                <form action={lendBook.bind(null, book.id)} className="inline-form">
                  <label className="sr-only" htmlFor="lent_to">
                    Lend to
                  </label>
                  <input id="lent_to" name="lent_to" placeholder="Lending it out? To whom, exactly…" required maxLength={80} />
                  <button type="submit" className="button">
                    Lend
                  </button>
                </form>
              )}
              <p className="panel-hint">Only you can see who&rsquo;s got your books.</p>
            </section>
          )}

          {showHistory && (
            <section className="panel history" aria-labelledby="history-title">
              <h2 id="history-title">Couldn&rsquo;t stay away</h2>
              <ol>
                <li>
                  <span className="history-n">1st read</span>
                  <Stars rating={book.rating} />
                </li>
                {rereads.map((r, i) => (
                  <li key={r.id}>
                    <span className="history-n">{ordinal(i + 2)} read</span>
                    <Stars rating={r.rating} />
                    {admin && (
                      <form action={removeReread.bind(null, book.id, r.id)} className="history-remove">
                        <button type="submit" className="link-button">
                          Remove
                        </button>
                      </form>
                    )}
                    {r.notes && <p className="history-notes">{r.notes}</p>}
                  </li>
                ))}
              </ol>
              {admin && (
                <details className="log-reread" key={rereads.length}>
                  <summary>+ Read it again</summary>
                  <form action={logReread.bind(null, book.id)} className="reread-form">
                    <label className="field">
                      <span>Rating this time</span>
                      <select name="rating" defaultValue="">
                        <option value="">—</option>
                        {[5, 4, 3, 2, 1].map((n) => (
                          <option key={n} value={n}>
                            {"★".repeat(n)} ({n})
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="field">
                      <span>Notes on this read</span>
                      <textarea name="notes" rows={3} placeholder="What felt different this time?" />
                    </label>
                    <div>
                      <button type="submit" className="button primary">
                        Save reread
                      </button>
                    </div>
                  </form>
                </details>
              )}
            </section>
          )}

          {admin && (
            <div className="form-actions">
              <Link href={`/books/${book.id}/edit`} className="button">
                Edit
              </Link>
              <DeleteButton id={book.id} title={book.title} />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
