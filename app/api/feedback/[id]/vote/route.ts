import { and, eq, sql } from "drizzle-orm";
import { getDb } from "../../../../../db";
import { feedbackIdeas, feedbackVotes } from "../../../../../db/schema";
import { isHttps } from "../../../../../lib/auth";
import { checkRateLimit, clientIp, rateLimitResponse } from "../../../../../lib/rate-limit";
import { readVoterId, voterCookieHeader } from "../../../../../lib/voter";

// One vote per (idea, voterId) is enforced here via feedbackVotes, not just
// trusted from the client's claimed direction: the up/down toggle in the UI
// is a courtesy, this is what actually stops it being replayed.
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

    const db = getDb();
    if (!(await checkRateLimit(db, `feedback-vote:${clientIp(request)}`, 30, 600))) {
      return rateLimitResponse();
    }

    const payload = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const direction = payload.direction === "down" ? -1 : 1;

    const existingVoterId = readVoterId(request);
    const voterId = existingVoterId ?? crypto.randomUUID();

    const [existingVote] = await db
      .select()
      .from(feedbackVotes)
      .where(and(eq(feedbackVotes.ideaId, ideaId), eq(feedbackVotes.voterId, voterId)))
      .limit(1);

    let idea;
    if (direction === 1 && !existingVote) {
      try {
        await db.insert(feedbackVotes).values({ ideaId, voterId });
        [idea] = await db
          .update(feedbackIdeas)
          .set({ votes: sql`${feedbackIdeas.votes} + 1` })
          .where(eq(feedbackIdeas.id, ideaId))
          .returning();
      } catch {
        // Unique constraint hit: a near-simultaneous request from the same
        // voter already recorded this vote. Treat it as already applied.
        [idea] = await db.select().from(feedbackIdeas).where(eq(feedbackIdeas.id, ideaId)).limit(1);
      }
    } else if (direction === -1 && existingVote) {
      await db.delete(feedbackVotes).where(eq(feedbackVotes.id, existingVote.id));
      [idea] = await db
        .update(feedbackIdeas)
        .set({ votes: sql`max(${feedbackIdeas.votes} - 1, 0)` })
        .where(eq(feedbackIdeas.id, ideaId))
        .returning();
    } else {
      // "up" while already voted, or "down" with no vote on record: no-op,
      // just report the idea as it stands.
      [idea] = await db.select().from(feedbackIdeas).where(eq(feedbackIdeas.id, ideaId)).limit(1);
    }

    if (!idea) {
      return Response.json({ error: "That idea no longer exists." }, { status: 404 });
    }

    const headers = new Headers();
    if (!existingVoterId) headers.set("Set-Cookie", voterCookieHeader(voterId, isHttps(request)));

    return Response.json({ idea }, { headers });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return Response.json({ error: message }, { status: 500 });
  }
}
