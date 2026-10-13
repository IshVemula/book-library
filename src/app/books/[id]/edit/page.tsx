import { notFound, redirect } from "next/navigation";
import { BookForm } from "@/components/BookForm";
import { isAdmin } from "@/lib/auth";
import { getBook, listGenres, listSeries } from "@/lib/books";

export const metadata = { title: "Edit book" };

export default async function EditBookPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) redirect("/login");
  const book = await getBook(Number((await params).id));
  if (!book) notFound();
  const [genres, series] = await Promise.all([listGenres(), listSeries()]);

  return (
    <section className="form-page">
      <h1>Edit book</h1>
      <BookForm book={book} genres={genres} series={series} />
    </section>
  );
}
