import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { customerBaskets } from "../../../../db/schema";
import { getCurrentCustomer } from "../../../../lib/auth";

export async function GET(request: Request) {
  const db = getDb();
  const customer = await getCurrentCustomer(request, db);
  if (!customer) return Response.json({ error: "Not signed in." }, { status: 401 });

  const [row] = await db
    .select({ linesJson: customerBaskets.linesJson })
    .from(customerBaskets)
    .where(eq(customerBaskets.customerId, customer.id));

  let lines: unknown[] = [];
  try {
    lines = row ? JSON.parse(row.linesJson) : [];
  } catch {
    lines = [];
  }

  return Response.json({ lines });
}

export async function PUT(request: Request) {
  const db = getDb();
  const customer = await getCurrentCustomer(request, db);
  if (!customer) return Response.json({ error: "Not signed in." }, { status: 401 });

  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const lines = Array.isArray(payload.lines) ? payload.lines : [];
    const linesJson = JSON.stringify(lines).slice(0, 20_000);

    await db
      .insert(customerBaskets)
      .values({ customerId: customer.id, linesJson })
      .onConflictDoUpdate({
        target: customerBaskets.customerId,
        set: { linesJson, updatedAt: new Date().toISOString() },
      });

    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return Response.json({ error: message }, { status: 500 });
  }
}
