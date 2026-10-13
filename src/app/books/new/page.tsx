import { redirect } from "next/navigation";
import { BookForm } from "@/components/BookForm";
import { isAdmin } from "@/lib/auth";
import { listGenres } from "@/lib/books";

export const metadata = { title: "Add a book" };

export default async function NewBookPage() {
  if (!(await isAdmin())) redirect("/login");

  return (
    <section className="narrow">
      <h1>Add a book</h1>
      <BookForm genres={await listGenres()} />
    </section>
  );
}
