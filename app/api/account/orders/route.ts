import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { orderItems, orders } from "../../../../db/schema";
import { getCurrentCustomer } from "../../../../lib/auth";

export async function GET(request: Request) {
  const db = getDb();
  const customer = await getCurrentCustomer(request, db);
  if (!customer) return Response.json({ error: "Not signed in." }, { status: 401 });

  const customerOrders = await db
    .select()
    .from(orders)
    .where(eq(orders.customerId, customer.id))
    .orderBy(desc(orders.id));

  const orderList = await Promise.all(
    customerOrders.map(async (order) => ({
      order,
      items: await db.select().from(orderItems).where(eq(orderItems.orderId, order.id)),
    }))
  );

  return Response.json({ orders: orderList });
}
