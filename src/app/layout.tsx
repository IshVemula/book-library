import type { Metadata } from "next";
import { Inter, Newsreader } from "next/font/google";
import Link from "next/link";
import { logout } from "./actions";
import { isAdmin } from "@/lib/auth";
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
            {admin ? (
              <>
                <Link href="/books/new" className="button primary">
                  + Add book
                </Link>
                <form action={logout}>
                  <button type="submit" className="button ghost">
                    Log out
                  </button>
                </form>
              </>
            ) : (
              <Link href="/login" className="button ghost">
                Log in
              </Link>
            )}
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
