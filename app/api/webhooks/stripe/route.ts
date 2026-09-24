import { env } from "cloudflare:workers";
import { eq, sql } from "drizzle-orm";
import Stripe from "stripe";
import { getDb } from "../../../../db";
import { orderItems, orders, products } from "../../../../db/schema";
import { getStripe } from "../../../../lib/stripe";

type MetadataItem = { productId: number; quantity: number; mode: "once" | "repeat" | "hire" };

export async function POST(request: Request) {
  if (!env.STRIPE_WEBHOOK_SECRET) {
    return Response.json({ error: "STRIPE_WEBHOOK_SECRET is not configured." }, { status: 500 });
  }

  let stripe: ReturnType<typeof getStripe>;
  try {
    stripe = getStripe();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Stripe is not configured.";
    return Response.json({ error: message }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature ?? "", env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid signature";
    return Response.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return Response.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const db = getDb();

  const existing = await db
    .select({ id: orders.id })
    .from(orders)
    .where(eq(orders.stripeSessionId, session.id))
    .limit(1);
  if (existing.length) {
    return Response.json({ received: true, alreadyProcessed: true });
  }

  let items: MetadataItem[] = [];
  try {
    items = JSON.parse(session.metadata?.items ?? "[]");
  } catch {
    items = [];
  }

  const [order] = await db
    .insert(orders)
    .values({
      stripeSessionId: session.id,
      stripePaymentIntentId:
        typeof session.payment_intent === "string" ? session.payment_intent : null,
      status: "paid",
      customerEmail: session.customer_details?.email ?? null,
      totalCents: session.amount_total ?? 0,
      postcode: session.metadata?.postcode || null,
      deliverySlot: session.metadata?.deliverySlot || null,
      deliveryMethod: session.metadata?.deliveryMethod || null,
    })
    .returning();

  for (const item of items) {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, item.productId))
      .limit(1);

    await db.insert(orderItems).values({
      orderId: order.id,
      productId: item.productId,
      productName: product?.name ?? `Product ${item.productId}`,
      unitPriceCents: product?.priceCents ?? 0,
      quantity: item.quantity,
      mode: item.mode,
    });

    if (product && product.stock !== null) {
      await db
        .update(products)
        .set({ stock: sql`max(${products.stock} - ${item.quantity}, 0)` })
        .where(eq(products.id, item.productId));
    }
  }

  return Response.json({ received: true, orderId: order.id });
}
