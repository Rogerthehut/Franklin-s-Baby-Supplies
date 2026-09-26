import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { customers } from "../../../../db/schema";
import { createSession, hashPassword, isHttps } from "../../../../lib/auth";
import { checkRateLimit, clientIp, rateLimitResponse } from "../../../../lib/rate-limit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const db = getDb();
    if (!(await checkRateLimit(db, `signup:${clientIp(request)}`, 5, 600))) {
      return rateLimitResponse();
    }

    const payload = (await request.json()) as Record<string, unknown>;
    const email = String(payload.email ?? "").trim().toLowerCase();
    const password = String(payload.password ?? "");
    const name = payload.name ? String(payload.name).trim() : null;

    if (!EMAIL_RE.test(email)) {
      return Response.json({ error: "Enter a valid email address." }, { status: 400 });
    }
    if (password.length < 8) {
      return Response.json({ error: "Use a password of at least 8 characters." }, { status: 400 });
    }

    const [existing] = await db.select({ id: customers.id }).from(customers).where(eq(customers.email, email)).limit(1);
    if (existing) {
      return Response.json({ error: "An account with that email already exists. Try signing in instead." }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const [customer] = await db.insert(customers).values({ email, passwordHash, name }).returning();
    const { header } = await createSession(db, customer.id, isHttps(request));

    return Response.json(
      { customer: { id: customer.id, email: customer.email, name: customer.name } },
      { status: 201, headers: { "Set-Cookie": header } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return Response.json({ error: message }, { status: 500 });
  }
}
