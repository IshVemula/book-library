import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { setStatus } from "@/app/actions";
import { Cover } from "@/components/Cover";
import { DeleteButton } from "@/components/DeleteButton";
import { Stars } from "@/components/Stars";
import { StatusBadge } from "@/components/StatusBadge";
import { isAdmin } from "@/lib/auth";
import { getBook, STATUSES } from "@/lib/books";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const book = await getBook(Number((await params).id));
  return { title: book?.title ?? "Not found" };
}

export default async function BookPage({ params }: Props) {
  const book = await getBook(Number((await params).id));
  if (!book) notFound();
  const admin = await isAdmin();

  return (
    <article className="detail">
      <Link href="/" className="back">
        ← Back to the shelves
      </Link>
      <div className="detail-layout">
        <Cover book={book} size="large" />
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
            {book.isbn && (
              <div>
                <dt>ISBN</dt>
                <dd>{book.isbn}</dd>
              </div>
            )}
          </dl>

          {book.notes && <div className="notes">{book.notes}</div>}

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
