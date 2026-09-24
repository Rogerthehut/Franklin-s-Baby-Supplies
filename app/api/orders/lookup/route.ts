import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { orderItems, orders } from "../../../../db/schema";

// Guest order lookup for the returns wizard: order id + the email on the order
// must both match, so this can't be used to enumerate other customers' orders.
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const orderId = Number(url.searchParams.get("orderId"));
    const email = (url.searchParams.get("email") ?? "").trim().toLowerCase();

    if (!Number.isInteger(orderId) || orderId <= 0 || !email) {
      return Response.json({ error: "Enter a valid order number and email address." }, { status: 400 });
    }

    const db = getDb();
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);

    if (!order || (order.customerEmail ?? "").trim().toLowerCase() !== email) {
      return Response.json(
        { error: "We couldn't find an order matching that order number and email." },
        { status: 404 }
      );
    }

    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));

    return Response.json({ order, items });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return Response.json({ error: message }, { status: 500 });
  }
}
