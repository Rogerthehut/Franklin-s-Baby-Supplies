import { asc, eq } from "drizzle-orm";
import { getDb } from "../../../../../db";
import { forumReplies, forumThreads } from "../../../../../db/schema";

export async function GET(
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
    const [thread] = await db.select().from(forumThreads).where(eq(forumThreads.id, threadId));
    if (!thread) {
      return Response.json({ error: "That topic no longer exists." }, { status: 404 });
    }
    const replies = await db
      .select()
      .from(forumReplies)
      .where(eq(forumReplies.threadId, threadId))
      .orderBy(asc(forumReplies.id));

    return Response.json({ thread, replies });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return Response.json({ error: message }, { status: 500 });
  }
}
