import { and, eq, gt } from "drizzle-orm";
import type { getDb } from "../db";
import { customerSessions, customers } from "../db/schema";

export const SESSION_COOKIE = "franklyns_session";
const SESSION_DAYS = 30;
const PBKDF2_ITERATIONS = 100_000;

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return bytes;
}

// Constant-time-ish comparison: length is revealed but hash contents aren't
// short-circuited on the first mismatching byte.
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function deriveBits(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt as BufferSource, iterations, hash: "SHA-256" },
    key,
    256
  );
  return new Uint8Array(bits);
}

// No native bcrypt/scrypt on the Workers runtime, so this uses Web Crypto's
// PBKDF2 directly. Format: pbkdf2$<iterations>$<saltHex>$<hashHex>.
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await deriveBits(password, salt, PBKDF2_ITERATIONS);
  return `pbkdf2$${PBKDF2_ITERATIONS}$${toHex(salt)}$${toHex(hash)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2") return false;
  const iterations = Number(parts[1]);
  const salt = fromHex(parts[2]);
  const hash = await deriveBits(password, salt, iterations);
  return timingSafeEqual(toHex(hash), parts[3]);
}

function sessionCookie(token: string, expiresAt: Date, secure: boolean): string {
  const attrs = [`${SESSION_COOKIE}=${token}`, "Path=/", "HttpOnly", "SameSite=Lax", `Expires=${expiresAt.toUTCString()}`];
  if (secure) attrs.push("Secure");
  return attrs.join("; ");
}

function clearSessionCookie(secure: boolean): string {
  const attrs = [`${SESSION_COOKIE}=`, "Path=/", "HttpOnly", "SameSite=Lax", "Max-Age=0"];
  if (secure) attrs.push("Secure");
  return attrs.join("; ");
}

export async function createSession(
  db: ReturnType<typeof getDb>,
  customerId: number,
  isSecureRequest: boolean
): Promise<{ header: string }> {
  const token = toHex(crypto.getRandomValues(new Uint8Array(32)));
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.insert(customerSessions).values({ id: token, customerId, expiresAt: expiresAt.toISOString() });
  return { header: sessionCookie(token, expiresAt, isSecureRequest) };
}

export function logoutCookieHeader(isSecureRequest: boolean): string {
  return clearSessionCookie(isSecureRequest);
}

function readSessionToken(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie") ?? "";
  for (const part of cookieHeader.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === SESSION_COOKIE) return rest.join("=");
  }
  return null;
}

export type CurrentCustomer = { id: number; email: string; name: string | null };

export async function getCurrentCustomer(
  request: Request,
  db: ReturnType<typeof getDb>
): Promise<CurrentCustomer | null> {
  const token = readSessionToken(request);
  if (!token) return null;

  const [row] = await db
    .select({ id: customers.id, email: customers.email, name: customers.name })
    .from(customerSessions)
    .innerJoin(customers, eq(customerSessions.customerId, customers.id))
    .where(and(eq(customerSessions.id, token), gt(customerSessions.expiresAt, new Date().toISOString())))
    .limit(1);

  return row ?? null;
}

export async function destroySession(db: ReturnType<typeof getDb>, request: Request) {
  const token = readSessionToken(request);
  if (!token) return;
  await db.delete(customerSessions).where(eq(customerSessions.id, token));
}

export function isHttps(request: Request): boolean {
  return new URL(request.url).protocol === "https:";
}
