import { isAdmin } from "@/lib/auth";
import { guessGenre, pickIsbn, type LookupResult } from "@/lib/openlibrary";

type Doc = {
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  isbn?: string[];
  subject?: string[];
  cover_i?: number;
};

// Owner-only proxy to Open Library search, used to auto-fill the book form.
// GET /api/lookup?q=<title, author or ISBN>
export async function GET(request: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const q = (new URL(request.url).searchParams.get("q") ?? "").trim();
  if (q.length < 2) return Response.json([]);

  const digits = q.replace(/[-\s]/g, "").toUpperCase();
  const isIsbn = /^(\d{9}[\dX]|\d{13})$/.test(digits);

  const url = new URL("https://openlibrary.org/search.json");
  url.searchParams.set(isIsbn ? "isbn" : "q", isIsbn ? digits : q);
  url.searchParams.set("limit", "8");
  url.searchParams.set("fields", "title,author_name,first_publish_year,isbn,subject,cover_i");

  const res = await fetch(url, {
    headers: { "User-Agent": "book-library (personal reading log)" },
    next: { revalidate: 60 * 60 * 24 },
  });
  if (!res.ok) return Response.json({ error: "Open Library lookup failed" }, { status: 502 });

  const { docs } = (await res.json()) as { docs: Doc[] };
  const results: LookupResult[] = docs.map((d) => ({
    title: d.title,
    author: d.author_name?.[0] ?? null,
    year: d.first_publish_year ?? null,
    isbn: isIsbn ? digits : pickIsbn(d.isbn),
    cover_url: d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-L.jpg` : null,
    genre: guessGenre(d.subject ?? []),
  }));
  return Response.json(results);
}
