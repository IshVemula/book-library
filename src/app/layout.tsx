import type { Metadata } from "next";
import { Inter, Newsreader } from "next/font/google";
import { Library, LogIn, LogOut, Plus } from "lucide-react";
import Link from "next/link";
import { logout } from "./actions";
import { Providers } from "@/components/Providers";
import { isAdmin } from "@/lib/auth";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const sans = Inter({ variable: "--font-sans", subsets: ["latin"] });
const serif = Newsreader({ variable: "--font-serif", subsets: ["latin"], style: ["normal", "italic"] });

export const metadata: Metadata = {
  title: { default: "Shelf Indulgence", template: "%s · Shelf Indulgence" },
  description: "A highly biased record of every book I've devoured.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const admin = await isAdmin();

  return (
    <html lang="en">
      <body className={`${sans.variable} ${serif.variable}`}>
        <header className="site-header">
          <Link href="/" className="brand">
            Shelf Indulgence
          </Link>
          <nav>
            <Link href="/shelf" className="button ghost" aria-label="Shelves" title="Shelves">
              <Library aria-hidden /> <span className="nav-label">Shelves</span>
            </Link>
            {admin ? (
              <>
                <Link href="/books/new" className="button primary" aria-label="Add book" title="Add book">
                  <Plus aria-hidden /> <span className="nav-label">Add book</span>
                </Link>
                <form action={logout}>
                  <button type="submit" className="button ghost" aria-label="Log out" title="Log out">
                    <LogOut aria-hidden /> <span className="nav-label">Log out</span>
                  </button>
                </form>
              </>
            ) : (
              <Link href="/login" className="button ghost" aria-label="Log in" title="Log in">
                <LogIn aria-hidden /> <span className="nav-label">Log in</span>
              </Link>
            )}
          </nav>
        </header>
        <main>
          <Providers>{children}</Providers>
        </main>
        <footer className="site-footer">
          Covers from{" "}
          <a href="https://openlibrary.org" target="_blank" rel="noreferrer">
            Open Library
          </a>{" "}
          and{" "}
          <a href="https://books.google.com" target="_blank" rel="noreferrer">
            Google Books
          </a>
          .
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
