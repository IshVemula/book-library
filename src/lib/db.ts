type Row = Record<string, unknown>;
type Query = (text: string, params?: unknown[]) => Promise<Row[]>;

// Append-only: never edit or reorder existing entries. Each runs once per
// database (tracked in schema_migrations), but keep them idempotent anyway in
// case two cold starts race. One statement per entry (the Neon HTTP driver
// can't run several in one query).
const MIGRATIONS = [
  `CREATE TABLE IF NOT EXISTS books (
    id          SERIAL PRIMARY KEY,
    title       TEXT NOT NULL,
    author      TEXT NOT NULL,
    genre       TEXT,
    finished_on DATE,
    rating      SMALLINT CHECK (rating BETWEEN 1 AND 5),
    isbn        TEXT,
    notes       TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `ALTER TABLE books ADD COLUMN IF NOT EXISTS series TEXT`,
  `ALTER TABLE books ADD COLUMN IF NOT EXISTS series_number REAL`,
  `ALTER TABLE books ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'read'`,
  `ALTER TABLE books ADD COLUMN IF NOT EXISTS cover_url TEXT`,
  `ALTER TABLE books ADD COLUMN IF NOT EXISTS dnf_progress TEXT`,
  `ALTER TABLE books ADD COLUMN IF NOT EXISTS lent_to TEXT`,
  `ALTER TABLE books ADD COLUMN IF NOT EXISTS lent_at TIMESTAMPTZ`,
  `ALTER TABLE books ADD COLUMN IF NOT EXISTS goodreads_id TEXT`,
  `CREATE TABLE IF NOT EXISTS rereads (
    id         SERIAL PRIMARY KEY,
    book_id    INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    rating     SMALLINT CHECK (rating BETWEEN 1 AND 5),
    notes      TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS rereads_book_id ON rereads (book_id)`,
  `CREATE TABLE IF NOT EXISTS finished_series (name TEXT PRIMARY KEY)`,
  `CREATE TABLE IF NOT EXISTS cover_images (
    book_id    INTEGER PRIMARY KEY REFERENCES books(id) ON DELETE CASCADE,
    mime       TEXT NOT NULL,
    data       TEXT NOT NULL, -- base64; stored as text so both drivers return it the same way
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
];

// Cache the connection across hot reloads in dev and across requests in prod.
const cache = globalThis as unknown as { bookDb?: Promise<Query> };

async function migrate(query: Query) {
  await query(`CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY)`);
  const [{ version }] = await query(`SELECT coalesce(max(version), 0)::int AS version FROM schema_migrations`);
  for (let i = Number(version); i < MIGRATIONS.length; i++) {
    await query(MIGRATIONS[i]);
    await query(`INSERT INTO schema_migrations (version) VALUES ($1) ON CONFLICT DO NOTHING`, [i + 1]);
  }
}

async function connect(): Promise<Query> {
  let query: Query;
  const url = process.env.DATABASE_URL;

  if (url) {
    const { neon } = await import("@neondatabase/serverless");
    const sql = neon(url);
    query = (text, params = []) => sql.query(text, params) as Promise<Row[]>;
  } else {
    if (process.env.NODE_ENV === "production") {
      throw new Error("DATABASE_URL is not set");
    }
    // Local development: an embedded Postgres stored in ./.pglite
    const { PGlite } = await import("@electric-sql/pglite");
    const db = new PGlite(process.env.PGLITE_PATH ?? "./.pglite");
    query = async (text, params = []) => (await db.query<Row>(text, params)).rows;
  }

  await migrate(query);
  return query;
}

export async function sql<T = Row>(text: string, params: unknown[] = []): Promise<T[]> {
  cache.bookDb ??= connect().catch((err) => {
    cache.bookDb = undefined;
    throw err;
  });
  const query = await cache.bookDb;
  return (await query(text, params)) as T[];
}
