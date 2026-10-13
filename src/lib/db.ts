type Row = Record<string, unknown>;
type Query = (text: string, params?: unknown[]) => Promise<Row[]>;

const SCHEMA = `
CREATE TABLE IF NOT EXISTS books (
  id          SERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  author      TEXT NOT NULL,
  genre       TEXT,
  finished_on DATE,
  rating      SMALLINT CHECK (rating BETWEEN 1 AND 5),
  isbn        TEXT,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
)`;

// Cache the connection across hot reloads in dev and across requests in prod.
const cache = globalThis as unknown as { bookDb?: Promise<Query> };

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
    const db = new PGlite("./.pglite");
    query = async (text, params = []) => (await db.query<Row>(text, params)).rows;
  }

  await query(SCHEMA);
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
