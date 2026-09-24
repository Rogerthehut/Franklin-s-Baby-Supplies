import { and, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { customerFavourites } from "../../../../db/schema";
import { getCurrentCustomer } from "../../../../lib/auth";

export async function GET(request: Request) {
  const db = getDb();
  const customer = await getCurrentCustomer(request, db);
  if (!customer) return Response.json({ error: "Not signed in." }, { status: 401 });

  const rows = await db
    .select({ productId: customerFavourites.productId })
    .from(customerFavourites)
    .where(eq(customerFavourites.customerId, customer.id));

  return Response.json({ productIds: rows.map((r) => r.productId) });
}

export async function POST(request: Request) {
  const db = getDb();
  const customer = await getCurrentCustomer(request, db);
  if (!customer) return Response.json({ error: "Not signed in." }, { status: 401 });

  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const productId = Number(payload.productId);
    if (!Number.isInteger(productId) || productId <= 0) {
      return Response.json({ error: "Invalid product id." }, { status: 400 });
    }

    const [existing] = await db
      .select({ id: customerFavourites.id })
      .from(customerFavourites)
      .where(and(eq(customerFavourites.customerId, customer.id), eq(customerFavourites.productId, productId)));
    if (!existing) {
      await db.insert(customerFavourites).values({ customerId: customer.id, productId });
    }

    return Response.json({ ok: true }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return Response.json({ error: message }, { status: 500 });
  }
}
