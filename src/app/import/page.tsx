import { redirect } from "next/navigation";
import { ImportForm } from "@/components/ImportForm";
import { isAdmin } from "@/lib/auth";

export const metadata = { title: "The Great Goodreads Migration" };

export default async function ImportPage() {
  if (!(await isAdmin())) redirect("/login");

  return (
    <section className="form-page narrow-form">
      <h1>The Great Goodreads Migration</h1>
      <p className="muted form-page-hint">
        Pack up your whole Goodreads library (shelves, ratings, reviews, series, rereads) and move it in here.
      </p>
      <ImportForm />
    </section>
  );
}
