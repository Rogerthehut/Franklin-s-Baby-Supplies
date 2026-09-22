import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { products } from "../../../../db/schema";
import { requireAdmin } from "../../../../lib/admin-auth";

function parseId(idParam: string) {
  const id = Number(idParam);
  return Number.isInteger(id) && id > 0 ? id : null;
}

const EDITABLE_FIELDS = [
  "sku",
  "name",
  "brand",
  "category",
  "stage",
  "unit",
  "perUnit",
  "details",
  "badge",
  "imageKey",
  "isHire",
  "priceCents",
  "stock",
  "active",
] as const;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const { id: idParam } = await params;
  const id = parseId(idParam);
  if (!id) return Response.json({ error: "Invalid product id." }, { status: 400 });

  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const update: Record<string, unknown> = {};

    for (const field of EDITABLE_FIELDS) {
      if (!(field in payload)) continue;
      if (field === "priceCents") {
        const value = Number(payload.priceCents);
        if (!Number.isFinite(value) || value < 0) {
          return Response.json({ error: "priceCents must be a non-negative number." }, { status: 400 });
        }
        update.priceCents = Math.round(value);
      } else if (field === "stock") {
        update.stock =
          payload.stock === null || payload.stock === "" ? null : Number(payload.stock);
      } else if (field === "isHire" || field === "active") {
        update[field] = Boolean(payload[field]);
      } else {
        const value = payload[field];
        update[field] = value === null ? null : String(value);
      }
    }

    if (Object.keys(update).length === 0) {
      return Response.json({ error: "No editable fields were provided." }, { status: 400 });
    }
    update.updatedAt = new Date().toISOString();

    const db = getDb();
    const [product] = await db
      .update(products)
      .set(update)
      .where(eq(products.id, id))
      .returning();

    if (!product) return Response.json({ error: "Product not found." }, { status: 404 });
    return Response.json({ product });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    if (message.includes("UNIQUE constraint failed")) {
      return Response.json({ error: "A product with that SKU already exists." }, { status: 409 });
    }
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const { id: idParam } = await params;
  const id = parseId(idParam);
  if (!id) return Response.json({ error: "Invalid product id." }, { status: 400 });

  try {
    const db = getDb();
    const [product] = await db
      .update(products)
      .set({ active: false, updatedAt: new Date().toISOString() })
      .where(eq(products.id, id))
      .returning();

    if (!product) return Response.json({ error: "Product not found." }, { status: 404 });
    return Response.json({ product });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return Response.json({ error: message }, { status: 500 });
  }
}
