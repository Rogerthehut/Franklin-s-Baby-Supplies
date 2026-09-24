import { getDb } from "../../../../db";
import { getCurrentCustomer } from "../../../../lib/auth";

export async function GET(request: Request) {
  const db = getDb();
  const customer = await getCurrentCustomer(request, db);
  if (!customer) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }
  return Response.json({ customer });
}
