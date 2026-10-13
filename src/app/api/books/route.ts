import { hidePrivate, isSort, listBooks } from "@/lib/books";

export const dynamic = "force-dynamic";

// Public read-only JSON API: GET /api/books?q=&genre=&sort=added|title|author|rating
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const sort = params.get("sort") ?? "added";
  const books = await listBooks({
    q: params.get("q") ?? "",
    genre: params.get("genre") ?? "",
    sort: isSort(sort) ? sort : "added",
  });
  return Response.json(books.map(hidePrivate));
}
