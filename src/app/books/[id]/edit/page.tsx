import { notFound, redirect } from "next/navigation";
import { BookForm } from "@/components/BookForm";
import { isAdmin } from "@/lib/auth";
import { getBook, listGenres } from "@/lib/books";

export const metadata = { title: "Edit book" };

export default async function EditBookPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) redirect("/login");
  const book = await getBook(Number((await params).id));
  if (!book) notFound();

  return (
    <section className="narrow">
      <h1>Edit book</h1>
      <BookForm book={book} genres={await listGenres()} />
    </section>
  );
}
