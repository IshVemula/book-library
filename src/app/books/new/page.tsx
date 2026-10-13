import { redirect } from "next/navigation";
import { BookForm } from "@/components/BookForm";
import { isAdmin } from "@/lib/auth";
import { listGenres, listSeries } from "@/lib/books";

export const metadata = { title: "Add a book" };

export default async function NewBookPage() {
  if (!(await isAdmin())) redirect("/login");
  const [genres, series] = await Promise.all([listGenres(), listSeries()]);

  return (
    <section className="form-page">
      <h1>Add a book</h1>
      <BookForm genres={genres} series={series} />
    </section>
  );
}
