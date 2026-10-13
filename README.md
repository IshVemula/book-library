# My Library

A personal log of the books I've read: title, author, genre, date finished, rating, notes, and cover (via ISBN from Open Library).

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

`GET /api/books?q=&genre=&sort=recent|title|author|rating` returns the library as JSON.

## Structure

```
src/
  app/
    page.tsx              library grid with search, genre filter, sort, stats
    books/[id]/           book detail, edit page
    books/new/            add page
    login/                owner login
    api/books/route.ts    JSON API
    actions.ts            server actions (save, delete, login, logout)
  components/             Cover, Stars, BookForm, DeleteButton
  lib/
    db.ts                 Postgres connection (Neon or PGlite) + schema
    books.ts              book queries
    auth.ts               signed-cookie session
```
