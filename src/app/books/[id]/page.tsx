import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Cover } from "@/components/Cover";
import { DeleteButton } from "@/components/DeleteButton";
import { Stars } from "@/components/Stars";
import { isAdmin } from "@/lib/auth";
import { getBook } from "@/lib/books";

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
        ← All books
      </Link>
      <div className="detail-layout">
        <Cover book={book} large />
        <div>
          <h1>{book.title}</h1>
          <p className="detail-author">by {book.author}</p>

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
            {book.finished_on && (
              <div>
                <dt>Finished</dt>
                <dd>
                  {new Date(`${book.finished_on}T00:00:00`).toLocaleDateString("en-US", { dateStyle: "long" })}
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
