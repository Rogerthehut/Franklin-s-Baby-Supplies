import { and, eq } from "drizzle-orm";
import { getDb } from "../../../../../db";
import { customerFavourites } from "../../../../../db/schema";
import { getCurrentCustomer } from "../../../../../lib/auth";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  const db = getDb();
  const customer = await getCurrentCustomer(request, db);
  if (!customer) return Response.json({ error: "Not signed in." }, { status: 401 });

  const productId = Number((await params).productId);
  if (!Number.isInteger(productId) || productId <= 0) {
    return Response.json({ error: "Invalid product id." }, { status: 400 });
  }

  await db
    .delete(customerFavourites)
    .where(and(eq(customerFavourites.customerId, customer.id), eq(customerFavourites.productId, productId)));

  return Response.json({ ok: true });
}
