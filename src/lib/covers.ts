// Cover search across Open Library and Google Books (server-side only).

export type CoverCandidate = {
  source: "Open Library" | "Google Books";
  url: string; // large image, stored as the book's cover
  thumb: string; // smaller image for pickers
  isbn: string | null;
  publisher: string | null;
  year: number | null;
  format: string | null;
};

type Identity = { title: string; author: string; isbn?: string | null };

const DAY = 60 * 60 * 24;
const UA = { "User-Agent": "book-library (personal reading log)" };

// Open Library responses are cached for a day. Google's aren't, so a rate-limit
// error is never cached as "no results".
async function getJson<T>(url: string, { cache = true } = {}): Promise<T | null> {
  try {
    const res = await fetch(url, {
      headers: UA,
      ...(cache ? { next: { revalidate: DAY } } : { cache: "no-store" as const }),
      signal: AbortSignal.timeout(8000),
    });
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null;
  }
}

const yearOf = (date?: string) => {
  const match = date?.match(/\d{4}/);
  return match ? Number(match[0]) : null;
};

// "The Lightning Thief: Percy Jackson…" → "lightningthief"
export const normalizeTitle = (title: string) =>
  title.toLowerCase().split(/[:(]/)[0].replace(/^the\s+/, "").replace(/[^a-z0-9]/g, "");

// ---- Open Library ----

type OLEdition = {
  title?: string;
  covers?: number[];
  isbn_13?: string[];
  isbn_10?: string[];
  publishers?: string[];
  publish_date?: string;
  physical_format?: string;
  languages?: { key: string }[];
};

const olCover = (id: number, size: "M" | "L") => `https://covers.openlibrary.org/b/id/${id}-${size}.jpg`;

async function openLibraryEditions({ title, author }: Identity): Promise<CoverCandidate[]> {
  const want = normalizeTitle(title);
  const search = await getJson<{ docs: { key: string }[] }>(
    `https://openlibrary.org/search.json?${new URLSearchParams({ title, author, fields: "key", limit: "1" })}`,
  );
  const work = search?.docs[0]?.key;
  if (!work) return [];
  const data = await getJson<{ entries: OLEdition[] }>(`https://openlibrary.org${work}/editions.json?limit=100`);
  return (data?.entries ?? []).flatMap((e): CoverCandidate[] => {
    const id = e.covers?.find((c) => c > 0);
    // Many editions don't record a language, so also require the English title
    // (this drops translations like "El ladrón del rayo").
    const english = !e.languages?.length || e.languages.some((l) => l.key === "/languages/eng");
    const sameTitle = !e.title || normalizeTitle(e.title).includes(want);
    if (!id || !english || !sameTitle || /audio|cd|cassette|mp3/i.test(e.physical_format ?? "")) return [];
    return [
      {
        source: "Open Library",
        url: olCover(id, "L"),
        thumb: olCover(id, "M"),
        isbn: e.isbn_13?.[0] ?? e.isbn_10?.[0] ?? null,
        publisher: e.publishers?.[0] ?? null,
        year: yearOf(e.publish_date),
        format: e.physical_format ?? null,
      },
    ];
  });
}

async function openLibraryHasCover(isbn: string) {
  try {
    const res = await fetch(`https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg?default=false`, {
      method: "HEAD",
      headers: UA,
      signal: AbortSignal.timeout(6000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ---- Google Books ----

type GVolume = {
  volumeInfo: {
    title: string;
    publisher?: string;
    publishedDate?: string;
    printType?: string;
    industryIdentifiers?: { type: string; identifier: string }[];
    imageLinks?: Record<string, string>;
  };
};

const googleKey = () => (process.env.GOOGLE_BOOKS_API_KEY ? `&key=${process.env.GOOGLE_BOOKS_API_KEY}` : "");

// Google's default thumbnails are tiny; `fife` asks for a bigger rendition.
function googleImages(links?: Record<string, string>) {
  const raw = links?.extraLarge ?? links?.large ?? links?.medium ?? links?.thumbnail ?? links?.smallThumbnail;
  if (!raw) return null;
  const thumb = new URL(raw.replace(/^http:/, "https:"));
  thumb.searchParams.delete("edge");
  const large = new URL(thumb);
  large.searchParams.set("fife", "w800-h1200");
  return { url: large.toString(), thumb: thumb.toString() };
}

function fromGoogle(v: GVolume): CoverCandidate | null {
  const images = googleImages(v.volumeInfo.imageLinks);
  if (!images) return null;
  const ids = v.volumeInfo.industryIdentifiers ?? [];
  return {
    source: "Google Books",
    ...images,
    isbn: ids.find((i) => i.type === "ISBN_13")?.identifier ?? ids.find((i) => i.type === "ISBN_10")?.identifier ?? null,
    publisher: v.volumeInfo.publisher ?? null,
    year: yearOf(v.volumeInfo.publishedDate),
    format: null,
  };
}

async function googleEditions({ title, author }: Identity): Promise<CoverCandidate[]> {
  const q = `intitle:"${title}" inauthor:"${author}"`;
  const data = await getJson<{ items?: GVolume[] }>(
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=40&printType=books&langRestrict=en${googleKey()}`,
    { cache: false },
  );
  const want = normalizeTitle(title);
  return (data?.items ?? [])
    .filter((v) => normalizeTitle(v.volumeInfo.title) === want) // skip box sets, study guides…
    .map(fromGoogle)
    .filter((c): c is CoverCandidate => c !== null);
}

async function googleByIsbn(isbn: string) {
  const data = await getJson<{ items?: GVolume[] }>(
    `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}${googleKey()}`,
    { cache: false },
  );
  return data?.items?.map(fromGoogle).find(Boolean) ?? null;
}

// ---- Public helpers ----

// Every edition cover we can find for a book, from both sources.
export async function coverCandidates(book: Identity) {
  const [ol, google] = await Promise.all([openLibraryEditions(book), googleEditions(book)]);
  const seen = new Set<string>();
  return [...ol, ...google].filter((c) => !seen.has(c.url) && seen.add(c.url));
}

// Best single cover for a book with none: its own ISBN on Open Library, then
// on Google Books, then a title/author search on both.
export async function findCover(book: Identity): Promise<CoverCandidate | null> {
  if (book.isbn) {
    if (await openLibraryHasCover(book.isbn)) {
      return {
        source: "Open Library",
        url: `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg`,
        thumb: `https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg`,
        isbn: book.isbn,
        publisher: null,
        year: null,
        format: null,
      };
    }
    const google = await googleByIsbn(book.isbn);
    if (google) return { ...google, isbn: book.isbn };
  }
  const [google, ol] = await Promise.all([googleEditions(book), openLibraryEditions(book)]);
  return google[0] ?? ol[0] ?? null;
}

// ---- Matching sets for a series ----

export type CoverSet = {
  key: string;
  label: string;
  sources: string[];
  picks: Record<number, CoverCandidate>; // bookId → cover
};

const PUBLISHER_NOISE =
  /\b(inc|llc|ltd|limited|co|company|corp|books?|publishing|publishers?|group|imprint|press|usa|us|uk|children'?s|young readers|an imprint of|a division of|the)\b/g;

export const publisherKey = (publisher: string | null) =>
  publisher?.toLowerCase().replace(/&/g, " and ").replace(PUBLISHER_NOISE, " ").replace(/[^a-z]/g, "") || null;

// Group editions by publisher (which usually means one cover design), then
// pick one cover per book from each group: the edition closest in year to the
// rest of the group, so reissues with new artwork don't get mixed in.
export function coverSets(bookIds: number[], candidates: Record<number, CoverCandidate[]>): CoverSet[] {
  const groups = new Map<string, { label: string; byBook: Map<number, CoverCandidate[]> }>();
  for (const id of bookIds) {
    for (const c of candidates[id] ?? []) {
      const key = publisherKey(c.publisher);
      if (!key) continue;
      const group = groups.get(key) ?? { label: c.publisher!, byBook: new Map() };
      group.byBook.set(id, [...(group.byBook.get(id) ?? []), c]);
      groups.set(key, group);
    }
  }

  const sets = [...groups.entries()].map(([key, { label, byBook }]) => {
    const years = [...byBook.values()].flat().map((c) => c.year).filter((y): y is number => y !== null).sort((a, b) => a - b);
    const median = years[Math.floor(years.length / 2)] ?? null;
    const picks: Record<number, CoverCandidate> = {};
    for (const [id, options] of byBook) {
      picks[id] = [...options].sort(
        (a, b) => Math.abs((a.year ?? median ?? 0) - (median ?? 0)) - Math.abs((b.year ?? median ?? 0) - (median ?? 0)),
      )[0];
    }
    const sources = [...new Set(Object.values(picks).map((p) => p.source))];
    return { key, label, sources, picks };
  });

  // Audiobook and large-print publishers rank last: their art is often cropped or square.
  const niche = (s: CoverSet) => (/audio|listening|recorded|thorndike|large print|braille/i.test(s.label) ? 1 : 0);
  const need = Math.min(2, bookIds.length);
  return sets
    .filter((s) => Object.keys(s.picks).length >= need)
    .sort((a, b) => Object.keys(b.picks).length - Object.keys(a.picks).length || niche(a) - niche(b))
    .slice(0, 8);
}
