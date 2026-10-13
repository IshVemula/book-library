import { getCoverImage } from "@/lib/books";

// Serves covers uploaded from the book form. URLs carry a ?v= version, so
// they can be cached forever.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const cover = await getCoverImage(Number((await params).id));
  if (!cover) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(Buffer.from(cover.data, "base64")), {
    headers: {
      "Content-Type": cover.mime,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
