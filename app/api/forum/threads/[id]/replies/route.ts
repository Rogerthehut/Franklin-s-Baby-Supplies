import { eq, sql } from "drizzle-orm";
import { getDb } from "../../../../../../db";
import { forumReplies, forumThreads } from "../../../../../../db/schema";
import { checkRateLimit, clientIp, rateLimitResponse } from "../../../../../../lib/rate-limit";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const threadId = Number(id);
    if (!Number.isInteger(threadId) || threadId <= 0) {
      return Response.json({ error: "Invalid topic id." }, { status: 400 });
    }

    const db = getDb();
    if (!(await checkRateLimit(db, `forum-reply:${clientIp(request)}`, 15, 600))) {
      return rateLimitResponse();
    }

    const payload = (await request.json()) as Record<string, unknown>;
    const body = String(payload.body ?? "").trim();
    const authorName = String(payload.authorName ?? "").trim();

    if (!body || body.length > 4000) {
      return Response.json({ error: "Say a bit more: up to 4000 characters." }, { status: 400 });
    }
    if (!authorName || authorName.length > 60) {
      return Response.json({ error: "Add your name, under 60 characters." }, { status: 400 });
    }

    const [thread] = await db.select().from(forumThreads).where(eq(forumThreads.id, threadId));
    if (!thread) {
      return Response.json({ error: "That topic no longer exists." }, { status: 404 });
    }

    const [reply] = await db.insert(forumReplies).values({ threadId, body, authorName }).returning();
    await db
      .update(forumThreads)
      .set({ replyCount: sql`${forumThreads.replyCount} + 1` })
      .where(eq(forumThreads.id, threadId));

    return Response.json({ reply }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return Response.json({ error: message }, { status: 500 });
  }
}
