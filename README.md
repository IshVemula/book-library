# 📚 Shelf Indulgence

A cozy online bookshelf: a highly biased record of every book you've devoured.

- Books stand on wooden shelves, grouped by **reading status, author, series or genre**, shown as covers, as **spines** packed side by side, or as a compact list
- Mark books as **Read**, **Currently reading**, **Want to read** or **Did not finish** (with where you stopped)
- **Import your whole Goodreads library** in one go: shelves, ratings, reviews, series and reread counts
- Add a book by typing its title or ISBN, and the **author, cover and genre fill in automatically** (via [Open Library](https://openlibrary.org))
- **Up next:** finished book 2 of a series? Book 3 shows up at the top of your shelves
- Log **rereads** with their own rating and notes, and keep track of **who you lent a book to** (private to you)
- Ratings, notes, live search
- Anyone with the link can browse your shelf; only you (with your password) can change it
- Works on phones, with light and dark mode

## Get your own bookshelf (free, about 3 minutes)

You don't need to know how to code. You'll need a free [GitHub](https://github.com/signup) account.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FIshVemula%2Fbook-library&project-name=my-bookshelf&repository-name=my-bookshelf&env=ADMIN_PASSWORD&envDescription=The+password+you+will+use+to+log+in+and+add+books.+Pick+something+only+you+know.&envLink=https%3A%2F%2Fgithub.com%2FIshVemula%2Fbook-library%23setup-details&stores=%5B%7B%22type%22%3A%22integration%22%2C%22integrationSlug%22%3A%22neon%22%2C%22productSlug%22%3A%22neon%22%2C%22protocol%22%3A%22storage%22%7D%5D)

1. **Click the button above** and sign in to Vercel with your GitHub account.
2. **Follow the steps.** Vercel will:
   - copy this project into your GitHub account,
   - create a free database for your books (just accept the defaults),
   - ask you for a **password**. This is what you'll use to log in and add books, so pick something only you know.
3. **Click Deploy** and wait a minute or two.

That's it! You'll get a link like `my-bookshelf-abc.vercel.app`. To add books, open that link, click **Log in**, and enter your password.

> 💡 Bookmark your link and share it with friends. They can see your shelf but can't change anything.

## Using your bookshelf

| To… | Do this |
| --- | --- |
| Bring over your Goodreads books | Log in → **+ Add book** → *Import your whole library*, then follow the steps |
| Add a book | Log in → **+ Add book** → search for the title → click the right result → **Add to shelf** |
| Change a cover | Open the book → **Edit** → under the cover, **Upload image**, drop a file on it, or paste an image or image link (e.g. copied from Google) |
| Make a series' covers match | Group by **Series** → **Match covers** next to the series name (or **Match series covers** on a book's page) → pick a matching set → **Save** |
| Log a reread | Open the book → **+ Log a reread** |
| Lend a book | Open the book → type who has it → **Lend** (only you see this) |
| Change a book's status | Open the book → click *Currently reading*, *Read* or *Want to read* |
| Edit or delete a book | Open the book → **Edit** or **Delete** |
| Rearrange your shelves | Use **Group by**, **Sort** and the shelf/list buttons above your books |
| Change your password | Vercel → your project → **Settings → Environment Variables** → edit `ADMIN_PASSWORD` → then **Deployments → ⋯ → Redeploy** |

## Customizing it

Your copy of the code lives in your own GitHub account, and every change you push there updates your site automatically. Some easy places to start:

- **Colors:** the top of [`src/app/globals.css`](src/app/globals.css) (light mode first, dark mode below it)
- **Site name and fonts:** [`src/app/layout.tsx`](src/app/layout.tsx)
- **Home page heading:** [`src/app/page.tsx`](src/app/page.tsx)

You can edit files right on github.com: open the file, click the ✏️ pencil icon, then **Commit changes**.

---

## Setup details

For developers, or for setting things up by hand.

### Settings (environment variables)

| Name | Required | What it's for |
| --- | --- | --- |
| `ADMIN_PASSWORD` | Yes | The password for logging in and editing books. |
| `DATABASE_URL` | In production | Postgres connection string. Added automatically when you connect Neon on Vercel. |
| `SESSION_SECRET` | No | Random string for signing the login cookie. If unset, one is derived from the password and database URL. |
| `GOOGLE_BOOKS_API_KEY` | Recommended | Free Google Books API key, so cover search also checks Google Books. Without it, only Open Library is used (Google's keyless quota is effectively always used up). |
| `PGLITE_PATH` | No | Local only: where the embedded dev database lives (default `./.pglite`). |

### Run it on your computer

Requires [Node.js](https://nodejs.org) 20+.

```bash
git clone https://github.com/IshVemula/book-library.git
cd book-library
npm install
cp .env.example .env.local   # then set ADMIN_PASSWORD in .env.local
npm run dev
```

Then open http://localhost:3000. Locally the books are stored in an embedded Postgres database (`./.pglite`), so there's nothing else to install. Database tables are created and updated automatically on startup.

### Deploy by hand (instead of the button)

1. Fork this repo.
2. On [vercel.com](https://vercel.com): **Add New → Project** → import your fork.
3. **Storage → Create Database → Neon** and connect it to the project (this sets `DATABASE_URL`).
4. **Settings → Environment Variables**: add `ADMIN_PASSWORD`.
5. **Deployments → ⋯ → Redeploy**.

### API

`GET /api/books?q=&genre=&sort=added|title|author|rating` returns the shelf as JSON.

### Tech and structure

Next.js 15 (App Router, Server Actions) · Postgres (Neon in production, PGlite locally) · Vercel.

```
src/
  app/
    page.tsx              bookshelf / list view with grouping, status tabs, search, stats
    books/[id]/           book page and edit page
    books/new/            add-a-book page
    login/                owner login
    import/               Goodreads import
    api/books/route.ts    public JSON API
    api/lookup/route.ts   Open Library search for auto-fill (owner only)
    api/covers/[id]/      serves uploaded cover images (stored in the database)
    api/image-proxy/      fetches pasted image links for resizing (owner only)
    actions.ts            server actions: books, status, lending, rereads, import, login
  components/             Shelf, SpineShelf, BookList, UpNext, ImportForm, BookForm, …
  lib/
    db.ts                 database connection + automatic migrations
    types.ts              shared types and constants (safe for client components)
    books.ts              book queries
    group.ts              grouping by status / author / series / genre
    upnext.ts             "next in series" suggestions
    goodreads.ts          Goodreads CSV parser
    auth.ts               password login with a signed cookie
```

## License

[MIT](LICENSE). Free to use, copy and change; just keep the copyright notice.

Icons: [Lucide](https://lucide.dev) and [Lucide Lab](https://github.com/lucide-icons/lucide-lab) (ISC), plus the dragon from [Tabler Icons](https://tabler.io/icons) (MIT).
