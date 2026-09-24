import { inArray } from "drizzle-orm";
import { getDb } from "../../../db";
import { products } from "../../../db/schema";
import { resolveDeliveryMethod } from "../../../lib/delivery-zones";
import { getStripe } from "../../../lib/stripe";

type BasketLine = { productId: number; quantity: number; mode: "once" | "repeat" | "hire" };

export async function POST(request: Request) {
  let stripe: ReturnType<typeof getStripe>;
  try {
    stripe = getStripe();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Stripe is not configured.";
    return Response.json({ error: message }, { status: 503 });
  }

  try {
    const payload = (await request.json()) as {
      items?: BasketLine[];
      postcode?: string;
      deliverySlot?: string;
    };
    const lines = Array.isArray(payload.items) ? payload.items : [];
    const postcode = typeof payload.postcode === "string" ? payload.postcode.trim().toUpperCase() : "";
    const deliverySlot = typeof payload.deliverySlot === "string" ? payload.deliverySlot.trim() : "";
    const deliveryMethod = postcode ? resolveDeliveryMethod(postcode) : null;

    if (!lines.length) {
      return Response.json({ error: "Your basket is empty." }, { status: 400 });
    }
    for (const line of lines) {
      if (!Number.isInteger(line.productId) || !Number.isInteger(line.quantity) || line.quantity < 1) {
        return Response.json({ error: "Invalid basket line." }, { status: 400 });
      }
    }

    const db = getDb();
    const productIds = [...new Set(lines.map((line) => line.productId))];
    const dbProducts = await db
      .select()
      .from(products)
      .where(inArray(products.id, productIds));

    const productById = new Map(dbProducts.map((product) => [product.id, product]));
    const missing = productIds.filter((id) => !productById.get(id)?.active);
    if (missing.length) {
      return Response.json(
        { error: "One or more items in your basket are no longer available." },
        { status: 409 }
      );
    }

    const requestedQuantity = new Map<number, number>();
    for (const line of lines) {
      requestedQuantity.set(line.productId, (requestedQuantity.get(line.productId) ?? 0) + line.quantity);
    }
    for (const [productId, quantity] of requestedQuantity) {
      const product = productById.get(productId)!;
      if (product.stock !== null && quantity > product.stock) {
        return Response.json(
          { error: `Only ${product.stock} of "${product.name}" left in stock.` },
          { status: 409 }
        );
      }
    }

    const lineItems = lines.map((line) => {
      const product = productById.get(line.productId)!;
      const modeLabel = line.mode === "repeat" ? " (repeat)" : line.mode === "hire" ? " (hire, per month)" : "";
      return {
        quantity: line.quantity,
        price_data: {
          currency: "gbp",
          unit_amount: product.priceCents,
          product_data: {
            name: `${product.name}${modeLabel}`,
            metadata: { productId: String(product.id), mode: line.mode },
          },
        },
      };
    });

    const origin = new URL(request.url).origin;
    const metadataItems = lines.map((line) => ({
      productId: line.productId,
      quantity: line.quantity,
      mode: line.mode,
    }));

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${origin}/?checkout=success`,
      cancel_url: `${origin}/?checkout=cancelled`,
      metadata: {
        items: JSON.stringify(metadataItems),
        postcode,
        deliverySlot,
        deliveryMethod: deliveryMethod ?? "",
      },
    });

    return Response.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return Response.json({ error: message }, { status: 500 });
  }
}
