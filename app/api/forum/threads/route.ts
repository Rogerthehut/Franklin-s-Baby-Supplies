import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { forumThreads } from "../../../../db/schema";
import { FORUM_CATEGORIES } from "../../../../lib/forum-categories";

export async function GET(request: Request) {
  try {
    const category = new URL(request.url).searchParams.get("category");

    const db = getDb();
    const rows = category
      ? await db.select().from(forumThreads).where(eq(forumThreads.category, category)).orderBy(desc(forumThreads.id))
      : await db.select().from(forumThreads).orderBy(desc(forumThreads.id));

    return Response.json({ threads: rows });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const category = String(payload.category ?? "").trim();
    const title = String(payload.title ?? "").trim();
    const body = String(payload.body ?? "").trim();
    const authorName = String(payload.authorName ?? "").trim();

    if (!(FORUM_CATEGORIES as readonly string[]).includes(category)) {
      return Response.json({ error: "Choose a topic category." }, { status: 400 });
    }
    if (!title || title.length > 120) {
      return Response.json({ error: "Give your topic a title, under 120 characters." }, { status: 400 });
    }
    if (!body || body.length > 4000) {
      return Response.json({ error: "Say a bit more: up to 4000 characters." }, { status: 400 });
    }
    if (!authorName || authorName.length > 60) {
      return Response.json({ error: "Add your name, under 60 characters." }, { status: 400 });
    }

    const db = getDb();
    const [thread] = await db
      .insert(forumThreads)
      .values({ category, title, body, authorName })
      .returning();

    return Response.json({ thread }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return Response.json({ error: message }, { status: 500 });
  }
}
