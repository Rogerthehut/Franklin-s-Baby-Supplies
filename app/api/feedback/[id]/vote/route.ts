import { eq, sql } from "drizzle-orm";
import { getDb } from "../../../../../db";
import { feedbackIdeas } from "../../../../../db/schema";

// Un-voting relies on the client only calling this again once it already
// recorded the vote locally (see the feedback board's localStorage-tracked
// voted-ids); there are no accounts yet to enforce one-vote-per-person server-side.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ideaId = Number(id);
    if (!Number.isInteger(ideaId) || ideaId <= 0) {
      return Response.json({ error: "Invalid idea id." }, { status: 400 });
    }

    const payload = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const direction = payload.direction === "down" ? -1 : 1;

    const db = getDb();
    const [idea] = await db
      .update(feedbackIdeas)
      .set({ votes: sql`max(${feedbackIdeas.votes} + ${direction}, 0)` })
      .where(eq(feedbackIdeas.id, ideaId))
      .returning();

    if (!idea) {
      return Response.json({ error: "That idea no longer exists." }, { status: 404 });
    }

    return Response.json({ idea });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return Response.json({ error: message }, { status: 500 });
  }
}
