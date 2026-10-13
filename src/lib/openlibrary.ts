export type LookupResult = {
  title: string;
  author: string | null;
  year: number | null;
  isbn: string | null;
  cover_url: string | null;
  genre: string | null;
};

// Open Library subjects are free-form ("Fantasy fiction", "Middle Earth
// (Imaginary place)"); map them onto a short list of familiar genres.
// Earlier entries win, so specific genres come before broad ones.
const GENRE_KEYWORDS: [string, string][] = [
  ["science fiction", "Science Fiction"],
  ["sci-fi", "Science Fiction"],
  ["scifi", "Science Fiction"],
  ["fantasy", "Fantasy"],
  ["mystery", "Mystery"],
  ["detective", "Mystery"],
  ["thriller", "Thriller"],
  ["suspense", "Thriller"],
  ["horror", "Horror"],
  ["romance", "Romance"],
  ["love stories", "Romance"],
  ["historical fiction", "Historical Fiction"],
  ["young adult", "Young Adult"],
  ["graphic novel", "Graphic Novel"],
  ["comic", "Graphic Novel"],
  ["autobiography", "Memoir"],
  ["memoir", "Memoir"],
  ["biography", "Biography"],
  ["self-help", "Self-Help"],
  ["poetry", "Poetry"],
  ["philosophy", "Philosophy"],
  ["psychology", "Psychology"],
  ["business", "Business"],
  ["economics", "Business"],
  ["juvenile", "Children's"],
  ["classic", "Classics"],
  ["history", "History"],
  ["science", "Science"],
  ["non-fiction", "Nonfiction"],
  ["nonfiction", "Nonfiction"],
  ["fiction", "Fiction"],
];

export function guessGenre(subjects: string[]) {
  const lower = subjects.map((s) => s.toLowerCase());
  for (const [keyword, genre] of GENRE_KEYWORDS) {
    if (lower.some((s) => s.includes(keyword))) return genre;
  }
  return null;
}

export function pickIsbn(isbns: string[] = []) {
  return isbns.find((i) => /^97[89]\d{10}$/.test(i)) ?? isbns[0] ?? null;
}
