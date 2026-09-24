import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { orderItems, orders, returnRequests } from "../../../db/schema";
import { requireAdmin } from "../../../lib/admin-auth";

const REASONS = ["No longer needed", "Arrived faulty or damaged", "Wrong item received", "Changed my mind", "Other"];
const RESOLUTIONS = ["refund", "exchange"];

export async function GET(request: Request) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const db = getDb();
    const rows = await db.select().from(returnRequests).orderBy(desc(returnRequests.id));
    return Response.json({ returnRequests: rows });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const orderId = Number(payload.orderId);
    const orderItemId = payload.orderItemId ? Number(payload.orderItemId) : null;
    const email = String(payload.email ?? "").trim().toLowerCase();
    const reason = String(payload.reason ?? "").trim();
    const details = String(payload.details ?? "").trim();
    const resolution = String(payload.resolution ?? "refund").trim();

    if (!Number.isInteger(orderId) || orderId <= 0 || !email) {
      return Response.json({ error: "Missing order number or email." }, { status: 400 });
    }
    if (!REASONS.includes(reason)) {
      return Response.json({ error: "Choose a valid reason." }, { status: 400 });
    }
    if (!RESOLUTIONS.includes(resolution)) {
      return Response.json({ error: "Choose refund or exchange." }, { status: 400 });
    }

    const db = getDb();
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    if (!order || (order.customerEmail ?? "").trim().toLowerCase() !== email) {
      return Response.json({ error: "We couldn't verify that order and email." }, { status: 404 });
    }

    if (orderItemId) {
      const [item] = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.id, orderItemId))
        .limit(1);
      if (!item || item.orderId !== order.id) {
        return Response.json({ error: "That item isn't part of this order." }, { status: 400 });
      }
    }

    const [returnRequest] = await db
      .insert(returnRequests)
      .values({
        orderId: order.id,
        orderItemId,
        reason: details ? `${reason}: ${details}` : reason,
        resolution,
        customerEmail: email,
      })
      .returning();

    return Response.json({ returnRequest }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return Response.json({ error: message }, { status: 500 });
  }
}
