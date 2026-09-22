import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { products } from "../../../db/schema";
import { requireAdmin } from "../../../lib/admin-auth";

function toRouteErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "Unexpected error";
  if (message.includes("no such table") || message.includes('from "products"')) {
    return "The products table is unavailable. Generate the migration locally with `npm run db:generate`, apply it to D1, then deploy.";
  }
  return message;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const includeInactive = url.searchParams.get("all") === "1";

    if (includeInactive) {
      const authError = requireAdmin(request);
      if (authError) return authError;
    }

    const db = getDb();
    const rows = includeInactive
      ? await db.select().from(products).orderBy(desc(products.id))
      : await db
          .select()
          .from(products)
          .where(eq(products.active, true))
          .orderBy(desc(products.id));

    return Response.json({ products: rows });
  } catch (error) {
    return Response.json({ error: toRouteErrorMessage(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const payload = (await request.json()) as Record<string, unknown>;

    const sku = String(payload.sku ?? "").trim();
    const name = String(payload.name ?? "").trim();
    const brand = String(payload.brand ?? "").trim();
    const category = String(payload.category ?? "").trim();
    const stage = String(payload.stage ?? "").trim();
    const unit = String(payload.unit ?? "").trim();
    const perUnit = String(payload.perUnit ?? "").trim();
    const details = String(payload.details ?? "");
    const badge = payload.badge ? String(payload.badge) : null;
    const imageKey = payload.imageKey ? String(payload.imageKey) : null;
    const isHire = Boolean(payload.isHire);
    const priceCents = Number(payload.priceCents);
    const stock =
      payload.stock === null || payload.stock === undefined || payload.stock === ""
        ? null
        : Number(payload.stock);

    if (!sku || !name || !brand || !category || !stage || !unit || !perUnit) {
      return Response.json(
        { error: "sku, name, brand, category, stage, unit and perUnit are all required." },
        { status: 400 }
      );
    }
    if (!Number.isFinite(priceCents) || priceCents < 0) {
      return Response.json({ error: "priceCents must be a non-negative number." }, { status: 400 });
    }

    const db = getDb();
    const [product] = await db
      .insert(products)
      .values({
        sku,
        name,
        brand,
        category,
        stage,
        priceCents: Math.round(priceCents),
        unit,
        perUnit,
        badge,
        details,
        isHire,
        imageKey,
        stock,
      })
      .returning();

    return Response.json({ product }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    if (message.includes("UNIQUE constraint failed")) {
      return Response.json({ error: "A product with that SKU already exists." }, { status: 409 });
    }
    return Response.json({ error: toRouteErrorMessage(error) }, { status: 500 });
  }
}
