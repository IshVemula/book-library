import { cookies } from "next/headers";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";

const COOKIE = "library_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days, in seconds

function adminPassword() {
  const value = process.env.ADMIN_PASSWORD;
  if (!value) throw new Error("ADMIN_PASSWORD is not set");
  return value;
}

// SESSION_SECRET is optional so a fresh deploy only needs ADMIN_PASSWORD.
// Without it, derive a key from the password and database URL (which holds
// the database's own password). Changing the admin password logs everyone out.
function sessionSecret() {
  return (
    process.env.SESSION_SECRET ||
    createHash("sha256").update(`session:${adminPassword()}:${process.env.DATABASE_URL ?? "local"}`).digest("hex")
  );
}

function sign(value: string) {
  return createHmac("sha256", sessionSecret()).update(value).digest("base64url");
}

// Hash both sides first so the comparison is constant-time regardless of length.
function safeEqual(a: string, b: string) {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function checkPassword(password: string) {
  return safeEqual(password, adminPassword());
}

export async function isAdmin() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return false;
  const [expires, signature] = token.split(".");
  if (!expires || !signature || Number(expires) < Date.now()) return false;
  return safeEqual(signature, sign(expires));
}

export async function startSession() {
  const expires = String(Date.now() + MAX_AGE * 1000);
  (await cookies()).set(COOKIE, `${expires}.${sign(expires)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}
