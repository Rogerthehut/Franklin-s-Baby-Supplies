import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { customers } from "../../../../db/schema";
import { createSession, isHttps, verifyPassword } from "../../../../lib/auth";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const email = String(payload.email ?? "").trim().toLowerCase();
    const password = String(payload.password ?? "");

    if (!email || !password) {
      return Response.json({ error: "Enter your email and password." }, { status: 400 });
    }

    const db = getDb();
    const [customer] = await db.select().from(customers).where(eq(customers.email, email)).limit(1);
    if (!customer || !(await verifyPassword(password, customer.passwordHash))) {
      return Response.json({ error: "Incorrect email or password." }, { status: 401 });
    }

    const { header } = await createSession(db, customer.id, isHttps(request));

    return Response.json(
      { customer: { id: customer.id, email: customer.email, name: customer.name } },
      { headers: { "Set-Cookie": header } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return Response.json({ error: message }, { status: 500 });
  }
}
