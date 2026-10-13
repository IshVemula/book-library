# My Library

A personal bookshelf: books on wooden shelves grouped by reading status, author, series or genre, with a list view, live search, and auto-fill from Open Library when adding a book.

Anyone can browse the library; only the owner (password login) can add, edit, or delete books.

**Stack:** Next.js 15 (App Router, Server Actions) · Postgres (Neon in production, embedded PGlite locally) · deployed on Vercel.

## Run locally

```bash
npm install
cp .env.example .env.local   # then set ADMIN_PASSWORD and SESSION_SECRET
npm run dev
```

Open http://localhost:3000. With no `DATABASE_URL`, data is stored in an embedded Postgres in `./.pglite` (git-ignored). The `books` table is created automatically on first request.

## Environment variables

| Name | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection string (Neon). Required in production. |
| `ADMIN_PASSWORD` | Password for the owner login. |
| `SESSION_SECRET` | Random string for signing the login cookie (`openssl rand -base64 32`). |

## Deploy (Vercel + Neon)

1. Push this repo to GitHub.
2. On [vercel.com](https://vercel.com), sign up with GitHub → **Add New → Project** → import the repo.
3. In the project, open **Storage → Create Database → Neon (Postgres)** and connect it. This sets `DATABASE_URL` automatically.
4. In **Settings → Environment Variables**, add `ADMIN_PASSWORD` and `SESSION_SECRET`.
5. **Deployments → Redeploy**. Every push to `main` deploys automatically after that.

## API

`GET /api/books?q=&genre=&sort=added|title|author|rating` returns the library as JSON.

## Structure

```
src/
  app/
    page.tsx              bookshelf / list view with grouping, status tabs, search, stats
    books/[id]/           book detail, edit page
    books/new/            add page
    login/                owner login
    api/books/route.ts    public JSON API
    api/lookup/route.ts   Open Library search proxy (owner only) for auto-fill
    actions.ts            server actions (save, delete, login, logout)
  components/             Shelf, BookList, Toolbar, Cover, BookForm, …
  lib/
    db.ts                 Postgres connection (Neon or PGlite) + schema
    books.ts              book queries
    group.ts              grouping by status / author / series / genre
    auth.ts               signed-cookie session
```
