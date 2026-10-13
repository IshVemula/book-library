import { notFound, redirect } from "next/navigation";
import { SeriesCoverMatcher } from "@/components/SeriesCoverMatcher";
import { isAdmin } from "@/lib/auth";
import { listSeriesBooks } from "@/lib/books";
import { coverCandidates, coverSets } from "@/lib/covers";

export const metadata = { title: "Match covers" };

export default async function SeriesCoversPage({ searchParams }: { searchParams: Promise<{ name?: string }> }) {
  if (!(await isAdmin())) redirect("/login");
  const name = (await searchParams).name ?? "";
  const books = name ? await listSeriesBooks(name) : [];
  if (books.length === 0) notFound();

  const candidates = Object.fromEntries(
    await Promise.all(books.map(async (b) => [b.id, await coverCandidates(b)] as const)),
  );
  const sets = coverSets(
    books.map((b) => b.id),
    candidates,
  );

  return (
    <section className="form-page match-page">
      <p className="eyebrow">Matching covers</p>
      <h1>{name}</h1>
      <p className="muted form-page-hint">
        Editions from the same publisher usually share a cover design. Pick a matching set, or choose book by book.
      </p>
      <SeriesCoverMatcher series={name} books={books} sets={sets} candidates={candidates} />
    </section>
  );
}
