import { redirect } from "next/navigation";
import { ImportForm } from "@/components/ImportForm";
import { isAdmin } from "@/lib/auth";

export const metadata = { title: "Import from Goodreads" };

export default async function ImportPage() {
  if (!(await isAdmin())) redirect("/login");

  return (
    <section className="form-page narrow-form">
      <h1>Import from Goodreads</h1>
      <p className="muted form-page-hint">
        Bring your whole Goodreads library over, including shelves, ratings, reviews, series and reread counts.
      </p>
      <ImportForm />
    </section>
  );
}
