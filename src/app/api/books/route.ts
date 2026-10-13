import { isSort, listBooks } from "@/lib/books";

export const dynamic = "force-dynamic";

// Public read-only JSON API: GET /api/books?q=&genre=&sort=recent|title|author|rating
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const sort = params.get("sort") ?? "recent";
  const books = await listBooks({
    q: params.get("q") ?? "",
    genre: params.get("genre") ?? "",
    sort: isSort(sort) ? sort : "recent",
  });
  return Response.json(books);
}
