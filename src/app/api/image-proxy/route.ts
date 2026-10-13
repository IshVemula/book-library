import { isAdmin } from "@/lib/auth";

const MAX_BYTES = 10 * 1024 * 1024;

// Hosts that should never be fetched from the server.
const PRIVATE_HOST = /^(localhost|.*\.local|.*\.internal|0\.0\.0\.0|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|\[?::1\]?|\[?f[cd][0-9a-f]{2}:)/i;

// Owner-only: fetches an image from a pasted link so the browser can resize it
// (most image hosts don't allow that directly). GET /api/image-proxy?url=...
export async function GET(request: Request) {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });

  let url: URL;
  try {
    url = new URL(new URL(request.url).searchParams.get("url") ?? "");
  } catch {
    return new Response("That isn't a valid link.", { status: 400 });
  }
  if (!/^https?:$/.test(url.protocol) || PRIVATE_HOST.test(url.hostname)) {
    return new Response("That link can't be used.", { status: 400 });
  }

  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (book-library cover fetch)", Accept: "image/*" },
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  }).catch(() => null);
  if (!res?.ok) return new Response("Couldn't download that image.", { status: 502 });

  const type = res.headers.get("content-type") ?? "";
  if (!type.startsWith("image/")) return new Response("That link isn't an image.", { status: 415 });
  if (Number(res.headers.get("content-length") ?? 0) > MAX_BYTES) {
    return new Response("That image is too large.", { status: 413 });
  }
  const body = await res.arrayBuffer();
  if (body.byteLength > MAX_BYTES) return new Response("That image is too large.", { status: 413 });

  return new Response(body, { headers: { "Content-Type": type, "Cache-Control": "no-store" } });
}
