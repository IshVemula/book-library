import Link from "next/link";
import { redirect } from "next/navigation";
import { BookForm, type Fields } from "@/components/BookForm";
import { isAdmin } from "@/lib/auth";
import { isStatus, listGenres, listSeries } from "@/lib/books";

export const metadata = { title: "Add a book" };

type Params = { series?: string; series_number?: string; author?: string; status?: string };

export default async function NewBookPage({ searchParams }: { searchParams: Promise<Params> }) {
  if (!(await isAdmin())) redirect("/login");
  const params = await searchParams;
  const [genres, series] = await Promise.all([listGenres(), listSeries()]);

  // Prefill from links like "Up next: Mistborn #4 → Add it".
  const initial: Partial<Fields> = {};
  if (params.series) initial.series = params.series;
  if (params.series_number) initial.series_number = params.series_number;
  if (params.author) initial.author = params.author;
  if (isStatus(params.status)) initial.status = params.status;

  return (
    <section className="form-page">
      <h1>Add a book</h1>
      <p className="muted form-page-hint">
        Moving from Goodreads? <Link href="/import">Import your whole library</Link> instead.
      </p>
      <BookForm initial={initial} genres={genres} series={series} />
    </section>
  );
}
