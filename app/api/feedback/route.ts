import { desc } from "drizzle-orm";
import { getDb } from "../../../db";
import { feedbackIdeas } from "../../../db/schema";

export async function GET() {
  try {
    const db = getDb();
    const rows = await db.select().from(feedbackIdeas).orderBy(desc(feedbackIdeas.votes), desc(feedbackIdeas.id));
    return Response.json({ ideas: rows });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const title = String(payload.title ?? "").trim();
    const details = String(payload.details ?? "").trim();
    const submitterEmail = payload.submitterEmail ? String(payload.submitterEmail).trim() : null;

    if (!title) {
      return Response.json({ error: "Give your idea a short title." }, { status: 400 });
    }
    if (title.length > 120) {
      return Response.json({ error: "Keep the title under 120 characters." }, { status: 400 });
    }

    const db = getDb();
    const [idea] = await db
      .insert(feedbackIdeas)
      .values({ title, details, submitterEmail })
      .returning();

    return Response.json({ idea }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return Response.json({ error: message }, { status: 500 });
  }
}
